const mysql = require('mysql')

//数据库连接信息
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: 'Iiu851900/',
    password: '851900',
    database: 'uiserver',
    multipleStatements: true
});
//建立数据库连接
connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("数据库连接成功");
    }
});
//从数据库查询数据
function querySql(sql, callback) {
    // console.log(sql);
    connection.query(sql, function(error, results, fields) {
        if (error)
            throw error;
        let data = null;
        //返回查到的信息
        if (results != "") {
            // console.log(results);
            // data = JSON.stringify(results);
            data = results;
        }
        callback(data);
    });
}
//向数据库添加数据
function insertSql(sql) {
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        //打印信息
        // console.log('The solution is: ', results);
    });
    // connection.end();
}

/**
 * 更新数据库数据
 * @param {要更新的数据数组} values 
 * @param {*要更新的数据id} id 
 */

function updateSql(model_sql, values, id) {
    // var model_sql = 'runStatus = ?,firstOnlineTime=?,lastRefreshTime=?,isStop=?,isFist=?,countDown=?,stopTime=? ';
    let sql = mysql.format(model_sql, values);
    sql = `update users set ${sql} where id = ${id}`;
    // console.log(sql);
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
    })
}
module.exports = { querySql, insertSql, updateSql };