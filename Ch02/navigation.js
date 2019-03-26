const axios = require('axios')
const cheerio = require('cheerio')
const _ = require('lodash')
const util = require('../util')

axios.get('http://blog.castman.net/web-crawler-tutorial/ch2/table/table.html')
  .then(res => {
    const $ = cheerio.load(res.data)
    const rows = $('table[class=table] tbody tr')

    // 計算課程均價
    // 取得所有課程價錢: 方法一, 使用 index
    let prices = []
    rows.each((i, elem) => {
      const price = $('td', $(elem)).eq(2).text()
      prices.push(parseInt(price))
    })
    console.log(_.mean(prices))

    // 取得所有課程價錢: 方法二, <a> 的 parent (<td>) 的 previous_sibling
    prices = []
    const links = $('a')
    links.each((i, elem) => {
      const price = $(elem).parent().prev().text()
      prices.push(parseInt(price))
    })
    console.log(_.mean(prices))

    // 取得每一列所有欄位資訊: find_all('td') or row.children
    rows.each((i, elem) => {
      const tds = $('td', $(elem)) // 或是const tds = $(elem).children()
      const link = $('a', tds.eq(3))
      const link_img = $('img', link)
      console.log(
        tds.eq(0).text(),
        tds.eq(1).text(),
        tds.eq(2).text(),
        link.attr('href') || 'None', // 最後一列的 <a> 沒有 'href' 屬性
        link_img.attr('src')
      )
    })

    // 取得每一列所有欄位文字資訊: stripped_strings
    rows.each((i, elem) => {
      console.log(util.stripped_strings($(elem)))
    })
  })
