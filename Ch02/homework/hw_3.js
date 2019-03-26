// Questions:
// 找出範例網頁二 總共有幾堂課程

const axios = require('axios')
const cheerio = require('cheerio')

axios.get('http://blog.castman.net/web-crawler-tutorial/ch2/table/table.html')
  .then(res => {
    const $ = cheerio.load(res.data)

    const courses = $('tbody tr')
    console.log(`Course Count: ${courses.length}`)
  })
