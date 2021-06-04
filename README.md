# Run Hackathon 2021

This repository is the submission for the Run Hackathon 2021 from team **Shfty**.

![Shfty](https://github.com/libitx/run-hackathon-2021/raw/master/media/shfty.png)

**Team:**

* [libitx](https://github.com/libitx)

## Objectives

The overarching objective is simply to get some experience playing with RUN and create and share ways of integrating RUN with some of my own tools. 

1. Create a Berry class for loading [Univrse](https://univrse.network/) transactions into jigs ✅
2. Create sidekick code for decoding Univrse envelopes in the RUN context ✅
3. Create a jig class for creating NFTs from Univrse envelopes
4. Experiment with using [paypresto](https://www.paypresto.co) as a RUN purse and if needed create a mega simply library that makes it as easy as possible for others
5. Build a mega simple POC app for minting and sending **Shfty Nfts**

## 1. `U` Berry class

The `U` class loads external [Univrse](https://univrse.network/) envelope transactions into a JavaScript object for use in your jigs.

| code | network | location                                                              |
| ---- | ------- | --------------------------------------------------------------------- |
| `U`  | `main`  | `69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o1` |

Example:

```javascript
const U = await run.load('69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o1')

// Load Univrse with full outpoint address
const env = U.load('ae0d9a823a577978bd2e92658590cf1877aad8cadd11224112b660a8cfb6b3f0.out.0')
// Or load the first found Univrse object from a txid
const env = U.load('ae0d9a823a577978bd2e92658590cf1877aad8cadd11224112b660a8cfb6b3f0')

// API
env.raw           // => raw envelope Uint8Array
env.header        // => envelope header object
env.payload       // => envelope payload
env.signature     // => if present, signature object or array of signatures
env.recipient     // => if present, recipient object or array of recipients
```

## 2. Sidekick code for decoding Univrse envelopes

The `Envelope` class is used to decode raw Univrse binary data into a structured Envelope object. The `CBOR` class decodes Concise Binary Object Representation data into JavaScript values.

| code       | network | location                                                              |
| ---------- | ------- | --------------------------------------------------------------------- |
| `Envelope` | `main`  | `69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o2` |
| `CBOR`     | `main`  | `69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o3` |

Credit for the CBOR code:

* [cbor-redux](https://github.com/aaronhuggins/cbor-redux) - Copyright (c) 2020-2021 Aaron Huggins - MIT License
* [cbor-js](https://github.com/paroga/cbor-js) - Copyright (c) 2014-2016 Patrick Gansterer - MIT License

...