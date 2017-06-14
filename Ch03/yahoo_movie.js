const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const Y_MOVIE_URL = 'https://tw.movies.yahoo.com/movie_thisweek.html'
// 以下網址後面加上 "/id=MOVIE_ID" 即為該影片各項資訊
const Y_INTRO_URL = 'https://tw.movies.yahoo.com/movieinfo_main.html' // 詳細資訊
const Y_PHOTO_URL = 'https://tw.movies.yahoo.com/movieinfo_photos.html' // 劇照
const Y_TIME_URL = 'https://tw.movies.yahoo.com/movietime_result.html' // 時刻表

async function getWebPage (url) {
  try {
    const {status, data} = await axios.get(url)
    if (status === 200) {
      return cheerio.load(data)
    }
  } catch (e) { /* DO NOTHING */ }
}

async function getMovies (page) {
  const $ = page

  const movies = []
  const rows = $('div[class="clearfix row"]')
  for (let i = 0; i < rows.length; i++) {
    const movie = rows[i]
    const textPart = $('div[class=text]', movie)
    const data = {
      expectation: $('div[id=ymvle] div[class="bd clearfix "] em', movie).text(),
      chName: $('h4', textPart).text(),
      engName: $('h5', textPart).text(),
      movieId: getMovieId($('h4 a', textPart).attr('href')),
      posterUrl: $('div[class=img] img').attr('src').replace('mpost4', 'mpost'), // replace with bigger picture
      releaseDate: $('span[class=date] span', textPart).text(),
      intro: $('p', textPart).text().replace('詳全文', '').replace('\n', ''),
      trailerUrl: $('li[class=trailer] a', textPart).attr('href') || ''
    }
    data.completeIntro = await getCompleteIntro(data.movieId)
    movies.push(data)
  }

  return movies
}

function getMovieId (movieUrl) {
  const match = movieUrl.match(/\/id=\d+/)
  return match ? match[0].replace('/id=', '') : 'Parsing Error'
}

async function getCompleteIntro (movieId) {
  const page = await getWebPage(`${Y_INTRO_URL}/id=${movieId}`)
  return page ? page('div[class="text full"]').text() : ''
}

getWebPage(Y_MOVIE_URL)
  .then(page => {
    if (!page) return

    getMovies(page).then(movies => {
      console.log(movies)
      fs.writeFileSync(
        path.resolve(__dirname, 'cache/movie.json'),
        JSON.stringify(movies, null, '  ')
      )
    })
  })
