import { assert } from 'chai'
import Run from 'run-sdk'
import { Envelope } from 'univrse'
import ShftyNft from '../jigs/shfty-nft'
import LimitedShftyNft from '../jigs/limited-shfty-nft'

const run = new Run({ network: 'mock' })

class MyLimitedNft extends LimitedShftyNft {}
MyLimitedNft.total = 5

// Deploy the ShftyNft codes
let ShftyNftCode, LimitedShftyNftCode, MyLimitedNftCode
before(async () => {
  run.activate()
  ShftyNftCode = run.deploy(ShftyNft)
  LimitedShftyNftCode = run.deploy(LimitedShftyNft)
  MyLimitedNftCode = run.deploy(MyLimitedNft)
  await ShftyNftCode.sync()
  await LimitedShftyNftCode.sync()
  await MyLimitedNftCode.sync()
})

describe('ShftyNft', () => {
  let envBuf
  before(async () => {
    const env = Envelope.wrap('This is a test!', { proto: 'runtest' })
    const buf = env.toBuffer()
    envBuf = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  })

  it('creates a token', async () => {
    const token = new ShftyNftCode(envBuf)
    assert.equal(token.env.header.proto, 'runtest')
    assert.equal(token.env.payload, 'This is a test!')
    assert.deepEqual(token.env.raw, envBuf)
  })

  it('creates a token with metadata', async () => {
    const token = new ShftyNftCode(envBuf, { foo: 'bar' })
    assert.equal(token.metadata.foo, 'bar')
  })

  it('sends to another owner', async () => {
    const token = new ShftyNftCode(envBuf)
    await token.sync()
    const owner = token.owner
    const env = Envelope.fromBuffer(token.env.raw)
    env.payload = 'This is an amended env'
    const buf = env.toBuffer()
    const envBuf2 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    token.send('mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt', envBuf2)
    await token.sync()
    assert.equal(token.env.payload, 'This is an amended env')
    assert.notEqual(token.env.payload, owner)
    assert.equal(token.owner, 'mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt')
  })

  it('cannot be minted without envelope', async () => {
    assert.throws(_ => new ShftyNftCode('not an env'), 'Invalid Univrse Envelope')
  })

  it('cannot send with invalid envelope', async () => {
    const token = new ShftyNftCode(envBuf)
    assert.throws(_ => token.send('mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt', 'not and env'), 'Invalid Univrse Envelope')
  })
})

describe('LimitedShftyNft when total is 0', () => {
  let envBuf
  before(async () => {
    const env = Envelope.wrap('This is a test!', { proto: 'runtest' })
    const buf = env.toBuffer()
    envBuf = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  })

  it('mints a token', async () => {
    const token = LimitedShftyNftCode.mint(envBuf)
    assert.isAtLeast(token.num, 1)
    assert.equal(token.env.header.proto, 'runtest')
    assert.equal(token.env.payload, 'This is a test!')
    assert.deepEqual(token.env.raw, envBuf)
  })

  it('mints a token with metadata', async () => {
    const token = LimitedShftyNftCode.mint(envBuf, { foo: 'bar' })
    assert.equal(token.metadata.foo, 'bar')
  })

  it('sends to another owner', async () => {
    const token = LimitedShftyNftCode.mint(envBuf)
    await token.sync()
    const owner = token.owner
    const env = Envelope.fromBuffer(token.env.raw)
    env.payload = 'This is an amended env'
    const buf = env.toBuffer()
    const envBuf2 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    token.send('mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt', envBuf2)
    await token.sync()
    assert.equal(token.env.payload, 'This is an amended env')
    assert.notEqual(token.env.payload, owner)
    assert.equal(token.owner, 'mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt')
  })

  it('mints unlimited tokens when total is 0', async () => {
    assert.equal(LimitedShftyNftCode.total, 0)
    const tokens = [...Array(10)].map(_ => LimitedShftyNftCode.mint(envBuf))
    assert.lengthOf(tokens, 10)
    assert.equal(LimitedShftyNftCode.total, 0)
    assert.isAtLeast(LimitedShftyNftCode.supply, 10)
  })

  it('cannot be minted without envelope', async () => {
    assert.throws(_ => LimitedShftyNftCode.mint('not an env'), 'Invalid Univrse Envelope')
  })

  it('cannot send with invalid envelope', async () => {
    const token = LimitedShftyNftCode.mint(envBuf)
    assert.throws(_ => token.send('mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt', 'not and env'), 'Invalid Univrse Envelope')
  })

  it('cannot be created with constructor', async () => {
    assert.throws(_ => new LimitedShftyNftCode(envBuf), 'Must create using LimitedShftyNft.mint()')
  })
})

describe('MyLimitedNft when total is 5', () => {
  let envBuf
  before(async () => {
    const env = Envelope.wrap('This is a test!', { proto: 'runtest' })
    const buf = env.toBuffer()
    envBuf = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  })

  it('supply cannot exceed total', async () => {
    assert.equal(MyLimitedNftCode.total, 5)
    assert.throws(_ => {
      [...Array(10)].map(_ => MyLimitedNftCode.mint(envBuf))
    }, 'MyLimitedNft supply exceeded')
  })

  it('cannot be created with constructor', async () => {
    assert.throws(_ => new MyLimitedNftCode(envBuf), 'Must create using MyLimitedNft.mint()')
  })
})