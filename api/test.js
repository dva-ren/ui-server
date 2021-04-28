var mysql = require('mysql')

function updateSql(values, id) {
    var model_sql = 'runStatus = ?,firstOnlineTime=?,lastRefreshTime=?,isStop=?,isFist=?,countDown=?,stopTime=? ';
    let sql = mysql.format(model_sql, values);
    sql = `update users set ${sql} where id = ${id}`;
    console.log(sql);
}
var va = [1, 'nowTime', 'nowTime', 'false', 'false', 20, 'null']

updateSql(va, 1)