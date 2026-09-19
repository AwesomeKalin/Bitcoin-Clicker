# 01 - Upgrades

The upgrades op-code is for when an upgrade is purchased. This is only considered valid when the player has enough sats to make the purchase, otherwise it is ignored. Upgrades can only purchased once, so repeat purchases can be ignored.

It can be done as such:

```
OP_0 OP_RETURN 626974636c69636b <version> <timestamp_len> <timestamp> 01 <upgrade_id>
```

upgrade_id is two byte, which is the upgrade's id. A list can be found below of the upgrades.

0000 - Faster fingers - Increases click rate by 1 sat/click - 100 sats

0100 - Rapid fingers - Increases click rate by 10 sats/click - 1000 sats
