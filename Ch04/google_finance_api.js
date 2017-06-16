const axios = require('axios')
const querystring = require('querystring')
const moment = require('moment')

const TARGET_STOCK_MARKET = 'TPE'
const TARGET_STOCK_ID = '2330'
const TARGET_STOCK = `${TARGET_STOCK_MARKET}:${TARGET_STOCK_ID}`

async function getStock (stock) {
  // stock 可以是多支股票, 如 TPE:2330,TPE:2498, 不同股票以 , 分開
  const query = {
    client: 'ig',
    q: stock
  }
  try {
    const {status, data} = await axios.get(
      `http://finance.google.com/finance/info?${querystring.stringify(query)}`)
    if (status === 200) {
      // 移除回傳資料開頭的 //
      // 剩下的資料是一個 array, 每個 element 是一支股票的資訊
      return JSON.parse(data.replace('//', ''))
    }
  } catch (e) { /* DO NOTHING */ }
}

async function getStockHistory (stockId, stockMarket) {
  const query = {
    q: stockId,
    x: stockMarket,
    i: '86400&p=1M'
  }
  const {data} = await axios.get(`http://www.google.com/finance/getprices?${querystring.stringify(query)}`)

  let index = -1
  let lines = data.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('a')) { // 'a' 開頭表示股價資訊起始列
      index = i
      break
    }
  }

  const rows = []
  const dateFormateString = 'dddd, MMMM Do YYYY, h:mm:ss a'
  if (index > 0) {
    lines = lines.slice(index)
    // 處理第一列
    const firstRow = lines[0].split(',')
    // 第一列需要特別處理起始日期
    const initDate = moment.unix(firstRow[0].slice(1))
    firstRow[0] = initDate.format(dateFormateString)
    rows.push(firstRow)
    // 處理剩餘列
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',')
      const delta = parseInt(row[0])
      row[0] = moment(initDate).add(delta, 'days').format(dateFormateString)
      rows.push(row)
    }
  }

  return rows
}

;(async () => {
  const stocks = await getStock(TARGET_STOCK)
  if (!stocks) return
  console.log(TARGET_STOCK, '即時股價')
  console.log(stocks[0])
  console.log('-----')
  console.log(TARGET_STOCK_MARKET, TARGET_STOCK_ID, '歷史股價 (Date, Close, High, Low, Open, Volume)')
  const stockHistory = await getStockHistory(TARGET_STOCK_ID, TARGET_STOCK_MARKET)
  console.log(stockHistory)
})()
