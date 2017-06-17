// 2017/05/27: 該網頁已經更新，改用 GET JSON 的方式
// http://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=20170617&stockNo=2330&_=1497704120161

const axios = require('axios')
const cheerio = require('cheerio')
const querystring = require('querystring')

const TWSE_URL = 'http://www.twse.com.tw/exchangeReport/STOCK_DAY'
const TARGET_STOCK = {
  ID: 2330,
  YEAR: 2016,
  START_MONTH: 9,
  END_MONTH: 12
}

async function getStockData (stockId, year, month) {
  const formatMonth = month < 10 ? `0${month}` : month
  const query = {
    response: 'json',
    date: `${year}${formatMonth}01`,
    stockNo: stockId
  }
  const {data} = await axios.get(`${TWSE_URL}?${querystring.stringify(query)}`)
  const info = []
  if (data.data) {
    data.data.forEach(values => info.push(values))
  }

  return info
}

;(async () => {
  const allInfo = []
  const {ID, YEAR, START_MONTH: start, END_MONTH: end} = TARGET_STOCK
  for (let i = start; i <= end; i++) {
    console.log('Processing', YEAR, i)
    const stockData = await getStockData(ID, YEAR, i)
    if (stockData) {
      allInfo.push(stockData)
    }
  }
  console.log('日期, 開盤價, 收盤價, 漲跌價差, 成交筆數')
  allInfo.forEach(monthInfo => console.log(monthInfo))
})()
