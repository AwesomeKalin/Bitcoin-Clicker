# Bitcoin Clicker

Clicker game running on the BSV blockchain. This project (currently) primarily exists for me to test out the capabilities of generative AI, and as such is entirely AI generated.

## Wallet and action queue

The project uses Deno with Vite and Phaser. Game actions are added to an in-memory `ActionQueue`; clicks are currently serialized using the protocol in `protocol/click.md`, and future actions can provide their own type and output script. Clicking never creates a transaction, asks the wallet to sign, or broadcasts anything.

Upgrades are defined in `src/upgrades.ts`, so adding or replacing a temporary catalog entry does not require changing the game scene. Each purchase is allowed once, deducts its sat cost, applies its click bonus, and queues the protocol `01` upgrade action with the upgrade's two-byte ID.

Devices are defined in `src/devices.ts` and rendered dynamically in the center column. They can be purchased repeatedly or in batches of up to 255. Each batch queues one protocol `02` action containing the one-byte device ID and quantity. Prices use `base price * 1.5^purchased quantity`, summed per unit for bulk purchases, and devices generate their configured sats per second.

Every queued action now includes its Unix timestamp. The timestamp is encoded as big-endian bytes with its byte length before the action opcode, and the queue stores the same timestamp used to build the output script.

Balances use integer tenths-of-a-sat internally: `10n` represents `1 sat` and `1n` represents `0.1 sat`. `bigint` prevents floating-point drift. Display values compact at powers of 1000: `1k`, `1m`, `1t`, `1q`, `1A`, `1B`, then continuing through generated letter suffixes.

The game layout uses the full window on PC and tablet screens: the clicker is on the left, the reserved devices area is in the center, and the dynamic upgrades panel is on the right. Wallet controls sit in the bottom-right corner. Phone-sized or short screens are blocked with a platform message.

The wallet service is loaded with a dynamic import only after `Connect wallet` is pressed. Players can therefore start and play without a wallet, and the initial Phaser bundle does not include the blockchain provider packages.

After connection, the game checks the action queue every 120 seconds. If actions are waiting, the wallet prompts for a BSM signature over their concatenated output scripts, then creates and broadcasts one transaction containing the action outputs and serialized `bitsigclick` output. The queue is cleared only after the wallet returns a transaction ID. Failed or rejected operations leave the actions queued for the next interval.

`WalletService` connects to a BRC-100 wallet through Yours Wallet's `@1sat/connect` package. Its `signAndBroadcast(queue)` method owns the complete batch flow and uses the wallet's BRC-100 `createAction` method with delayed broadcasting disabled.

Run the app with:

```sh
deno task dev
```

The `Connect wallet` button connects the installed BRC-100 wallet. Signing is intentionally not triggered by connecting or clicking.
