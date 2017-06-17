const axios = require('axios')
const axiosRetry = require('axios-retry')
const urlencode = require('urlencode')
const querystring = require('querystring')
const moment = require('moment')
const fs = require('fs')
const path = require('path')

const API_URL = 'http://ecshweb.pchome.com.tw/search/v3.3/all/results'
const TARGET_PRODUCT = 'iphone 7 128g plus'

async function getResponseData (url, timeout = 3000, maxRetries = 3) {
  // 3 秒未回應即為失敗, 最多失敗 3 次
  axiosRetry(axios, {retries: maxRetries})
  try {
    const {status, data} = await axios.get(url, {timeout})
    return status === 200 ? data : {status}
  } catch (e) {
    return {err: e.message}
  }
}

async function searchPcHome (targetProduct) {
  const items = []
  const query = {
    sort: 'rnk',
    price: '10000-40000' // 鎖定價格帶 10000-40000
  }
  // 把q=""獨立出來是因為PCHome的API在query的部分需要用雙引號包起來
  const queryUrl = `${API_URL}?q="${urlencode(targetProduct)}"&${querystring.stringify(query)}`
  const {prods, totalPage} = await getResponseData(queryUrl)
  if (!prods) return items

  if (totalPage === 1) return getItems(prods)

  // 若不只一頁, 則取得各頁 url 再依序取得各頁的物件
  const urls = []
  for (let i = 0; i < totalPage; i++) {
    urls.push(`${queryUrl}&page=${i + 1}`)
  }

  for (const url of urls) {
    const {prods} = await getResponseData(url)
    if (prods) {
      items.push(...getItems(prods))
    }
  }

  return items
}

function getItems (prods) {
  const items = []
  for (const prod of prods) {
    const {name, price, describe, picB, Id} = prod
    items.push({
      name: name.trim(), // 發現有些name帶有\t開頭
      price,
      describe,
      url: `http://24h.pchome.com.tw/prod/${Id}`,
      imgUrl: `http://ec1img.pchome.com.tw/${picB}`
    })
  }

  return items
}

searchPcHome(TARGET_PRODUCT)
  .then(items => {
    const today = moment().format('MM-DD')
    console.log(`${today} 搜尋 ${TARGET_PRODUCT} 共 ${items.length} 筆資料`)
    console.log(items)

    const saveData = {
      data: today,
      store: 'pchome',
      items: items
    }
    fs.writeFileSync(path.resolve(__dirname, `json/${today}-pchome.json`), JSON.stringify(saveData, null, '  '))
  })
