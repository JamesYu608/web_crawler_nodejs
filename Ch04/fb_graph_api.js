const axios = require('axios')

const ACCESS_TOKEN = require('./token').facebook.accessToken
const FAN_PAGE_ID = 1707015819625206 // Pycone 松果城市粉絲專頁 id

function getMyFriends () {
  axios.get(`https://graph.facebook.com/v2.8/me?fields=id,name,friends&access_token=${ACCESS_TOKEN}`)
    .then(res => {
      const {id, name, friends} = res.data
      console.log('My ID:', id)
      console.log('My name:', name)
      console.log(`I have ${friends.summary.total_count} friends`)
    })
}

function getPagePost () {
  axios.get(`https://graph.facebook.com/v2.8/${FAN_PAGE_ID}/posts?access_token=${ACCESS_TOKEN}`)
    .then(res => {
      const {data} = res.data
      console.log(`粉絲頁有 ${data.length} 篇貼文`)
      console.log('最新一篇時間:', data[0].created_time)
      console.log('內容:', data[0].message)
    })
}

getMyFriends()
getPagePost()
