// Questions:
// 用 Chrome 開發者工具, 找出 Dcard 的今日熱門文章區塊, 然後取得前十篇熱門文章的標題

// 提示: 每一篇熱門文章都是 class 為 PostEntry_container_ 開頭的 div,
// 可以用 find_all() 加上 regular expression 找出來; 標題文字被 <strong> 包圍

const axios = require('axios')
const cheerio = require('cheerio')

axios.get('https://www.dcard.tw/f')
  .then(res => {
    const $ = cheerio.load(res.data)

    // 法一: filter + regular expression
    // const postContainers = $('div')
    //   .filter((i, elem) => {
    //     const className = $(elem).attr('class')
    //     return /^PostEntry_container_/.test(className)
    //   })

    // 法二: 標準css selector
    const postContainers = $('div[class^="PostEntry_container"]')

    for (let i = 0; i < 10; i++) {
      const title = $('strong', postContainers[i])
      console.log(`${i + 1}. ${title.text()}`)
    }
  })
