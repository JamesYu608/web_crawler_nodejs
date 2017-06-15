const axios = require('axios')
const cheerio = require('cheerio')
const util = require('../util')

// 網址後方加上 MARKET:STOCK_ID 即為個股資訊. e.g, TPE:2330
const G_FINANCE_URL = 'https://www.google.com/finance?q='
const G_FINANCE_HIS_URL = 'https://www.google.com/finance/historical?q='

async function getWebPage (url, stockId) {
  try {
    const {status, data} = await axios.get(`${url}${stockId}`)
    if (status === 200) {
      return cheerio.load(data)
    }
  } catch (e) { /* DO NOTHING */ }
}

function getStockInfo (page) {
  const $ = page
  const stock = {
    name: $('head title').text().split(':')[0],
    currentPrice: $('div[id=price-panel] span[class=pr] span').text(),
    currentChange: $('div[id=price-panel] div[class*=id-price-change]').text().trim().replace('\n', ' ')
  }

  $('div[class=snap-panel] table').each((i, elem) => {
    const trs = $('tr', $(elem))
    for (let i = 0; i < 3; i++) { // only first 3 rows will be chosen
      const key = $('td', trs[i]).eq(0).text().toLowerCase().trim()
      const value = $('td', trs[i]).eq(1).text().trim()
      stock[key] = value
    }
  })
  return stock
}

function printHistory (page) {
  const $ = page
  const table = $('table[class*=historical_price]')

  const headers = util.stripped_strings($('tr[class=bb]', table))
  console.log(headers)

  $('tr', table).each((i, elem) => {
    if (i === 0) return // 第一列是標題, 故略過
    console.log(util.stripped_strings($(elem)))
  })
}

;(async () => {
  const summaryPage = await getWebPage(G_FINANCE_URL, 'TPE:2330')
  console.log(getStockInfo(summaryPage))

  const historyPage = await getWebPage(G_FINANCE_HIS_URL, 'TPE:2330')
  printHistory(historyPage)
})()
