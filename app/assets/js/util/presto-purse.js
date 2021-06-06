import { Tx } from 'bsv'
import { Presto } from 'paypresto.js'
import { Forge, Cast } from 'txforge'

class PrestoPurse {
  constructor(params) {
    this.params = params
    if (typeof this.params.beforePay !== 'function') {
      throw new Error('Must set beforePay() callback on PrestoPurse')
    }
    if (typeof this.params.afterPay !== 'function') {
      this.params.afterPay = function(){}
    }
  }

  async pay(rawtx, parents) {
    const forge = new Forge()
    const tx = Tx.fromHex(rawtx)
    let nextVin = 0

    tx.txIns.forEach((txIn, i) => {
      const txid = txIn.txHashBuf.reverse().toString('hex')
      const vout = txIn.txOutNum
      const satoshis = parents[i].satoshis
      const script = parents[i].script
      forge.addInput({ txid, vout, satoshis, script })
      nextVin++
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
          payment.forge.build()
          payment.signTxIn(payment.forge.inputs.length-1, { keyPair: payment.keyPair })
          const rawtx = payment.getRawTx()

          resolve(rawtx)
          this.params.afterPay(rawtx)
        })
        .on('error', err => reject(err))

      this.params.beforePay(payment)
    })
  }
}

export default PrestoPurse