import ShftyNft from './shfty-nft'

/**
 * Base LimitedShftyNft Jig class for creating tokens containing Univrse
 * envelope payloads with limited runs.
 * 
 * Should be extended from, eg:
 * 
 *    class MyNft extends LimitedShftyNft {}
 *    MyNft.total = 100
 */
class LimitedShftyNft extends ShftyNft {
  /**
   * Initiates a new Jig instance. Can't be called directly - use `mint()`.
   * 
   * @param {Number} n Token number
   * @param {U|Uint8Array} env Universe envelope
   * @param {Object} metadata Metadata params
   * @returns {Jig} 
   */
  init(n, env, metadata) {
    if (caller !== this.constructor) {
      throw `Must create using ${ this.constructor.name }.mint()`
    }
    this.num = n
    super.init(env, metadata)
  }

  /**
   * Mints a new token using the given Univrse envelope. Can be either a `U`
   * Berry or a Uint8Array binary encoded Envelope .
   * 
   * @param {U|Uint8Array} env Universe envelope
   * @param {Object} metadata Metadata params
   * @returns {Jig} 
   */
  static mint(env, metadata) {
    if (this.total > 0 && this.total <= this.supply) {
      throw new Error(`${this.name} supply exceeded`)
    }

    this.supply++
    return new this(this.supply, env, metadata)
  }
}

LimitedShftyNft.total = 0
LimitedShftyNft.supply = 0

LimitedShftyNft.metadata = {
  name: 'Limited Shfty Nft',
  description: 'Tokenised secrets',
  emoji: '🦹🏽‍♂️'
}

LimitedShftyNft.presets = {
  main: {
    location: '48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o2',
    origin: '48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o2',
    nonce: 1,
    owner: '1G6uiPUxTidmqDpzj9WQbt75vFDCeeSCJg',
    satoshis: 0
  }
}

export default LimitedShftyNft
