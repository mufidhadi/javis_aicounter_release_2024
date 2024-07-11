const mysql = require('mysql')

// const MYSQLcon = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "asdzxc",
//     database: "aicounter_db"
// })
const MYSQLcon = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "asdzxc",
    database: "aicounter_db"
})
exports.MYSQLcon = MYSQLcon
