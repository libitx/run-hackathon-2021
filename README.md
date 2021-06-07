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

### [🚨 👉 Check Out Shfty Nfts here 👈 🚨](https://shfty.chronoslabs.net)

The **Shfty Nfts** app is a functioning app that explores the following usecases:

* Artwork NFTs where the digital artwork is both embedded inside the token and secured with signatures and encryption. When a token holder sells the artwork, they pass on not only the token, but also the access to the data within.
* On-chain messaging/email service where each message is a token and only the holder can read the message.
* On-chain file-sharing service with the same properties.

As this is a hackathon app, the following caveats apply:

* The app relies on RUNs public cache APIs which are development tools. If things break, this is probably why. A production app would need its own cache.
* Currently can only send tokens to other Shfty users. This is just for pragmatism, in fact existing Paymail capabilities would allow broader adoption of Shfty Nfts if other wallets chose to support it.

The Shfty Nfts stack consists of:

* Minimal Phoenix back end app
* SQLite database - again for pragmatism - any database can be used in production.
* Alpine.js for light-weight sprinklings of JavaScript goodies

The app source code can be found at the path `app`. A few of the highlights include...

### 1. Novel pure Bitcoin authentication mechanism

This isn't really RUN specific but I think it's cool and worth mentioning. When signing in a wallet is deterministically generated client-side using a `pbkdf` process on the username and password. To authenticate the client signs a masked CSRF token and sends the signature, token and xpub to the server. If the token and the signature is valid, the app lets the user in. **No passwords ever go over the wire**.

Some code worth checking out:

