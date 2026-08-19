var mysql=require('mysql2');
var util=require('util');

var conn=mysql.createConnection({
    host:'bcubl5pqh0if7ygqpnmx-mysql.services.clever-cloud.com',
    user:'uqjpnnfxzjee8iap',
    password:'3o6YId7ebPIpNDNO0ca1',
    database:'bcubl5pqh0if7ygqpnmx'
})

var exe=util.promisify(conn.query).bind(conn);

module.exports=exe;
