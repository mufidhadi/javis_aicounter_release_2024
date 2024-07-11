const mysql = require('mysql');

const MYSQLcon = mysql.createConnection({
    host: "localhost",
    user: "root",
    // password: "",
    password: "asdzxc",
    database: "aicounter_db"
});
exports.MYSQLcon = MYSQLcon;
