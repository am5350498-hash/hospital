var mysql=require('mysql2');
var util=require('util');

var conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'hospiatl_web'
})

var exe=util.promisify(conn.query).bind(conn);

module.exports=exe;