require('dotenv').config()

import Run from 'run-sdk'
//import U from './extras/u'
import ShftyNft from './jigs/shfty-nft'
import LimitedShftyNft from './jigs/limited-shfty-nft'

const run = new Run({
  network: 'main',
  owner: process.env.OWNER_KEY,
  purse: process.env.PURSE_KEY,
  trust: [
    '69a222fd82ca857a1892419ebc89ebac5e8acf88818659cf30982b3707540d70',
    'dfccfd70db69b1894de7d6c2a45867cc0bcc27e83d13a4d7b06f79ebe60e37dc',
    '7976807fa3f75dfc3c63cbc3d6a416b9e8935652bbb369708ecab3c4b0c27754'
  ]
})

;(async _ => {  
  const jigCode = run.deploy(LimitedShftyNft)
  await jigCode.sync()
  console.log(jigCode)
})()
