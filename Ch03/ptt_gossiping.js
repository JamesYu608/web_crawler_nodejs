const axios = require('axios')
const cheerio = require('cheerio')
const moment = require('moment')
const fs = require('fs')
const path = require('path')

const PTT_URL = 'https://www.ptt.cc'
const HOT_ARTICLE_THRESHOLD = 50

async function getWebPage (url) {
  try {
    const {status, data} = await axios.get(url, {headers: {cookie: 'over18=1'}})
    if (status === 200) {
      return cheerio.load(data)
    }
  } catch (e) { /* DO NOTHING */ }
}

function getArticles (page, date) {
  const $ = page

  // 取得上一頁的連結
  const prevUrl = $('div[class="btn-group btn-group-paging"] a').eq(1).attr('href')

  // 儲存取得的文章資料
  const articles = []
  $('div[class=r-ent]').each((i, elem) => {
    const article = $(elem)
    const articleDate = $('div[class=date]', article).text().trim()
    if (articleDate === date) { // 發文日期正確
      // 取得推文數
      const pushText = $('div[class=nrec]', article).text()
      let pushCount = parseInt(pushText)
      if (!pushCount) { // 若轉換失敗，可能是'爆'或 'X1', 'X2', ...
        if (pushText === '爆') {
          pushCount = 100
        } else if (pushText.startsWith('X')) {
          pushCount = -10
        } else {
          pushCount = 0
        }
      }

      // 取得文章連結及標題
      const titleLink = $('a', article)
      if (titleLink.length !== 0) { // 有超連結，表示文章存在，未被刪除
        articles.push({
          title: titleLink.text(),
          href: titleLink.attr('href'),
          author: $('div[class=author]', article).text(),
          pushCount
        })
      }
    }
  })

  return {prevUrl, articles}
}

getWebPage(`${PTT_URL}/bbs/Gossiping/index.html`)
  .then(async page => {
    if (!page) return

    const articles = [] // 全部的今日文章
    const today = moment().format('M/DD') // 今天日期, 去掉開頭的 '0' 以符合 PTT 網站格式

    let {prevUrl, articles: currentArticles} = getArticles(page, today) // 目前頁面的今日文章
    while (currentArticles.length !== 0) { // 若目前頁面有今日文章則加入 articles，並回到上一頁繼續尋找是否有今日文章
      articles.push(...currentArticles)

      const prevPage = await getWebPage(`${PTT_URL}${prevUrl}`)
      if (!prevPage) break

      const prevPageArticles = getArticles(prevPage, today)
      prevUrl = prevPageArticles.prevUrl
      currentArticles = prevPageArticles.articles
    }

    // 儲存或處理文章資訊
    const _56Ids = new Set()
    console.log(`熱門文章(> ${HOT_ARTICLE_THRESHOLD} 推):`)
    articles.forEach(article => {
      const {pushCount, author} = article
      if (pushCount > HOT_ARTICLE_THRESHOLD) {
        console.log(article)
      }
      if (author.includes('5566')) {
        _56Ids.add(author)
      }
    })
    console.log(`今天共有 ${articles.length} 篇文章, 有 ${_56Ids.size} 個不重複的56 ID發文`)
    fs.writeFileSync(
      path.resolve(__dirname, 'cache/gossiping.json'),
      JSON.stringify(articles, null, '  ')
    )
  })
