# Run Hackathon 2021

This repository is the submission for the Run Hackathon 2021 from team **Shfty**.

![Shfty](https://github.com/libitx/run-hackathon-2021/raw/master/media/shfty.png)

#### Team:

* [libitx](https://github.com/libitx)

## Objectives

This Hackathon is the first time I have used RUN, so my personal goals are simply to get some experience playing with RUN and to create and share ways of integrating RUN with some of my own tools.

I'm particularly keen to integrate [Univrse](https://univrse.network/) with RUN, and experiment with creating NFTs secured with encryption. I'm also keen to nail how use [paypresto](https://www.paypresto.co) as a RUN purse and release a simple plug'n'play solution as part of the [paypresto.js](https://github.com/libitx/paypresto.js) library.

My objectives:

1. Create a Berry class for loading Univrse transactions into jigs ✅
2. Create sidekick code for decoding Univrse envelopes in the RUN context ✅
3. Create a jig class for creating NFTs that wrap Univrse data payloads directly ✅
4. Design a paypresto Purse class that is simple to use and integrate in others' apps ✅
5. Build a mega simple proof-of-concept app for minting and sending **Shfty Nfts** ✅

## Introducing "Shfty Nfts"

**Shfty Nfts** are secret NFTs where only the holder of the token is able to decrypt the content within. When a Shfty Nft is sent to someone else, the content is re-encrypted for the new recipient.

#### [👉 Check Out Shft Nfts here 👈](https://shfty.chronoslabs.net)

The **Shfty Nfts** app is a minimal Phoenix application, the source code can be found at the path `app`. There's lots of code in there but I'll highlight some of the juicy bits...

### 1. Novel pure Bitcoin authentication mechanism

This isn't really RUN specific but I think it's cool and worth mentioning. When signing in a wallet is deterministically generates client side using a `pbkdf` process on the username and password. Then to authenticate the client signs a masked CSRF token and sends the signature, token and xpub to the server. If the token and the signature is valid, the app lets the user in. **No passwords ever go over the wire**. Some code worth checking out:

* [Client-side Wallet class the derives from user credentials](https://github.com/libitx/run-hackathon-2021/blob/master/app/assets/js/util/wallet.js)
* Server-side [Auth module](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty/auth/auth.ex), [Auth plug](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty/auth/plug.ex) and [Auth controller](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty_web/controllers/auth_controller.ex)




### 1. `U` Berry class

The `U` class loads external [Univrse](https://univrse.network/) envelope transactions into a JavaScript object for use in your jigs.

| code | network | location                                                                                                                                                                                      |
| ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `U`  | `main`  | [`69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o1`](https://run.network/explorer/?query=69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o1&network=main) |

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

### 2. Sidekick code for decoding Univrse envelopes

The `Envelope` class is used to decode raw Univrse binary data into a structured Envelope object. The `CBOR` class decodes Concise Binary Object Representation data into JavaScript values.

This is a minimal implementation of Univrse and the Envelope class does not to the following:

* Any crypto - implementing all the crypto algorithms in pure JavaScript and without the convenience of web crypto sounds like a fun task if you're a psychopath. Plus the limitations of the RUN environment - no big numbers, no random numbers - means it probably isn't even feasible.
* Encoding - in theory it will be possible to add CBOR encoding, but because we can't sign or encrypt within RUN, it seems pointless. For now, if you want to manipulate the Univrse envelope, it must be pulled outside of RUN and put back in as a new binary value.


| code       | network | location                                                                                                                                                                                      |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Envelope` | `main`  | [`69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o2`](https://run.network/explorer/?query=69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o2&network=main) |
| `CBOR`     | `main`  | [`69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o3`](https://run.network/explorer/?query=69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70_o3&network=main) |

Credit for the CBOR code:

* [cbor-redux](https://github.com/aaronhuggins/cbor-redux) - Copyright (c) 2020-2021 Aaron Huggins - MIT License
* [cbor-js](https://github.com/paroga/cbor-js) - Copyright (c) 2014-2016 Patrick Gansterer - MIT License

## 3. Jig classes for Univrse envelopes

Introducing **Shfty Nfts** and **Limited Shfty Nfts**. Two basic Jig classes that can be used to tokenise Univrse envelopes. The limited class acts as a base class which can be extended from to create limited run NFTs.

| code                | network | location                                                                                                                                                                                      |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Shfty Nft`         | `main`  | [`dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o1`](https://run.network/explorer/?query=dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o1&network=main) |
| `Limited Shfty Nft` | `main`  | [`dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o2`](https://run.network/explorer/?query=dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o2&network=main) |

Examples:

```javascript
// Creating a simple Shfty Nft token
const ShftyNft = await run.load('dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o1')
const env = U.load('ae0d9a823a577978bd2e92658590cf1877aad8cadd11224112b660a8cfb6b3f0.out.0')
const token = new ShftyNft(env)

// API (same as U example above)
token.env.raw     // => raw envelope Uint8Array
token.env.header  // => envelope header object
// etc...

// Creating a limited run Shfty Nft token
const LimitedShftyNft = await run.load('dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o1')
class MyNFT extends LimitedShftyNft {}
MyNFT.total = 100

// Token must be created with `mint()` function
const token = MyNFT.mint(env)

// API
token.num         // => 1
token.env         // => as above
```

...