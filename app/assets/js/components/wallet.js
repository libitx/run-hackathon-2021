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
          '69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70',
          'dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc',
          '7976807fa3f75dfc3c63cbc3d6a416b9e8935652bbb369708ecab3c4b0c27754'
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