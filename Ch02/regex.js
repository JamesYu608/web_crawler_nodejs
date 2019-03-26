const axios = require('axios')
const cheerio = require('cheerio')
const _ = require('lodash')
const util = require('../util')

axios.get('http://blog.castman.net/web-crawler-tutorial/ch2/blog/blog.html')
  .then(res => {
    const $ = cheerio.load(res.data)

    // 找出所有 'h' 開頭的標題文字
    let titles = $('h1, h2, h3, h4, h5, h6')
    titles.each((i, elem) => console.log(
      $(elem).text().trim()
    ))

    // 利用 regex 找出所有 'h' 開頭的標題文字
    titles = $('*').filter((i, elem) => /^h[1-6]/.test(elem.name))
    titles.each((i, elem) => console.log(
      $(elem).text().trim()
    ))

    // 找出所有 .png 結尾的圖片
    let imgs = $('img[src]')
    imgs.each((i, elem) => {
      const src = $(elem).attr('src')
      if (src.endsWith('.png')) {
        console.log(src)
      }
    })

    // 利用 regex 找出所有 .png 結尾的圖片
    imgs = $('img[src]')
    imgs.each((i, elem) => {
      const src = $(elem).attr('src')
      if (/\.png$/.test(src)) {
        console.log(src)
      }
    })

    // 找出所有 .png 結尾且含 'beginner' 的圖片
    imgs.each((i, elem) => {
      const src = $(elem).attr('src')
      if (src.endsWith('.png') && src.includes('beginner')) {
        console.log(src)
      }
    })

    // 利用 regex 找出所有 .png 結尾且含 'beginner' 的圖片
    imgs.each((i, elem) => {
      const src = $(elem).attr('src')
      if (/beginner.*\.png$/.test(src)) {
        console.log(src)
      }
    })
  })
