var mysql = require('mysql')

function updateSql(values, id) {
    var model_sql = '? = ?';
    var sql = '';
    values.forEach((item, index) => {
        sql += mysql.format(model_sql, item) + ' '
    })
    sql = `update users set ${sql} where id = ${id}`
    console.log(sql);
}

var values = [
    ['runStatus', 1],
    ['firstOnlineTime', 'nowTime'],
    ['lastRefreshTime', 'nowTime'],
    ['isStop', 'false'],
    ['isFist', 'false'],
    ['countDown', 20],
    ['stopTime', 'null']
]


updateSql(values, 1)