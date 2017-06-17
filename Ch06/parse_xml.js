const xmlParser = require('xml2js').parseString
const fs = require('fs')
const path = require('path')

const rawData = fs.readFileSync(path.resolve(__dirname, 'example.xml'))
xmlParser(rawData, (err, data) => {
  if (err) return
  const root = data.root
  const {totalResults} = root.$
  const movies = root.result

  console.log(`共 ${totalResults} 筆資料, 前 10 筆`)
  for (const movie of movies) {
    console.log(movie.$.title)
  }
})
