const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')
const csv = require('csv')
const fs = require('fs')
const path = require('path')

const FILE_PATH = path.resolve(__dirname, 'ezprice.csv')

db.serialize(() => {
  console.log('建立資料庫及資料表')
  db.run('CREATE TABLE record (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT, price INTEGER, shop TEXT)')

  console.log('插入測試資料')
  db.run('INSERT INTO record (item, price, shop) VALUES ("PS4測試機", 1000, "測試賣家")')

  console.log('更新資料')
  db.run('UPDATE record SET shop="hahow 賣家" where shop="測試賣家"')

  console.log('插入多筆資料')
  const rawData = fs.readFileSync(FILE_PATH)
  csv.parse(rawData, (err, rows) => {
    if (err) return
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      db.run(`INSERT INTO record (item, price, shop) VALUES ("${row[0]}", "${row[1]}", "${row[2]}")`)
    }

    console.log('選擇資料')
    db.each('SELECT * FROM record', (err, row) => {
      if (err) return
      console.log(row)
    })
    db.close()
  })
})