* Client-side [Wallet class](https://github.com/libitx/run-hackathon-2021/blob/master/app/assets/js/util/wallet.js) and [Sign in component](https://github.com/libitx/run-hackathon-2021/blob/master/app/assets/js/components/sign-in.js)
* Server-side [Auth module](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty/auth/auth.ex), [Auth plug](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty/auth/plug.ex) and [Auth controller](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty_web/controllers/auth_controller.ex)

### 2. Shfty Nfty minter

Users can mint their own **Shfty Nft** jigs. A Univrse envelope is created containing any data payload, either text or binary data. I have limited the payload to 300kb out of courtesy to RUN's public APIs but in theory BSV happily supports 10 MB transactions today. The envelope is signed by the minter so future recipients can always verify their token against the original minters signature. Finally the payload is encrypted and wrapped in an NFT jig.

Key code to check out:

* [The minter page JavaScript component](https://github.com/libitx/run-hackathon-2021/blob/master/app/assets/js/components/minter.js)
* [The minter page HTML view](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty_web/live/components/minter.html.leex)

### 3. Send functionality

Users can send their **Shfty Nft** jigs to other users. This is where things get a little funky. Ideally the re-encryption should happen inside the RUN context but that's not currently possible so we have to pull the Univrse Envelope out of the jig, decrypt it, re-encrypt it for the new recipient, update the jig and send it on.

Currently this functionality is limited to sending to other Shfty users. A websocket API is used to query users by username and returns their owner address and identity pubkey. However this functionality is standard Paymail stuff so there is no reason why Shfty Nfts can't be sent to any paymail user.

The code worth checking out:

* [The token page JavaScript component](https://github.com/libitx/run-hackathon-2021/blob/master/app/assets/js/components/token.js) (check out the `send()` function)
* [The token page HTML view](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty_web/live/components/token.html.leex)
* [Server-side socket API for searching users](https://github.com/libitx/run-hackathon-2021/blob/master/app/lib/shfty_web/live/wallet_live.ex)

### 4. Custom Paypresto purse

Credit where it's due, [Joshua already cracked this](https://mint.tique.run/dist/classes.js). I wanted to generalise this solution so it can be packaged up in the [paypresto.js](https://github.com/libitx/paypresto.js) library.

My solution involves provding a `beforePay()` callback (used to mount the widget in the HTML doc), and a `afterPay()` callback to handle any after effects once the RUN transaction is broadcast.

* [Check out the Paypresto Purse class code](https://github.com/libitx/run-hackathon-2021/blob/master/app/assets/js/util/presto-purse.js)

The usage API looks like this:

```javascript
import { PrestoPurse, embed } from 'paypresto.js'

const purse = new PrestoPurse({
  key: wallet.purse.privKey,
  description: 'Shfty shenanigans',
  beforePay: payment => {
    payment.mount(embed('#paypresto'))
  },
  afterPay: _tx => {
    location.replace('/thanks')
  }
})

const run = new Run({
  purse,
  ...
})
```

I think that's nice and simple. I plan to release this as part of paypresto soon - once I've sat on the API design for a few days and satisfied myself it is right. 👍

## RUN specific code

In creating **Shfty Nfts**, I have added a handful of code creations to the RUN network.

### 1. `U` Berry class

The `U` class loads external [Univrse](https://univrse.network/) envelope transactions into a JavaScript object for use in your jigs.

| code | network | source         | location                                                                       |
| ---- | ------- | -------------- | ------------------------------------------------------------------------------ |
| `U`  | `main`  | [code](u-code) | [`73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o1`](u-loc) |

[u-code]: <https://github.com/libitx/run-hackathon-2021/blob/master/run/extras/u.js>
[u-loc]: <https://run.network/explorer/?query=73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o1&network=main>

Example:

```javascript
const U = await run.load('73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o1')

// Load Univrse with full outpoint address
const env = U.load('ae0d9a823a577978bd2e92658590cf1877aad8cadd11224112b660a8cfb6b3f0.out.0')
// Or load the first found Univrse object from a txid
const env = U.load('ae0d9a823a577978bd2e92658590cf1877aad8cadd11224112b660a8cfb6b3f0')

// API
env.header        // => envelope header object
env.payload       // => envelope payload
env.signature     // => if present, signature object or array of signatures
env.recipient     // => if present, recipient object or array of recipients
env.$rawHex       // => the raw envelope is also stored as a hex string
```

### 2. Sidekick code for decoding Univrse envelopes

The `Envelope` class is used to decode raw Univrse binary data into a structured Envelope object. The `CBOR` class decodes Concise Binary Object Representation data into JavaScript values.

This is a minimal implementation of Univrse and the Envelope class does not provide the following:

* **Crypto** - implementing all the crypto algorithms in pure JavaScript and without the convenience of web crypto sounds like a fun task if you're a complete psychopath. Plus the limitations of the RUN environment - no big numbers, no random numbers - makes me question whether its even feasible?
* **Encoding** - I omitted CBOR and Envelope encoding for brevity. Because we can't sign or encrypt within RUN, it feels low priority. For now, if you want to manipulate the Univrse envelope, it must be pulled outside of RUN and put back in as a new binary value.


| code       | network | source            | location                                                                          |
| ---------- | ------- | ----------------- | --------------------------------------------------------------------------------- |
| `Envelope` | `main`  | [code](env-code)  | [`73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o2`](enc-loc)  |
| `CBOR`     | `main`  | [code](cbor-code) | [`73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o3`](cbor-loc) |

[env-code]: <https://github.com/libitx/run-hackathon-2021/blob/master/run/extras/envelope.js>
[env-loc]: <https://run.network/explorer/?query=73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o2&network=main>
[cbor-code]: <https://github.com/libitx/run-hackathon-2021/blob/master/run/extras/cbor.js>
[cbor-loc]: <https://run.network/explorer/?query=73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o3&network=main>

Credit where it's due. The original authors of the CBOR code:

* [cbor-redux](https://github.com/aaronhuggins/cbor-redux) - Copyright (c) 2020-2021 Aaron Huggins - MIT License
* [cbor-js](https://github.com/paroga/cbor-js) - Copyright (c) 2014-2016 Patrick Gansterer - MIT License

### 3. Jig classes for Univrse envelopes

Introducing **Shfty Nfts** and **Limited Shfty Nfts**. Two basic Jig classes that can be used to tokenise Univrse envelopes. The limited class acts as a base class which can be extended from to create limited run NFTs.

| code              | network | source                | location                                                                               |
| ----------------- | ------- | --------------------- | -------------------------------------------------------------------------------------- |
| `ShftyNft`        | `main`  | [code](shfty-code)    | [`48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o1`](shifty-loc)    |
| `LimitedShftyNft` | `main`  | [code](lm-shfty-code) | [`48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o2`](lm-shifty-loc) |

[shfty-code]: <https://github.com/libitx/run-hackathon-2021/blob/master/run/jigs/shfty-nft.js>
[shfty-loc]: <https://run.network/explorer/?query=48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o1&network=main>
[lm-shfty-code]: <https://github.com/libitx/run-hackathon-2021/blob/master/run/jigs/limited-shfty-nft.js>
[lm-shfty-loc]: <https://run.network/explorer/?query=48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o2&network=main>

**ShftyNft** Examples:

```javascript
import { Envelope } from 'univrse'

const ShftyNft = await run.load('48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o1')

// Creating a ShftyNft token from a U berry
const env1 = U.load('ae0d9a823a577978bd2e92658590cf1877aad8cadd11224112b660a8cfb6b3f0.out.0')
const token1 = new ShftyNft(env1)

// API (same as U example above)
token1.env.raw     // => raw envelope Uint8Array
token1.env.header  // => envelope header object
// etc...

// Create a ShftyNft token from an encrypted Envelope
const env2 = Envelope.wrap('This is a token', { proto: 'foo.bar' })
await env2.encrypt(ownerKey, { alg: 'ECDH-ES+A128GCM' })
const buf2 = env2.toBuffer()
const token2 = new ShftyNft( new Uint8Array(buf2.buffer, buf2.byteOffset, buf2.byteLength) )

// Sending the token to a new recipient
const buf3 = Buffer.from(token2.env.$rawHex, 'hex')
const env3 = Envelope.fromBuffer(buf3)
await env3.decrypt(ownerKey)
await env3.encrypt(recipientKey, { alg: 'ECDH-ES+A128GCM' })
const buf4 = env3.toBuffer()
token2.send(recipientAddr, new Uint8Array(buf4.buffer, buf4.byteOffset, buf4.byteLength))
```

**LimitedShftyNft** Examples:

```javascript
// Creating a limited run Shfty Nft token
const LimitedShftyNft = await run.load('48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o2')
class MyNFT extends LimitedShftyNft {}
MyNFT.total = 100

// Token must be created with `mint()` function
const token = MyNFT.mint(env)
// error will be thrown if `mint()` called more than 100 times

// API
token.num         // => 1
token.env         // => as above
```

---

## Thank you

Thank you for taking the time to check out [Shfty Nfts](https://shfty.chronoslabs.net) and this README. 🙏

Copyright © 2021 libitx