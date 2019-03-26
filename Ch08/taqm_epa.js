const axios = require('axios')
const cheerio = require('cheerio')
const querystring = require('querystring')

const TAQM_URL = 'http://taqm.epa.gov.tw/taqm/tw/HourlyData.aspx'

async function getValidationFields () {
  const {data} = await axios.get(TAQM_URL)
  const $ = cheerio.load(data)
  return {
    viewState: $('#__VIEWSTATE').attr('value'),
    viewStateGenerator: $('#__VIEWSTATEGENERATOR').attr('value'),
    eventValidation: $('#__EVENTVALIDATION').attr('value')
  }
}

;(async () => {
  const {viewState, viewStateGenerator, eventValidation} = await getValidationFields()
  const {data} = await axios.post(TAQM_URL, querystring.stringify({ // Content-Type: application/x-www-form-urlencoded format
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: viewStateGenerator,
    __EVENTVALIDATION: eventValidation,
    ctl09$lbSite: 15,
    ctl09$lbParam: 1,
    ctl09$txtDateS: '2017/04/02',
    ctl09$txtDateE: '2017/06/17',
    ctl09$btnQuery: '查詢即時值.'
  }))
  const $ = cheerio.load(data)
  $('table[class=TABLE_G]').each((i, elem) => {
    console.log($(elem).text())
  })
})()
