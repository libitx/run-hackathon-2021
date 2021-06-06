import { Address, Bip32, Bsm, KeyPair, Script } from 'bsv'
import { Envelope, util } from 'univrse/dist/univrse.esm.js'
import { sha256, pbkdf2 } from './crypto'

const STORE_KEY = '_shfty_env'

class Wallet {
  constructor(username, seed) {
    this.username = username
    this.seed = seed
    this.master = Bip32.fromSeed(seed)
    this.identity = this.derive('m/0')
    this.owner = this.derive('m/0/0')
    this.purse = this.derive('m/0/1')
  }

  /**
   * Hash credentials using a pbkdf to generate a seed
   */
  static async fromCredentials(username, password) {
    username = username.toLowerCase()
    const salt = await sha256(`${username}:${password}`)
      .then(bytes => bytes.slice(-16).reverse())
    const seed = await pbkdf2(password, salt)
    return new this(username, seed)
  }

  static load() {
    if (!window.localStorage.getItem(STORE_KEY)) return;
    const env = Envelope.fromString(window.localStorage.getItem(STORE_KEY))
    const [username, seed] = env.payload
    return new this(username, seed)
  }

  static destroy() {
    window.localStorage.removeItem(STORE_KEY)
  }

  get identityAddress() {
    return Address.fromPubKey(this.identity.pubKey).toString()
  }

  get identityKey() {
    return util.fromBsvPrivKey(this.identity.privKey)
  }

  get ownerAddress() {
    return Address.fromPubKey(this.owner.pubKey).toString()
  }

  get ownerScript() {
    const hashBuf = Address.fromPubKey(this.owner.pubKey).hashBuf
    return Script.fromPubKeyHash(hashBuf)
  }

  derive(path) {
    return this.master.derive(path)
  }

  encode() {
    const env = Envelope.wrap([this.username, this.seed], { proto: 'shfty.wallet' })
    return env.toString()
  }

  save() {
    window.localStorage.setItem(STORE_KEY, this.encode())
  }

  sign(message) {
    const keyPair = KeyPair.fromPrivKey(this.identity.privKey)
    return Bsm.sign(Buffer.from(message), keyPair)
  }
}

export default Wallet