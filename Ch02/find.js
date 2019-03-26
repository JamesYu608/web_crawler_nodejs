const axios = require('axios')
const cheerio = require('cheerio')
const util = require('../util')

axios.get('http://blog.castman.net/web-crawler-tutorial/ch2/blog/blog.html')
  .then(res => {
    const $ = cheerio.load(res.data)

    // 取得第一篇 blog (h4)
    const first_h4 = $('h4').eq(0)
    // 取得第一篇 blog 主標題
    const first_h4_a = $('h4 a').eq(0)
    console.log(first_h4_a.text())

    // 取得所有 blog 主標題, 使用 tag
    let main_titles = $('h4 a')
    main_titles.each((i, elem) => {
      console.log($(elem).text())
    })

    // 取得所有 blog 主標題, 使用 class (這裡直接使用CSS的標準selector)
    main_titles = $('h4[class=card-title] a')
    main_titles.each((i, elem) => {
      console.log($(elem).text())
    })

    // 使用 key=value 取得元件 (這裡直接使用CSS的標準selector)
    const by_id = $('#mac-p')
    console.log(by_id.text().trim())

    // 當 key 含特殊字元時, 使用 dict 取得元件 (這裡直接使用CSS的標準selector)
    const by_attrs = $('[data-foo="mac-foo"]')

    // 取得各篇 blog 的所有文字
    const contents = $('div[class=content]')
    contents.each((i, elem) => {
      const content = $(elem)
      // 方法一, 使用 text (會包含許多換行符號)
      console.log(content.text())

      // 方法二, 使用 tag 定位
      const category = $('h6', content).text().trim()
      const title = $('a', 'h4', content).text().trim()
      const description = $('p', content).text().trim()
      console.log(category, title, description)

      // 方法三, 使用 .stripped_strings (使用一個簡單的polyfill function代替)
      console.log(util.stripped_strings(content))
    })
  })
