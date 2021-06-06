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
   * @param {Object} metadata Metadata params
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
    location: '48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o1',
    origin: '48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c_o1',
    nonce: 1,
    owner: '1G6uiPUxTidmqDpzj9WQbt75vFDCeeSCJg',
    satoshis: 0
  }
}

export default ShftyNft
