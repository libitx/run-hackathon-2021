import { Envelope, Key } from 'univrse/dist/univrse.esm.js'
import Run from 'run-sdk'
import { embed } from 'paypresto.js'
import Wallet from '../util/wallet'
import PrestoPurse from '../util/presto-purse'
import { fileIconClass } from '../util/helpers'

function bufToTypedArray(buf) {
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
}

function camelize(str) {
  return str
    .replace(/\s(.)/g, c => c.toUpperCase())
    .replace(/(\W)/g, '')
}

const MAX_FILE_SIZE = 1000000

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

    async init() {
      const purse = new PrestoPurse({
        key: wallet.purse.privKey,
        description: 'Shfty Nft minter',
        onBefore: payment => {
          payment.mount(embed(this.$refs.paypresto))
        },
        onAfter: tx => {
          setTimeout(_ => {
            window.liveSocket.redirect('/wallet')
          }, 2500)
        }
      })

      run = new Run({
        network: 'main',
        owner: wallet.owner.privKey.toWif(),
        purse,
        trust: [
          '69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70',
          '7976807fa3f75dfc3c63cbc3d6a416b9e8935652bbb369708ecab3c4b0c27754'
        ]
      })
      run.activate()
      NFT = await run.load('7976807fa3f75dfc3c63cbc3d6a416b9e8935652bbb369708ecab3c4b0c27754_o1')
    },

    async drop(file) {
      console.log(file)
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
      const payload = this.file ? this.dataPayload : this.textPayload;
      const cty     = this.file ? this.file.type : 'text/plain';
      const meta    = this.meta.name || this.meta.description ? this.meta : undefined;
      const env     = Envelope.wrap(payload, { proto: 'shfty.nft', cty })
      await env.sign(wallet.identityKey, { alg: 'ES256K', kid: wallet.identityAddress })
      await env.encrypt(wallet.identityKey, { alg: 'ECDH-ES+A128GCM', kid: wallet.identityAddress })

      const token = new NFT(bufToTypedArray(env.toBuffer()), meta)
      //run.transaction(_ => {
      //  
      //  token.metadata = this.meta
      //})
    }
  }
}

export default {
  component
}