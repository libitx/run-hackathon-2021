import { assert } from 'chai'
import Run from 'run-sdk'
import { Bn, Tx } from 'bsv'
import { Envelope, Key } from 'univrse'
import U from '../extras/u'

const run = new Run({ network: 'mock' })

describe('Simple payload', () => {
  let txid
  before(async () => {
    const env = Envelope.wrap('This is a test!', { proto: 'runtest' })
    const tx = new Tx()
    tx.addTxOut(Bn(0), env.toScript())
    const paid = await run.purse.pay(tx.toHex(), [])
    txid = await run.blockchain.broadcast(paid)
  })

  it('decodes the envelope transaction', async () => {
    const env = await U.load(txid)
    assert.equal(env.header.proto, 'runtest')
    assert.equal(env.payload, 'This is a test!')
    assert.isUndefined(env.signature)
    assert.isUndefined(env.recipient)
  })
})

describe('Complex payload', () => {
  let txid
  before(async () => {
    const env = Envelope.wrap({
      str: 'This is a test!',
      bin: Uint8Array.from([1,2,3,4]),
      arr: ['a', 'b', 3, 4],
      obj: { foo: 'bar' }
    }, { proto: 'runtest' })
    const tx = new Tx()
    tx.addTxOut(Bn(0), env.toScript())
    const paid = await run.purse.pay(tx.toHex(), [])
    txid = await run.blockchain.broadcast(paid)
  })

  it('decodes the envelope transaction', async () => {
    const env = await U.load(txid)
    assert.equal(env.header.proto, 'runtest')
    assert.equal(env.payload.str, 'This is a test!')
    assert.deepEqual(env.payload.arr, ['a', 'b', 3, 4])
    assert.deepEqual(env.payload.obj, { foo: 'bar' })
  })
})

describe('Encrypted and signed payload', () => {
  let txid
  before(async () => {
    const alice = await Key.generate('ec', 'secp256k1')
    const bob = await Key.generate('ec', 'secp256k1')
    const secret = await Key.generate('oct', 128)
    const env = Envelope.wrap('This is a test!', { proto: 'runtest' })
    await env.sign(alice, { alg: 'ES256K', kid: 'alice' })
    await env.encrypt([
      [secret, { alg: 'A128GCM' }],
      [alice, { alg: 'ECDH-ES+A128GCM', kid: 'alice' }],
      [bob, { alg: 'ECDH-ES+A128GCM', kid: 'bob' }]
    ])
    const tx = new Tx()
    tx.addTxOut(Bn(0), env.toScript())
    const paid = await run.purse.pay(tx.toHex(), [])
    txid = await run.blockchain.broadcast(paid)
  })

  it('decodes the envelope transaction', async () => {
    const env = await U.load(txid)
    assert.equal(env.header.proto, 'runtest')
    assert.notEqual(env.payload, 'This is a test!')
    assert.equal(env.signature.header.kid, 'alice')
    assert.lengthOf(env.recipient, 3)
    assert.equal(env.recipient[1].header.kid, 'alice')
    assert.equal(env.recipient[2].header.kid, 'bob')
  })
})