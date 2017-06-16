const axios = require('axios')
const querystring = require('querystring')
const _ = require('lodash')

const API_KEY = require('./token').omdb.apiKey
const OMDB_URL = 'http://www.omdbapi.com'
const KEY_WORD = 'iron man'

async function getData (url) {
  try {
    const {status, data} = await axios.get(url)
    if (status === 200) {
      return data
    }
  } catch (e) { /* DO NOTHING */ }
}

async function searchIdsByKeyword (keyword) {
  const query = {
    apikey: API_KEY,
    s: keyword
  }
  const {Search: search, totalResults} = await getData(`${OMDB_URL}/?${querystring.stringify(query)}`)
  if (!search) return

  const movieIds = []
  // 取得第一頁電影 id
  search.forEach(movie => movieIds.push(movie.imdbID))
  // 取得第二頁以後的資料
  const numberPages = Math.floor(totalResults / 10) + 1
  for (let i = 2; i < numberPages + 1; i++) {
    query.page = i
    const {Search: search} = await getData(`${OMDB_URL}/?${querystring.stringify(query)}`)
    if (search) {
      search.forEach(movie => movieIds.push(movie.imdbID))
    }
  }

  return movieIds
}

async function searchById (movieId) {
  const query = {
    apikey: API_KEY,
    i: movieId
  }
  const {data} = await axios(`${OMDB_URL}/?${querystring.stringify(query)}`)
  return data
}

;(async () => {
  const movieIds = await searchIdsByKeyword(KEY_WORD)
  console.log(`關鍵字 ${KEY_WORD} 共有 ${movieIds.length} 部影片`)
  console.log('取得影片資料中...')
  const movies = []
  for (const id of movieIds) {
    movies.push(await searchById(id))
  }
  console.log('影片資料範例')
  console.log(movies.slice(0, 3))
  const years = []
  const ratings = []
  for (const movie of movies) {
    const {Year: year, imdbRating: ratingStr} = movie
    years.push(year)

    // 如果該電影的 'imdbRating' 欄位不是 'N/A' 則轉換其值為 float 並放入 ratings 內
    const rating = parseFloat(ratingStr)
    if (rating) {
      ratings.push(rating)
    }
  }
  console.log('發行年份分布:', _.countBy(years))
  console.log('平均評分:', _.mean(ratings))
})()
