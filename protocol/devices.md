# 02 - Devices

The devices op-code is for purchasing new devices for assisting with mining. A purchase is only considered valid when the player has enough sats, otherwise it is ignored. Devices, unlike upgrades, can be purchased an unlimited amount of times, and can also be bulk-purchased in a single action. There are no bulk-purchase discounts

It can be done as such:

```
OP_0 OP_REUTRN 626974636c69636b <version> <timestamp_len> <timestamp> 02 <device_id> <quantity>
```

device_id is the id of the device that is being purchased. It is one byte and the list of devices can be seen below. This list contains the base price as well as the base production speed. Upgrades can increase the production speed of sats.

quantity is the amount being purchased. It is limited to 255 at once and must be at least one.

All currently valid devices:

00 - Basic Miner - 0.1 sat/sec - 100 sats

01 - Pro Miner - 1 sat/sec - 500 sats

02 - Advanced Miner - 5 sat/sec - 3000 sats

The formula for the price is base price * (1.5)^(purchased quantity)
