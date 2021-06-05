import { Tx } from 'bsv'
import { Presto } from 'paypresto.js'
import { Forge, Cast } from 'txforge'

class PrestoPurse {
  constructor(params) {
    this.params = params
    if (typeof this.params.onBefore !== 'function') {
      throw new Error('Must set onBefore() callback on PrestoPurse')
    }
    if (typeof this.params.onAfter !== 'function') {
      this.params.onAfter = (_ => {})
    }
  }

  async pay(rawtx, _parents) {
    const forge = new Forge()
    const tx = Tx.fromHex(rawtx)

    tx.txIns.forEach(txIn => {
      console.log('currently not adding txIns')
      console.log({ txIn })
    })

    tx.txOuts.forEach(({ script, valueBn }) => {
      const lockingScript = { script: [script], size: script.toBuffer().length }
      const satoshis = valueBn.toNumber()
      const cast = Cast.lockingScript({ lockingScript }, { satoshis })
      forge.addOutput(cast)
    })

    return new Promise((resolve, reject) => {
      const payment = Presto.create({
        ...this.params,
        forge
      })

      payment
        .on('funded', payment => {
          const rawtx = payment.signTx().getRawTx()
          resolve(rawtx)
          this.params.onAfter(rawtx)
        })
        .on('error', err => reject(err))

      this.params.onBefore(payment)
    })
  }
}

export default PrestoPurse