const axios = require('axios')
const cheerio = require('cheerio')
const moment = require('moment')

const PTT_URL = 'https://www.ptt.cc'

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

function getIp (page) {
  const match = page.text().match(/來自: \d+\.\d+\.\d+\.\d+/)
  return match ? match[0].replace('來自: ', '') : ''
}

async function getCountry (ip) {
  const {data} = await axios.get(`http://freegeoip.net/json/${ip}`)
  return data.country_name
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
    console.log(`今天共有 ${articles.length} 篇文章`)

    // 已取得文章列表，開始進入各文章尋找發文者 IP
    console.log('取得前 50 篇文章 IP')
    const countryCount = {}
    for (let i = 0; i < 50; i++) {
      const article = articles[i]
      console.log(`查詢 IP: ${article.title}`)
      const articlePage = await getWebPage(`${PTT_URL}${article.href}`)
      if (page) {
        const ip = getIp(articlePage)
        const country = ip ? await getCountry(ip) : ''
        if (!country) break
        countryCount[country] = countryCount[country]
          ? countryCount[country] + 1
          : 1
      }
    }
    // 印出各國 IP 次數資訊
    console.log('各國 IP 分布:')
    console.log(countryCount)
  })
