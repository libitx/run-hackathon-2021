import { Envelope } from 'univrse/dist/univrse.esm.js'
import Wallet from '../util/wallet'
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

    jigName() {
      return this.jig?.metadata?.name || this.jig.constructor.metadata.name
    },

    jigDesc() {
      return this.jig?.metadata?.description || this.jig.constructor.metadata.description
    },

    fileIconClass,

    isText() {
      return (!this.jig.env.header.cty || this.jig.env.header.cty == 'text/plain')
    },

    isImage() {
      return (this.jig.env.header.cty && /^image\//.test(this.jig.env.header.cty))
    },

    dataUrl() {
      if (this.ready && this.payload) {
        return `data:${ this.jig.env.header.cty };base64,${ this.payload.toString('base64') }`
      }
    },

    async init(location) {
      run = new window.Run({
        network: 'main',
        owner: wallet.owner.privKey.toWif(),
        trust: [
          '69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70',
          'dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc',
          '7976807fa3f75dfc3c63cbc3d6a416b9e8935652bbb369708ecab3c4b0c27754'
        ]
      })
      run.activate()

      this.jig = await run.load(location)
      this.pending = false
    },

    async decrypt() {
      const env = Envelope.fromBuffer(this.jig.env.raw)
      if (env.recipient) {
        await env.decrypt(wallet.identityKey)
      }
      this.payload = env.payload
      this.ready = true
    },

    async destroy() {
      console.log('destroying')
      if (confirm('Are you sure? This action cannot be undone.')) {
        this.jig.destroy()
        await this.jig.sync()
        window.liveSocket.redirect('/wallet')
      }
      
    }
  }
}

export default {
  component
}