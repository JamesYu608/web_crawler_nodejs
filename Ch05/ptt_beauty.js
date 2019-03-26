const axios = require('axios')
const cheerio = require('cheerio')
const moment = require('moment')
const download = require('download')
const fs = require('fs')
const path = require('path')

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

function parseImgUrlFromPage (page) {
  const $ = page
  const imgUrls = []
  $('div[id=main-content] a').each((i, elem) => {
    const href = $(elem).attr('href')
    if (/^https?:\/\/(i.)?(m.)?imgur.com/.test(href)) {
      imgUrls.push(href)
    }
  })

  return imgUrls
}

async function save (imgUrls, title) {
  const dirPath = path.join(__dirname, 'beauty_images', title.trim())
  for (let url of imgUrls) {
    // e.g. 'http://imgur.com/A2wmlqW.jpg'.split('//') -> ['http:', 'imgur.com/A2wmlqW.jpg']
    const urlParts = url.split('//')
    if (urlParts[1].startsWith('m.')) {
      url = url.replace('//m.', '//i.')
    }
    if (!urlParts[1].startsWith('i.')) {
      url = `${urlParts[0]}//i.${urlParts[1]}`
    }
    if (!url.endsWith('.jpg')) {
      url += '.jpg'
    }
    const tempSplit = url.split('/')
    const fileName = tempSplit[tempSplit.length - 1]
    const saveData = await download(url)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
    fs.writeFileSync(path.resolve(dirPath, fileName), saveData)
  }
}

getWebPage(`${PTT_URL}/bbs/Beauty/index.html`)
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

    // 已取得文章列表，開始進入各文章讀圖
    for (const article of articles) {
      console.log('Processing', article)
      const page = await getWebPage(`${PTT_URL}${article.href}`)
      if (page) {
        const imgUrls = parseImgUrlFromPage(page)
        if (imgUrls.length !== 0) {
          await save(imgUrls, article.title)
        }
        article.imgCount = imgUrls.length
      }
    }

    // 儲存文章資訊
    fs.writeFileSync(
      path.resolve(__dirname, 'beauty_images/beauty.json'),
      JSON.stringify(articles, null, '  ')
    )
  })
