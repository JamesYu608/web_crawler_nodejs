const webdriver = require('selenium-webdriver')
const {By, until} = webdriver
const cheerio = require('cheerio')
const util = require('../util')

const URL = 'http://www.bot.com.tw/house/default.aspx'

;(async () => {
  const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build()

  driver.manage().window().maximize() // 視窗最大化
  driver.manage().setTimeouts({pageLoad: 5 * 1000})
  driver.get(URL)

  // 定位日期輸入欄位, 並輸入日期
  let element = driver.findElement(By.css('#fromdate_TextBox'))
  element.sendKeys('1010101')
  element = driver.findElement(By.css('#todate_TextBox'))
  element.sendKeys('1060101')

  // 定位選單所在欄位並點擊
  driver.findElement(By.id('purpose_DDL')).click()
  // 巡覽選單, 點擊對應選項
  const options = await driver.findElements(By.css('#purpose_DDL option'))
  for (const option of options) {
    const text = await option.getText()
    if (text === '其他') {
      option.click()
    }
  }

  // 點擊送出按鈕
  driver.findElement(By.css('#Submit_Button')).click()

  // 等待目標表格出現
  driver.wait(until.elementLocated(By.css('#House_GridView')), 10 * 1000)

  // 回傳目前瀏覽器所看到的網頁文件
  const $ = cheerio.load(await driver.getPageSource())
  $('#House_GridView tr').each((i, elem) => {
    console.log(util.stripped_strings($(elem)))
  })

  // 關閉瀏覽器, 結束 webdriver process
  driver.quit()
})()
