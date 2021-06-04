import CBOR from './cbor'

/**
 * Simple Univrse Envelope class
 */
class Envelope {
  /**
   * Creates a new Envelope instance.
   * 
   * @constructor
   * @param {Object} header Envelope header
   * @param {any} payload Envelope payload
   * @param {Object|Object[]} signature Signature or array of signatures
   * @param {Object|Object[]} recipient Recipient or array of recipients
   */
  constructor(header, payload, signature, recipient) {
    this.header = header
    this.payload = payload
    this.signature = this._decodeSignature(signature)
    this.recipient = this._decodeRecipient(recipient)
  }

  /**
   * Create an Envelope instance from a CBOR encoded binary.
   * 
   * @constructor
   * @param {Uint8Array} data CBOR encoded envelope
   */
  static decode(data) {
    return new Envelope(...CBOR.decode(data))
  }

  _decodeSignature(parts) {
    if (!Array.isArray(parts)) return;
    if (parts.length === 2 && typeof parts[0] === 'object' && typeof parts[0].alg === 'string') {
      return { header: parts[0], signature: parts[1] }
    } else {
      return parts.map(p => this._decodeSignature(p))
    }
  }

  _decodeRecipient(parts) {
    if (!Array.isArray(parts)) return;
    if (parts.length === 2 && typeof parts[0] === 'object' && typeof parts[0].alg === 'string') {
      return { header: parts[0], key: parts[1] }
    } else {
      return parts.map(p => this._decodeRecipient(p))
    }
  }
}

Envelope.deps = { CBOR }

export default Envelope