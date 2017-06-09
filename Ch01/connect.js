const axios = require('axios')
const cheerio = require('cheerio')

axios.get('http://blog.castman.net/web-crawler-tutorial/ch1/connect.html')
  .then(res => {
    const $ = cheerio.load(res.data)
    const h1 = $('h1').text()
    console.log(h1)
  })
