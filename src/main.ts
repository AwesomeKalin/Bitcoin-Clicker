import Phaser from 'phaser';
import './style.css';
import { ActionQueue, type GameAction } from './action-queue.ts';
import { deviceBulkCost, deviceUnitCost, devices } from './devices.ts';
import { formatSats, satsToUnits, SAT_UNITS } from './sats.ts';
import { upgrades } from './upgrades.ts';
import type { DeviceDefinition } from './device-types.ts';
import type { UpgradeDefinition } from './upgrade-types.ts';

const SIGNING_INTERVAL_MS = 120_000;

interface SignedActionBatch {
    actions: GameAction[];
    messageHex: string;
    signature: string;
    address?: string;
    publicKey?: string;
}

class ClickerScene extends Phaser.Scene {
    private coins = 0n;
    private satsPerClick = BigInt(SAT_UNITS);
    private satsPerSecond = 0n;
    private coinLabel!: Phaser.GameObjects.Text;
    private productionLabel!: Phaser.GameObjects.Text;
    private clickRateLabel!: Phaser.GameObjects.Text;
    private queueLabel!: Phaser.GameObjects.Text;
    private readonly actionQueue = new ActionQueue();
    private wallet: {
        connect: () => Promise<string>;
        signQueue: (queue: ActionQueue) => Promise<SignedActionBatch | null>;
    } | null = null;
    private signingTimer: number | null = null;
    private countdownTimer: number | null = null;
    private nextBroadcastAt = 0;
    private signingInProgress = false;
    private readonly purchasedUpgradeIds = new Set<number>();
    private readonly deviceCounts = new Map<number, number>();

    constructor() {
        super('ClickerScene');
    }

