require('dotenv').config()

import Run from 'run-sdk'
import U from './extras/u'
import ShftyNft from './jigs/shfty-nft'
import LimitedShftyNft from './jigs/limited-shfty-nft'

const run = new Run({
  network: 'main',
  owner: process.env.OWNER_KEY,
  purse: process.env.PURSE_KEY,
  trust: [
    '73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d',
    '48df6857b6fc86d112e558302575a46f88cfff37f58fb9ddc1f5f514a065db1c'
  ]
})

;(async _ => {  
  const code = run.deploy(LimitedShftyNft)
  await code.sync()
  console.log(code)
})()
