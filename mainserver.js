// import "_@types_node@14.14.37@@types";
const express = require('express');
const fs = require('fs');
const os = require("os");
const url = require('url');
const mysql = require('mysql');
const server = express();
server.use(express.json());

const port = 3000;
const hostname = "127.0.0.1";
var log_file = './log.txt';
const countdown = require('./until/countdown');

var clientList = []; //用户列表
var total = 0;
var timer = []; //定时器列表

//数据库连接信息
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Iiu851900/',
    database: 'uiserver'
});
/*
方法区
*/

//设置跨域访问
server.all("*", function(req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.send(200); //让options尝试请求快速结束
    else
        next();
});

//向文件写日志
function writeLog(msg) {
    let time = getTime();
    msg = time + '\t' + msg + os.EOL;
    fs.appendFile(log_file, msg, function(error) {
        if (error) {
            return false;
        } else {
            return true;
        }
    })
}

//获取时间
function getTime() {
    Date.prototype.format = function(fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    var day = new Date();
    time = String(day.format("yyyy-MM-dd hh:mm:ss"));
    return time;
}

connection.connect();
//向数据库添加数据
function insertDataToSql(index, hostname) {
    selectDateToSql(hostname, (sqlData) => {
        if (sqlData == null) {
            let sql = `insert into client(id,hostname,ip,submission_date) values (${clientList[index].id},"${hostname}","${clientList[index].addres}","${getTime()}");`
                // console.log(sql);
            connection.query(sql, function(error, results, fields) {
                if (error) throw error;
                //打印信息
                // console.log('The solution is: ', results);
            });
        }
    });
    // connection.end();
}
//从数据库查询数据
function selectDateToSql(hostname, callback) {
    let sql = `select * from client where hostname = "${hostname}";`;
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        let data = null;
        //返回查到的信息
        if (results != "") {
            // console.log(results);
            data = JSON.stringify(results);
        }
        callback(data);
    });
}
//从数据库查询数据
function selectDataFromSql(sql, func) {
    console.log(sql);
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        let data = null;
        //返回查到的信息
        if (results != "") {
            data = JSON.stringify(results);
            console.log(data);
        }
        func(data);
    });
}


// const app = http.createServer(() => {

// });
server.get("/", (request, response) => {
    // console.log("get/")
    // if (total != 0) {
    //     inertData(clientList[0]);
    // }
    // response.writeHead(200, { "Content-Type": 'text/plain', 'charset': 'utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS' }); //可以解决跨域的请求
    // response.write(clientList);
    // response.end();
    response.send(clientList);

});

//向Json字符串增加内容字段
function inertData(oldJson) {
    // console.log("添加字段");
    oldJson.runStaus = 1; //运行状态 0：停止 1：运行中 -1：倒计时结束，等待启动请求
    oldJson.isFistRun = true; //是否首次启动
    oldJson.lastTime = getTime(); //上次刷新时间
    oldJson.fistOnlineTime = getTime(); //首次运行时间
    oldJson.ountdown = oldJson.sleeptime; //剩余时间
    oldJson.stopTime = null; //停止时间
    oldJson.isStop = false;
}

//未使用
function timerFun() {
    //要执行的操作
    // console.log(test--);
    var timer = setTimeout(function() {
        timerFun();
        clearTimeout(timer);
    }, 1000)
    if (test == 0) {

    }
}

//接收启动请求
server.put("/put", (req, res) => {
    let id = 0; //存储用户在数组中的位置，[id-1]
    let data = req.body; //客户端返回的数据
    if (total == 0) {
        total++;
        id = data.id = total;
        clientList.push(data);
        insertDataToSql(0, data.hostname);
    } else {
        let isflag = false;
        for (i = 0; i < total; i++) {
            let isFistRunTemp = clientList[i].isFistRun;
            console.log(isFistRunTemp); //log
            let temptime = clientList[i] = clientList[i].fistOnlineTime;
            if (clientList[i].hostname == data.hostname) {
                id = data.id = clientList[i].id; //用于清除计时器
                if (clientList[i].isStop == true) {
                    clientList[i] = data;
                    inertData(clientList[i]);
                }
                clientList[i].isFistRun = isFistRunTemp;
                clientList[i].ountdown = data.sleeptime;
                insertDataToSql(i, data.hostname);
                if (clientList[i].isFistRun) {
                    clientList[i].isFistRun = false;
                } else {
                    clientList[i].fistOnlineTime = temptime;
                }
                isflag = true;
                console.log(clientList[i].isFistRun); //log
                break;
            }
        }
        if (!isflag) {
            total++;
            id = data.id = total;
            clientList.push(data);
            insertDataToSql(total - 1, data.hostname);
        }
    }
    console.log(timer[id]); //log
    if (timer[id] != undefined) {
        clearInterval(timer[id]);
        clientList[id - 1].lastTime = getTime();
    } else {
        //添加字段
        // console.log("添加字段"); //log
        inertData(clientList[id - 1]);
    }
    let timeR = setInterval(() => {
        let ountdown = clientList[id - 1].ountdown;
        // clientList[id - 1].ountdown--;
        countdown.setCountDown(ountdown, (ms) => {
            clientList[id - 1].ountdown = ms / 1000;
        });
        // console.log(clientList[id - 1].ountdown);
        if (clientList[id - 1].ountdown == 0) {
            clientList[id - 1].runStaus = -1;
            clearInterval(timer[id]);
            timer[id] = null;
        }
    }, 1000)
    timer[id] = timeR;
    // console.log("用户数量：" + clientList.length + "\ttotal:" + total);
    res.send();
    // console.log(clientList);
});

//接收停止请求
server.put('/stop', (req, res) => {
    let data = req.body;
    // console.log(data);
    if (typeof(data.hostname) == undefined) {
        console.log("参数错误");
        res.send("错误");
        return;
    }
    sql = `select id from client where hostname = "${data.hostname}"`
    selectDataFromSql(sql, (results) => {
        let id = JSON.parse(results)[0].id;
        clientList[id - 1].stopTime = getTime();
        clientList[id - 1].runStaus = 0;
        clientList[id - 1].isStop = true;
        // console.log(clientList[id - 1]);
        clearInterval(timer[id]);
    });
    res.send();
});

server.get('/name', (req, res) => {
    res.send('/name');
});
// 启动
server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});