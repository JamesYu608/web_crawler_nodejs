// Questions:
// 1. 找出範例網頁一 總共有幾篇 blog 貼文
// 2. 找出範例網頁一 總共有幾張圖片網址含有 'crawler' 字串

const axios = require('axios')
const cheerio = require('cheerio')

axios.get('http://blog.castman.net/web-crawler-tutorial/ch2/blog/blog.html')
  .then(res => {
    const $ = cheerio.load(res.data)

    // 1. 找出範例網頁一 總共有幾篇 blog 貼文
    const posts = $('h4[class=card-title] a')
    console.log(`Blog Count: ${posts.length}`)

    // 2. 找出範例網頁一 總共有幾張圖片網址含有 'crawler' 字串
    const imgs = $('img[src]')
      .filter((i, elem) => $(elem).attr('src').includes('crawler'))
    console.log(`src includes 'crawler': ${imgs.length}`)
  })
