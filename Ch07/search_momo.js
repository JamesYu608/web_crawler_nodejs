const axios = require('axios')
const cheerio = require('cheerio')
const urlencode = require('urlencode')
const moment = require('moment')
const fs = require('fs')
const path = require('path')

const TARGET_PRODUCT = 'iphone 7 128g plus'

async function searchMomo (targetProduct) {
  const url = `http://m.momoshop.com.tw/mosearch/${urlencode(targetProduct)}.html`
  const {data} = await axios.get(url) // 實作時，沒有加課程中提到的headers也可以正常運作，所以沒加
  const $ = cheerio.load(data)

  const items = []
  $('div[id=itemizedStyle] ul li').each((i, elem) => {
    const product = $(elem)
    const price = $('b[class=price]', product).text().replace(',', '')
    if (!price) return

    const item = {
      name: $('p[class=prdName]', product).text(),
      price,
      url: `http://m.momoshop.com.tw${$('a', product).attr('href')}`,
      imgUrl: $('a img', product).attr('src')
    }
    items.push(item)
  })

  return items
}

searchMomo(TARGET_PRODUCT)
  .then(items => {
    const today = moment().format('MM-DD')
    console.log(`${today} 搜尋 ${TARGET_PRODUCT} 共 ${items.length} 筆資料`)
    console.log(items)

    const saveData = {
      data: today,
      store: 'momo',
      items: items
    }
    fs.writeFileSync(path.resolve(__dirname, `json/${today}-momo.json`), JSON.stringify(saveData, null, '  '))
  })
