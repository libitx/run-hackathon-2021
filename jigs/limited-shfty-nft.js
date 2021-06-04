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
   * @returns {Jig} 
   */
  init(n, env) {
    if (caller !== this.constructor) {
      throw `Must create using ${ this.constructor.name }.mint()`
    }
    this.num = n
    super.init(env)
  }

  /**
   * Mints a new token using the given Univrse envelope. Can be either a `U`
   * Berry or a Uint8Array binary encoded Envelope .
   * 
   * @param {U|Uint8Array} env Universe envelope
   * @returns {Jig} 
   */
  static mint(env) {
    if (this.total > 0 && this.total <= this.supply) {
      throw new Error(`${this.name} supply exceeded`)
    }

    this.supply++
    return new this(this.supply, env)
  }
}

LimitedShftyNft.total = 0
LimitedShftyNft.supply = 0

LimitedShftyNft.metadata = {
  name: 'Limited Shfty Nfts',
  description: 'Tokenise secrets',
  emoji: '🦹🏽‍♂️'
}

LimitedShftyNft.presets = {
  main: {
    location: 'dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o2',
    origin: 'dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o2',
    nonce: 1,
    owner: '1G6uiPUxTidmqDpzj9WQbt75vFDCeeSCJg',
    satoshis: 0
  }
}

export default LimitedShftyNft
