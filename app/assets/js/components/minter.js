import { Envelope } from 'univrse/dist/univrse.esm.js'
import { embed } from 'paypresto.js'
import Wallet from '../util/wallet'
import PrestoPurse from '../util/presto-purse'
import { bufToTypedArray, fileIconClass } from '../util/helpers'

const MAX_FILE_SIZE = 300000

const component = function() {
  let run, NFT;
  const wallet = Wallet.load()

  return {
    textPayload: '',
    dataPayload: null,
    meta: {
      name: null,
      description: null
    },
    isDragging: false,
    file: null,
    paying: false,

    async init() {
      const purse = new PrestoPurse({
        key: wallet.purse.privKey,
        description: 'Shfty Nft minter',
        beforePay: payment => {
          payment.mount(embed(this.$refs.paypresto, { style: ['rounded'] }))
        },
        afterPay: _tx => {
          setTimeout(_ => {
            window.liveSocket.redirect('/wallet')
          }, 2500)
        }
      })

      run = new Run({
        network: 'main',
        owner: wallet.owner.privKey.toWif(),
        //cache: new Run.plugins.LocalCache(),
        purse,
        trust: [
          '73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d',
          '48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c'
        ]
      })
      run.activate()
      NFT = await run.load('48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o1')
    },

    async drop(file) {
      this.isDragging = false
      if (file.size > MAX_FILE_SIZE) return alert('File size too large.')

      this.file = file
      const data = await file.arrayBuffer()
      this.dataPayload = Buffer.from(data)
    },

    fileSize(size) {
      const i = Math.floor( Math.log(size) / Math.log(1024) )
      return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
    },

    fileIconClass,

    async submit() {
      this.paying = true
      const payload = this.file ? this.dataPayload : this.textPayload;
      const cty     = this.file ? this.file.type : 'text/plain';
      const meta    = this.meta.name || this.meta.description ? this.meta : undefined;
      const env     = Envelope.wrap(payload, { proto: 'shfty.nft', cty })
      await env.sign(wallet.identityKey, { alg: 'ES256K', kid: wallet.identityAddress })
      await env.encrypt(wallet.identityKey, { alg: 'ECDH-ES+A128GCM', kid: wallet.identityAddress })

      new NFT(bufToTypedArray(env.toBuffer()), meta)
    }
  }
}

export default {
  component
}