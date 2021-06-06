import { PubKey } from 'bsv'
import { Envelope, util } from 'univrse/dist/univrse.esm.js'
import { embed } from 'paypresto.js'
import Wallet from '../util/wallet'
import PrestoPurse from '../util/presto-purse'
import { fileIconClass } from '../util/helpers'

const component = function() {
  let run
  const wallet = Wallet.load()

  return {
    ownerAddress: wallet.ownerAddress,
    pending: true,
    jig: null,
    payload: null,
    ready: false,
    sending: false,
    searched: false,

    user: {
      username: '',
      address: null,
      pubkey: null
    },

    jigName() {
      return this.jig?.metadata?.name || this.jig.constructor.metadata.name
    },

    jigDesc() {
      return this.jig?.metadata?.description || this.jig.constructor.metadata.description
    },

    fileSize(size) {
      const i = Math.floor( Math.log(size) / Math.log(1024) )
      return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
    },

    fileIconClass,

    isText() {
      return (!this.jig.env.header.cty || this.jig.env.header.cty == 'text/plain')
    },

    isImage() {
      return (this.jig.env.header.cty && /^image\//.test(this.jig.env.header.cty))
    },

    isFile() {
      return !this.isText() && !this.isImage()
    },

    dataUrl() {
      if (this.ready && this.payload) {
        return `data:${ this.jig.env.header.cty };base64,${ this.payload.toString('base64') }`
      }
    },

    async init(location) {
      const purse = new PrestoPurse({
        key: wallet.purse.privKey,
        description: 'Shfty Nft minter',
        onBefore: payment => {
          payment.mount(embed(this.$refs.paypresto))
        },
        onAfter: tx => {
          console.log(tx)
          //setTimeout(_ => {
          //  window.liveSocket.redirect('/wallet')
          //}, 2500)
        }
      })

      run = new window.Run({
        network: 'main',
        owner: wallet.owner.privKey.toWif(),
        purse,
        trust: [
          '73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d',
          '48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c'
        ]
      })
      run.activate()

      this.jig = await run.load(location)
      this.pending = false
    },

    async decrypt() {
      const env = Envelope.fromBuffer( Buffer.from(this.jig.env.$rawHex, 'hex') )
      if (env.recipient) {
        await env.decrypt(wallet.identityKey)
      }
      this.payload = env.payload
      this.ready = true
    },

    async destroy() {
      if (confirm('Are you sure? This action cannot be undone.')) {
        this.jig.destroy()
        await this.jig.sync()
        window.liveSocket.redirect('/wallet')
      }
    },

    lookup() {
      this.$el.livePushEvent('user.search', this.user.username, user => {
        this.searched = true
        if (user) {
          this.user = user
        }
      })
    },

    async send() {
      return alert("Unfortunately I couldn't got sending functioning by the end of the hackthon. Sad!")

      const env = Envelope.fromBuffer( Buffer.from(this.jig.env.$rawHex, 'hex') )
      if (env.recipient) {
        await env.decrypt(wallet.identityKey)
      }
      env.recipient = null
      const { address, pubkey } = this.user
      const key = util.fromBsvPubKey( PubKey.fromHex(pubkey) )
      await env.encrypt(key, { alg: 'ECDH-ES+A128GCM', kid: address })
      console.log(address, env.toBuffer())
      await this.jig.send(address)
    }
  }
}

const hook = {
  mounted() {
    console.log('liveview hoow')
    this.el.livePushEvent = (...args) => this.pushEvent(...args)
  }
}

export default {
  component,
  hook
}