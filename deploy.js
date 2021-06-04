require('dotenv').config()

import Run from 'run-sdk'
import U from './extras/u'

const run = new Run({
  network: 'main',
  owner: process.env.OWNER_KEY,
  purse: process.env.PURSE_KEY
})

;(async _ => {
  const uCode = run.deploy(U)
  await uCode.sync()
  console.log(uCode)
})()
