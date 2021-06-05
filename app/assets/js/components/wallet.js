import Run from 'run-sdk'
import Wallet from '../util/wallet'

const component = function() {
  let run
  const wallet = Wallet.load()

  return {
    ownerAddress: wallet.ownerAddress,
    pending: true,
    tokens: [],

    async init() {
      run = new Run({
        network: 'main',
        owner: wallet.owner.privKey.toWif(),
        trust: [
          '69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70',
          'dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc'
        ]
      })
      run.activate()

      const utxos = await run.blockchain.utxos(wallet.ownerScript.toHex())
      for (let i = 0; i < utxos.length; i++) {
        const location = `${ utxos[i].txid }_o${ utxos[i].vout }`
        const jig = await run.load(location)
        //console.log(jig.constructor.metadata)
        //console.log(jig)
        this.tokens.push(jig)
      }
      this.pending = false
    },
  }
}

export default {
  component
}