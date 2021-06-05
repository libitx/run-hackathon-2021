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
  init(env, metadata) {
    this._setEnv(env)
    if (metadata) {
      this.metadata = metadata
    }
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
  name: 'Shfty Nft',
  description: 'Tokenised secrets',
  emoji: '🦹🏽‍♂️'
}

ShftyNft.presets = {
  main: {
    location: '7976807fa3f75dfc3c63cbc3d6a416b9e8935652bbb369708ecab3c4b0c27754_o1',
    origin: '7976807fa3f75dfc3c63cbc3d6a416b9e8935652bbb369708ecab3c4b0c27754_o1',
    nonce: 1,
    owner: '1G6uiPUxTidmqDpzj9WQbt75vFDCeeSCJg',
    satoshis: 0
  }
}

export default ShftyNft
