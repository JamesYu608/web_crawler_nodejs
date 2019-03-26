const axios = require('axios')
const cheerio = require('cheerio')

async function getHeadText (url, headTag) {
  try {
    const {status, data} = await axios.get(url)
    if (status === 200) {
      const $ = cheerio.load(data)
      return $(headTag).text()
    }
  } catch (e) { /* DO NOTHING */ }
}

getHeadText('http://blog.castman.net/web-crawler-tutorial/ch1/connect.html', 'h1')
  .then(text => console.log(text))

getHeadText('http://blog.castman.net/web-crawler-tutorial/ch1/connect.html', 'h2')
  .then(text => console.log(text))
