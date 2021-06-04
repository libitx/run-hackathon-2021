import { Jig } from 'run-sdk'
import Envelope from '../extras/envelope'
import U from '../extras/envelope'

/**
 * Simple Shfty NFT Jig class for creating tokens containing Univrse envelope
 * payloads.
 */
class ShftyNft extends Jig {
  /**
   * Initiates a new Jig instance using the given Univrse envelope. Can be
   * either a `U` Berry or a Uint8Array binary encoded Envelope .
   * 
   * @param {U|Uint8Array} env Universe envelope
   * @returns {Jig} 
   */
  init(env) {
    this._setEnv(env)
  }

  /**
   * Sends the token to a new recipient. Can optionally be given a new Univrse
   * envelope.
   * 
   * @param {Address} to Recipient
   * @param {U|Uint8Array} env Universe envelope
   * @returns {Jig} 
   */
  send(to, env) {
    this.owner = to
    if (env) this._setEnv(env);
  }

  // Sets the env, raising an error if it is invalid.
  _setEnv(env) {
    if (env instanceof U) {
      this.env = env
    } else {
      try {
        this.env = Envelope.decode(env)
        this.env.raw = env
      } catch(e) {
        throw new Error('Invalid Univrse Envelope')
      }
    }
  }
}

ShftyNft.deps = { Envelope, U }

ShftyNft.metadata = {
  name: 'Shfty Nfts',
  description: 'Tokenise secrets',
  emoji: '🦹🏽‍♂️'
}

ShftyNft.presets = {
  main: {
    location: 'dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o1',
    origin: 'dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc_o1',
    nonce: 1,
    owner: '1G6uiPUxTidmqDpzj9WQbt75vFDCeeSCJg',
    satoshis: 0
  }
}

export default ShftyNft
