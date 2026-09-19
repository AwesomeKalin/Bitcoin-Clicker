# Bitcoin Clicker protocol

This is the protocol in which Bitcoin Clicker will use to push game data to the blockchain.

All actions have the following script template:

```
OP_0 OP_RETURN 626974636c69636b <version> <timestamp_len> <timestamp> <game_op_code> <op_code_params>
```

626974636c69636b, being the hex representation of bitclick, is to allow indexers to easily recognise Bitcoin Clicker transaction.

The version parameter is what version of the game this transaction is for. Version is one byte, however if said one byte is ff, then a second byte should be used for versioning, if that byte is ff, then that byte should be used etc. Currently, version is 00.

timestamp_len is the length of the timestamp.

timestamp is the current unix time of the action.

The game_op_code parameter is the action that is currently being done in said output. The list of op codes can be found below.

The op_code_params parameter is the information, if any, that the op code requires. Please see the individual op codes for more information.

To allow for reduced user wallet interactions and to allow bundling should this game be ported to other blockchains or any other purposes that may require bundling (e.g. payment of tx fees in fiat), the wallet performing the action is instead stored in a seperate OP_RETURN, which can be found below:

```
OP_0 OP_RETURN 626974736967636c69636b <address> <signature>
```

626974736967636c69636b is the hex representation of bitsigclick to allow indexers and game clients to easily recongnise that this output is a signature for Bitcoin Clicker outputs.

address is the hex representation of the bitcoin public ket performing the action. It does NOT have to be one of the wallets sending/receiving coins in the transaction. It would be the like when a public key is included in P2PK.

signature is a signature created from the previous bitclick outputs in the transaction. It is created from concatinating all bitclick outputs between the previous bitsigclick output, including the OP_0 and OP_RETURN, and this output. This can then be used to verify if the relevant outputs are valid.

bitsigclick is intentionally versionless, as it does not need one. If quantum resistance is needed in the future, a new header would be added to show that it is quantum resistant. This was chosen instead of a flag as there is currently no quantum resistant standard on BSV.

Example transaction:

Input:

0 - P2PKH for tx fee

Output:

0 - bitclick output

1 - bitclick output

2 - bitclick output

3 - bitsigclick output, wallet x, created by concatinating output 0, 1 and 2

4 - P2PKH change output

In the above example, only one wallet is performing bitclick actions. bitsigclick is created from outputs 0, 1, and 2 and is signed against the public key included.

Example transaction #2:

Input:

0 - P2PKH for tx fee

Output:

0 - bitclick output

1 - Ordinal output

2 - bitclick output

3 - bitsigclick output, wallet x, created from output 0 and 2

4 - P2PKH change output

In the above example, only output 0 and 2 create the signature. This is because output 1 is not a bitclick output and is instead an ordinal. This is not unique to ordinals and also applies to any other kind of transaction, such as a smart contract or a P2PKH output.

Example transaction #3:

Input:

0 - P2PKH for tx fee

Output:

0 - OP_RETURN stating bundler's name

1 - bitclick output

2 - bitclick output

3 - bitclick output

4 - bitsigclick output, wallet x, created from output 1, 2, and 3

5 - bitclick output

6 - bitclick output

7 - bitclick output

8 - bitclick output

9 - bitsigclick output, wallet y, created from output 5, 6, 7, and 8

10 - P2PKH change output

In the above example, two wallets are making several bitclick actions. Output 0 is not used in any signature creation as it is only for onlookers to see it was created by a specific bundler. Output 4 uses output 1, 2, and 3 for its signature as those are the outputs that lie before it. Output 4 does not sign anything after it as those outputs relate to a different wallet. Output 9 uses outputs 5, 6, 7, and 8 as those outputs are between output 4 and 9, therefore those are the actions relating to wallet y.

If there was anything in between bitclick outputs in the above example, they still would not get signed.

All actions are to be performed in the order they appear on chain. Let's say the order on chain was example 2, 3 then 1. Firstly, outputs 0, then 2 from example 2 would be performed should the signature in output 3 be valid. Then outputs 1, 2, then 3 would be performed from example 3 should the signature in output 4 be valid, then outputs 5, 6, 7, then 8 from example 3 would be performed should output 9 have a valid signature. Finally, outputs 0, 1, then 2 from example 1 would be performed, providing that output 3 contained a valid signature.

Actions cannot have mismatched timestamps and if an action claims to be done earlier than an action that is seen already, it will be rejected. However, actions with the same timestamp as ones done earlier are permitted. The timestamp also cannot be later than the current blocks timestamp, however can be earlier than the previous blocks timestamp, providing it follows the rest of the rules.

Here are the current op-codes:

00 - [Click](click.md)
01 - [Upgrades](upgrades.md)
02 - [Devices](devices.md)
