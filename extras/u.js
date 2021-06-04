import { Berry, extra } from 'run-sdk'
import Envelope from './envelope'
const { Hex, txo } = extra

/**
 * Berry class for loading remote Univrse envelopes into Jigs
 */
class U extends Berry {
  init(buf) {
    const { header, payload, signature, recipient } = Envelope.decode(buf)
    this.raw = buf
    this.header = header
    this.payload = payload
    this.signature = signature
    this.recipient = recipient
  }

  static async pluck(location, fetch) {
    // Load and parse tx
    const [txid, v, idx] = location.split('.')
    const rawtx = await fetch(txid)
    const data = txo(rawtx)

    // Get addressed script or find first UNIV output
    const script = (v && idx) ?
      data[v][Number(idx)] :
      data.out.find(o => o.s2 === 'UNIV');

    if (script) {
      // Iterate over script and build array of binary parts
      const parts = []
      for (let i = 3; i <= 6; i++) {
        const hex = script['h'+i]
        if (hex === '7c') break; // Break if pipe
        if (hex) parts.push(Hex.stringToBytes(hex))
      }

      // Create CBOR array prefix and convert to typed array
      const prefix = [4 << 5 | parts.length]
      const buf = Uint8Array.from(prefix.concat(...parts))
      return new U(buf)
    }
  }
}

U.deps = { Envelope, Hex, txo }

export default U