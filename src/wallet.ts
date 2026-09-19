import { createContext, signBsm } from '@1sat/actions';
import { OneSatServices } from '@1sat/client';
import { connectWallet, type ConnectWalletResult } from '@1sat/connect';
import { Transaction } from '@bsv/sdk';

import { createBitsigclickOutputScript, decodeGameAction } from './action-queue.ts';
import type { ActionQueue, GameAction } from './action-queue.ts';

const services = new OneSatServices('main');
const ACTION_DESCRIPTION_PREFIX = 'Bitcoin Clicker:';

export interface SignedActionBatch {
    actions: GameAction[];
    messageHex: string;
    signature: string;
    address?: string;
    publicKey?: string;
}

export interface BroadcastedActionBatch extends SignedActionBatch {
    signatureOutput: string;
    txid: string;
}

export function createSignatureOutput(batch: SignedActionBatch): string {
    if (!batch.publicKey) throw new Error('Wallet did not return a public key');

    const signatureHex = Array.from(atob(batch.signature), (character) =>
        character.charCodeAt(0).toString(16).padStart(2, '0'),
    ).join('');
    return createBitsigclickOutputScript(batch.publicKey, signatureHex);
}

type WalletContext = ReturnType<typeof createContext>;

export class WalletService {
    private connection: ConnectWalletResult | null = null;
    private context: WalletContext | null = null;

    get connected(): boolean {
        return this.connection !== null;
    }

    get identityKey(): string | null {
        return this.connection?.identityKey ?? null;
    }

    async connect(): Promise<string> {
        const connection = await connectWallet({ autoDetect: true });
        if (!connection) throw new Error('No compatible BRC-100 wallet was found');

        this.connection = connection;
        this.context = createContext(connection.wallet, { chain: 'main', services });
        return connection.identityKey;
    }

    disconnect(): void {
        this.connection?.disconnect();
        this.connection = null;
        this.context = null;
    }

    async signQueue(queue: ActionQueue): Promise<SignedActionBatch | null> {
        if (!this.context) throw new Error('Connect a wallet before signing the queue');

        const actions = queue.snapshot();
        if (actions.length === 0) return null;

        const messageHex = actions.map((action) => action.outputScriptHex).join('');
        const result = await signBsm.execute(this.context, {
            message: messageHex,
            encoding: 'hex',
        });

        if (result.error || !result.sig) {
            throw new Error(result.error ?? 'Wallet did not return a signature');
        }

        return {
            actions,
            messageHex,
            signature: result.sig,
            address: result.address,
            publicKey: result.pubKey,
        };
    }

    async signAndBroadcast(queue: ActionQueue): Promise<BroadcastedActionBatch | null> {
        if (!this.connection) throw new Error('Connect a wallet before broadcasting the queue');

        const batch = await this.signQueue(queue);
        if (!batch) return null;

        const signatureOutput = createSignatureOutput(batch);
        const result = await this.connection.wallet.createAction({
            description: `Bitcoin Clicker: ${batch.actions.length} game actions`,
            outputs: [
                ...batch.actions.map((action) => ({
                    lockingScript: action.outputScriptHex,
                    satoshis: 0,
                    outputDescription: `Bitcoin Clicker ${action.type} action`,
                })),
                {
                    lockingScript: signatureOutput,
                    satoshis: 0,
                    outputDescription: 'Bitcoin Clicker action signature',
                },
            ],
            options: { acceptDelayedBroadcast: false },
        });

        if (!result.txid) throw new Error('Wallet did not return a broadcast transaction ID');

        queue.remove(batch.actions.map((action) => action.id));
        return { ...batch, signatureOutput, txid: result.txid };
    }

    async loadActions(): Promise<GameAction[]> {
        if (!this.connection) throw new Error('Connect a wallet before loading blockchain state');

        const history = await this.connection.wallet.listActions({ labels: [], limit: 1000 });
        const transactions = history.actions.filter((action) =>
            action.description.startsWith(ACTION_DESCRIPTION_PREFIX),
        );
        const loadedActions: GameAction[] = [];

        for (const action of transactions) {
            const rawTransaction = await services.getRawTx(action.txid);
            if (!rawTransaction.rawTx) continue;
            const transaction = Transaction.fromBinary(rawTransaction.rawTx);
            for (const output of transaction.outputs) {
                const decoded = decodeGameAction(output.lockingScript.toHex());
                if (decoded) loadedActions.push({ ...decoded, createdAt: 0 });
            }
        }

        return loadedActions.sort((left, right) => left.timestamp - right.timestamp);
    }
}
