const axios = require('axios')
const cheerio = require('cheerio')

;(async () => {
  console.log('蘋果今日焦點:')
  const {data: apple} = await axios.get('http://www.appledaily.com.tw/appledaily/hotdaily/headline')
  let $ = cheerio.load(apple)
  $('ul[class=focus] li').each((i, elem) => {
    const news = $(elem)
    console.log(
      $('div[class*="aht_title_num"]', news).text(),
      $('div[class="aht_title"]', news).text(),
      $('div[class="aht_pv_num"]', news).text()
    )
  })

  console.log('-----------')
  console.log('自由今日焦點:')
  const {data: ltn} = await axios.get('http://news.ltn.com.tw/newspaper')
  $ = cheerio.load(ltn)
  $('ul[id=newslistul] li').each((i, elem) => {
    const news = $(elem)
    console.log($('a', news).text())
  })
})()