    create() {
        this.add
            .text(320, 110, 'BITCOIN CLICKER', {
                color: '#f8f1df',
                fontFamily: 'Georgia, serif',
                fontSize: '34px',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        this.add
            .text(320, 158, 'Tap the coin to start stacking sats', {
                color: '#9d9a91',
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
            })
            .setOrigin(0.5);

        const coin = this.add
            .circle(320, 330, 112, 0xf7931a)
            .setStrokeStyle(8, 0xffc56b)
            .setInteractive({ useHandCursor: true });

        this.add
            .text(320, 330, 'B', {
                color: '#fff4d6',
                fontFamily: 'Georgia, serif',
                fontSize: '118px',
                fontStyle: 'bold',
            })
            .setOrigin(0.5, 0.54);

        this.coinLabel = this.add
            .text(320, 494, '0 sats', {
                color: '#f8f1df',
                fontFamily: 'Arial, sans-serif',
                fontSize: '30px',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        this.productionLabel = this.add
            .text(320, 532, '0 sats/sec', {
                color: '#f7931a',
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        this.clickRateLabel = this.add
            .text(320, 556, '0.1 sats/click', {
                color: '#f7931a',
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        this.queueLabel = this.add
            .text(320, 582, 'Next broadcast: --:--', {
                color: '#9d9a91',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
            })
            .setOrigin(0.5);

        coin.on('pointerdown', () => {
            this.coins += this.satsPerClick;
            this.actionQueue.addClick();
            this.updateBalanceLabels();
            this.tweens.add({ targets: coin, scale: 0.92, duration: 70, yoyo: true });
        });

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.coins += this.satsPerSecond;
                this.updateBalanceLabels();
            },
        });

        this.createWalletControls();
        this.createUpgradeControls();
        this.createDeviceControls();
    }

    private updateBalanceLabels(): void {
        this.coinLabel.setText(formatSats(this.coins));
        this.productionLabel.setText(`${formatSats(this.satsPerSecond)}/sec`);
        this.clickRateLabel.setText(`${formatSats(this.satsPerClick)}/click`);
        this.updateBroadcastCountdown();
    }

    private createDeviceControls(): void {
        const panel = document.createElement('section');
        panel.className = 'device-panel';
        panel.innerHTML = '<h2>Devices</h2><div class="device-list"></div>';
        document.querySelector('.devices-stage')?.append(panel);

        const list = panel.querySelector<HTMLDivElement>('.device-list')!;
        for (const device of devices) {
            const item = document.createElement('article');
            item.className = 'device-item';
            item.innerHTML = `
        <div class="device-info">
          <strong>${device.name}</strong>
          <small>${formatSats(device.productionPerSecondUnits)}/sec each</small>
          <small class="device-owned">Owned: 0</small>
        </div>
        <div class="device-buy">
          <input type="number" min="1" max="255" value="1" aria-label="Quantity of ${device.name}">
          <button type="button">Buy</button>
          <small class="device-cost">${formatSats(satsToUnits(device.baseCost))}</small>
        </div>
      `;

            const quantityInput = item.querySelector<HTMLInputElement>('input')!;
            const buyButton = item.querySelector<HTMLButtonElement>('button')!;
            const costLabel = item.querySelector<HTMLElement>('.device-cost')!;
            const ownedLabel = item.querySelector<HTMLElement>('.device-owned')!;
            const refresh = () =>
                this.refreshDeviceItem(device, quantityInput, costLabel, ownedLabel);

            quantityInput.addEventListener('input', refresh);
            buyButton.addEventListener('click', () =>
                this.purchaseDevice(device, quantityInput, buyButton, refresh),
            );
            list.append(item);
        }
    }

    private refreshDeviceItem(
        device: DeviceDefinition,
        quantityInput: HTMLInputElement,
        costLabel: HTMLElement,
        ownedLabel: HTMLElement,
    ): void {
        const owned = this.deviceCounts.get(device.id) ?? 0;
        const quantity = this.clampQuantity(quantityInput.valueAsNumber);
        quantityInput.value = String(quantity);
        costLabel.textContent = formatSats(satsToUnits(deviceBulkCost(device, owned, quantity)));
        ownedLabel.textContent = `Owned: ${owned} | Next: ${formatSats(satsToUnits(deviceUnitCost(device, owned)))} `;
    }

    private purchaseDevice(
        device: DeviceDefinition,
        quantityInput: HTMLInputElement,
        button: HTMLButtonElement,
        refresh: () => void,
    ): void {
        const quantity = this.clampQuantity(quantityInput.valueAsNumber);
        const owned = this.deviceCounts.get(device.id) ?? 0;
        const cost = deviceBulkCost(device, owned, quantity);
        const costUnits = satsToUnits(cost);
        if (this.coins < costUnits) {
            button.textContent = `Need ${formatSats(costUnits - this.coins)}`;
            window.setTimeout(() => {
                button.textContent = 'Buy';
            }, 1200);
            return;
        }

        this.coins -= costUnits;
        this.deviceCounts.set(device.id, owned + quantity);
        this.satsPerSecond += BigInt(device.productionPerSecondUnits * quantity);
        this.actionQueue.addDevice(device.id, quantity);
        this.updateBalanceLabels();
        refresh();
    }

    private clampQuantity(quantity: number): number {
        if (!Number.isFinite(quantity)) return 1;
        return Math.min(255, Math.max(1, Math.floor(quantity)));
    }

    private createUpgradeControls(): void {
        const panel = document.createElement('aside');
        panel.className = 'upgrade-panel';
        panel.innerHTML = '<h2>Upgrades</h2><div class="upgrade-list"></div>';
        document.querySelector('.upgrade-column')?.append(panel);

        this.renderUpgradeList(panel.querySelector<HTMLDivElement>('.upgrade-list')!);
    }

    private renderUpgradeList(list: HTMLDivElement): void {
        list.replaceChildren();
        const availableUpgrades = upgrades
            .filter((upgrade) => !this.purchasedUpgradeIds.has(upgrade.id))
            .slice(0, 2);

        for (const upgrade of availableUpgrades) {
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.innerHTML = `<div><strong>${upgrade.name}</strong><small>${upgrade.description}</small></div><button type="button">${formatSats(satsToUnits(upgrade.cost))}</button>`;
            const button = item.querySelector<HTMLButtonElement>('button')!;
            button.addEventListener('click', () => this.purchaseUpgrade(upgrade, button));
            list.append(item);
        }
    }

    private purchaseUpgrade(upgrade: UpgradeDefinition, button: HTMLButtonElement): void {
        if (this.purchasedUpgradeIds.has(upgrade.id)) return;
        const costUnits = satsToUnits(upgrade.cost);
        if (this.coins < costUnits) {
            button.textContent = `Need ${formatSats(costUnits - this.coins)}`;
            window.setTimeout(() => {
                if (!this.purchasedUpgradeIds.has(upgrade.id))
                    button.textContent = formatSats(satsToUnits(upgrade.cost));
            }, 1200);
            return;
        }

        this.coins -= costUnits;
        this.satsPerClick += satsToUnits(upgrade.satsPerClick);
        this.purchasedUpgradeIds.add(upgrade.id);
        this.actionQueue.addUpgrade(upgrade.id);
        this.updateBalanceLabels();
        button.closest('.upgrade-item')?.remove();
        const list = document.querySelector<HTMLDivElement>('.upgrade-list');
        if (list) this.renderUpgradeList(list);
    }

    private createWalletControls(): void {
        const controls = document.createElement('div');
        controls.className = 'wallet-controls';
        controls.innerHTML = `
      <button id="connect-wallet" type="button">Connect wallet</button>
      <span id="wallet-status">Wallet not connected</span>
    `;
        document.querySelector('#wallet-controls')?.append(controls);

        const button = controls.querySelector<HTMLButtonElement>('#connect-wallet')!;
        const status = controls.querySelector<HTMLSpanElement>('#wallet-status')!;
        button.addEventListener('click', async () => {
            button.disabled = true;
            status.textContent = 'Connecting...';
            try {
                const { WalletService } = await import('./wallet.ts');
                this.wallet ??= new WalletService();
                const identityKey = await this.wallet.connect();
                status.textContent = `Connected: ${identityKey.slice(0, 12)}...`;
                button.textContent = 'Wallet connected';
                this.startSigningTimer(status);
            } catch (error) {
                status.textContent = error instanceof Error ? error.message : 'Connection failed';
                button.disabled = false;
            }
        });
    }

    private startSigningTimer(status: HTMLSpanElement): void {
        if (this.signingTimer !== null) return;
        this.nextBroadcastAt = Date.now() + SIGNING_INTERVAL_MS;
        this.updateBroadcastCountdown();
        if (this.countdownTimer === null) {
            this.countdownTimer = window.setInterval(() => this.updateBroadcastCountdown(), 1000);
        }
        this.signingTimer = window.setInterval(() => {
            this.nextBroadcastAt = Date.now() + SIGNING_INTERVAL_MS;
            this.updateBroadcastCountdown();
            void this.requestSignature(status);
        }, SIGNING_INTERVAL_MS);
    }

    private updateBroadcastCountdown(): void {
        if (this.nextBroadcastAt === 0) return;

        const remainingSeconds = Math.max(0, Math.ceil((this.nextBroadcastAt - Date.now()) / 1000));
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        this.queueLabel.setText(
            `Next broadcast: ${minutes}:${seconds.toString().padStart(2, '0')}`,
        );
    }

    private async requestSignature(status: HTMLSpanElement): Promise<void> {
        if (!this.wallet || this.signingInProgress || this.actionQueue.size === 0) return;

        this.signingInProgress = true;
        this.queueLabel.setText('Signing queued actions...');
        status.textContent = 'Please approve the action batch in your wallet...';
        try {
            const batch = await this.wallet.signQueue(this.actionQueue);
            if (!batch) return;

            const { createSignatureOutput } = await import('./wallet.ts');
            const signatureOutput = createSignatureOutput(batch);
            console.group('Bitcoin Clicker action batch');
            console.log(
                'Action outputs:',
                batch.actions.map((action) => action.outputScriptHex),
            );
            console.log('Message signed:', batch.messageHex);
            console.log('bitsigclick output:', signatureOutput);
            console.groupEnd();
            this.actionQueue.remove(batch.actions.map((action) => action.id));
            status.textContent = 'Signed outputs logged to the console | Next prompt in 120s';
        } catch (error) {
            status.textContent = error instanceof Error ? error.message : 'Signing failed';
        } finally {
            this.signingInProgress = false;
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    parent: 'game-stage',
    backgroundColor: '#151515',
    scene: ClickerScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <main class="game-shell">
    <section id="game-stage" aria-label="Bitcoin Clicker"></section>
    <section class="devices-stage" aria-label="Devices"></section>
    <aside class="upgrade-column" aria-label="Upgrades"></aside>
  </main>
  <div id="wallet-controls"></div>
`;

new Phaser.Game(config);
