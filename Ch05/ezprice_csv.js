const axios = require('axios')
const cheerio = require('cheerio')
const urlencode = require('urlencode')
const json2csv = require('json2csv')
const csv = require('csv')
const fs = require('fs')
const path = require('path')

const EZPRICE_URL = 'https://ezprice.com.tw'
const TARGET_PRODUCT = 'ps4主機'
const FILE_PATH = path.resolve(__dirname, 'ezprice.csv')

axios.get(`${EZPRICE_URL}/s/${urlencode(TARGET_PRODUCT)}/price/`)
  .then(({data}) => {
    const $ = cheerio.load(data)

    const items = []
    $('div[class="search-rst clearfix"]').each((i, elem) => {
      const row = $(elem)
      const item = {
        title: $('div h4 a', row).attr('title'),
        price: $('span[itemprop=price]', row).attr('content'),
        platformName: $('span[class=platform-name]', row).text().trim() || '無'
      }
      items.push(item)
    })
    console.log(`共 ${items.length} 項商品`)
    console.log(items)

    // 寫到csv
    const toCsvData = json2csv({data: items, fields: ['title', 'price', 'platformName']})
    fs.writeFileSync(FILE_PATH, toCsvData)

    console.log('讀取 csv 檔')
    fs.readFile(FILE_PATH, (err, data) => {
      if (err) return
      csv.parse(data, (err, data) => {
        if (err) return
        console.log(data)
      })
    })
  })
