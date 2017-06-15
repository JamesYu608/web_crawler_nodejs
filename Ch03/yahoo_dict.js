const axios = require('axios')
const cheerio = require('cheerio')
const querystring = require('querystring')

const Y_DICT_URL = 'https://tw.dictionary.yahoo.com/dictionary'

async function getWebPage (word) {
  try {
    const query = querystring.stringify({p: word})
    const {status, data} = await axios.get(
      `${Y_DICT_URL}?${query}`,
      {headers: {referer: 'https://tw.dictionary.yahoo.com/'}}
    )
    if (status === 200) {
      return cheerio.load(data)
    }
  } catch (e) { /* DO NOTHING */ }
}

// getWebPage('中文')
getWebPage('out of order')
  .then(page => {
    if (!page) return

    const $ = page
    $('ul[class=explanations] li[class=exp-item]').each((i, elem) => {
      console.log($(elem).text())
    })
  })
