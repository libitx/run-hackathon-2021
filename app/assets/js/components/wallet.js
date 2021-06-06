import Wallet from '../util/wallet'
import { fileIconClass } from '../util/helpers'

const component = function() {
  let run
  const wallet = Wallet.load()

  return {
    ownerAddress: wallet.ownerAddress,
    pending: true,
    jigs: [],

    jigName(jig) {
      return jig?.metadata?.name || jig.constructor.metadata.name
    },

    jigDesc(jig) {
      return jig?.metadata?.description || jig.constructor.metadata.description
    },

    fileIconClass,

    async init() {
      run = new Run({
        network: 'main',
        owner: wallet.owner.privKey.toWif(),
        trust: [
          '73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d',
          '48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c'
        ]
      })
      run.activate()

      const utxos = await run.blockchain.utxos(wallet.ownerScript.toHex())
      for (let i = 0; i < utxos.length; i++) {
        const location = `${ utxos[i].txid }_o${ utxos[i].vout }`
        const jig = await run.load(location)
        this.jigs.push(jig)
      }
      this.pending = false
    },
  }
}

export default {
  component
}