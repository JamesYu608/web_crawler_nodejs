const axios = require('axios')
const cheerio = require('cheerio')
const _ = require('lodash')

const PROXY_IPS = [
  {host: '54.225.238.140', port: '80'},
  {host: '35.186.187.230', port: '3128'}]

const proxy = _.sample(PROXY_IPS)
console.log('Use', proxy)

const requestOpts = {
  proxy: {
    host: proxy.host,
    port: proxy.port
  }
}
axios.get('http://whatismyip.org/', requestOpts)
  .then(({data}) => {
    const $ = cheerio.load(data)
    const ip = $('div').eq(1).text().replace('\n', '').trim()
    console.log(ip)
  })
