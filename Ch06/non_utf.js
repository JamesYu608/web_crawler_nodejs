const axios = require('axios')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const fs = require('fs')
const path = require('path')

function baiduTest () {
  axios.get('https://zhidao.baidu.com/question/48795122.html', {responseType: 'arraybuffer'})
    .then(({data}) => {
      const $ = cheerio.load(iconv.decode(Buffer.from(data), 'gbk')) // 該網頁為 gbk 編碼
      const title = $('span[class*=ask-title]').text().trim()
      console.log('Title:', title)
      const content = $('span[class=con]').text().trim().replace('\n', '')
      console.log('Content:', content)

      fs.writeFileSync(path.resolve(__dirname, 'cache/baidu.txt'), content)
    })
}

function gold66Test () {
  axios.get('http://www.books.com.tw/activity/gold66_day/', {responseType: 'arraybuffer'})
    .then(({data}) => {
      const $ = cheerio.load(iconv.decode(Buffer.from(data), 'big5')) // 該網頁為 big5 編碼
      const books = []
      $('div[class=sec_day]').each((i, elem) => {
        const title = $('div h1 a', $(elem)).text()
        const originalPrice = $('h2', $(elem)).eq(1).text()
        const price = $('h2', $(elem)).eq(2).text()
        books.push(`${title} / ${originalPrice} / ${price}`)
      })
      console.log(books)
      fs.writeFileSync(path.resolve(__dirname, 'cache/books.txt'), books.join('\n'))
    })
}

gold66Test()
baiduTest()
