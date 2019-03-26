const jieba = require('nodejieba')
const lyrics = require('./lyrics.json')
const _ = require('lodash')

jieba.load({dict: './dict.txt.big'})

const tokens = []
Object.keys(lyrics).forEach(key => {
  const lyric = lyrics[key]
  const jiebaResult = jieba.cut(lyric)
    // 斷詞後的結果, 若非空白且長度為 2 以上, 則列入詞庫
    .map(word => word.trim())
    .filter(word => word.length > 1)
  tokens.push(...jiebaResult)
})

// 計算 tokens 內各詞彙的出現次數
const tokenCountObj = _.countBy(tokens)

// 出現次數前10名
const tokenCountArr = []
Object.keys(tokenCountObj).forEach(key => {
  tokenCountArr.push({word: key, count: tokenCountObj[key]}) // 將上面結果轉成lodash能處理的格式
})
console.log(_.orderBy(tokenCountArr, ['count'], ['desc']).slice(0, 10))
