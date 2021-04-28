var express = require('express');
var router = express.Router();
const { querySql, insertSql, updateSql } = require('../api/querySql')
const { setCountDown, stopTimer } = require('../util/countdown')

var usersList = []; //用户列表

//用户信息构造器
function User(id, list, hostName, ipAddress, sleepTime) {
    this.id = id;
    this.runStatus = 1;
    this.name = '';
    this.firstOnlineTime = getTime();
    this.lastRefreshTime = getTime();
    this.stopTime = '';
    this.list = list;
    this.hostName = hostName;
    this.ipAddress = ipAddress;
    this.sleepTime = sleepTime;
    this.countDown = sleepTime;
    this.isFist = false;
    this.isStop = false;
}

init();
/* GET home page. */
router.get('/', function(req, res, next) {
    // console.log(usersList);
    res.json(usersList);
});
/* PUT 主方法. */
router.put('/put', function(req, res, next) {
    let data = req.body; //客户端发送的数据
    let nowTime = getTime();
    // console.log(data);
    queryId(data.addres, (id) => {
        // console.log("数据库id：" + id);
        let userId = null;
        if (id > 0) {
            //数据库有记录
            userId = id;
            let updateData = '';
            let model_sql = '';
            // console.log("id=" + id);
            if (usersList[id - 1].isStop == true) {
                //停止运行状态，更新userList数据
                usersList[id - 1].runStatus = 1;
                usersList[id - 1].firstOnlineTime = nowTime;
                usersList[id - 1].lastRefreshTime = nowTime;
                usersList[id - 1].isStop = false;
                usersList[id - 1].isFist = false;
                usersList[id - 1].countDown = data.sleeptime;
                usersList[id - 1].stopTime = null;
                //更新数据库数据
                model_sql = 'runStatus = ?,firstOnlineTime=?,lastRefreshTime=?,isStop=?,isFist=?,countDown=?,stopTime=? ';
                updateData = [1, nowTime, nowTime, 'false', 'false', data.sleeptime, 'null']
            } else {
                //正在运行中
                usersList[id - 1].runStatus = 1;
                usersList[id - 1].lastRefreshTime = nowTime;
                usersList[id - 1].countDown = data.sleeptime;
                //更新数据库数据
                model_sql = 'lastRefreshTime = ?,countDown = ?';
                updateData = [nowTime, data.sleeptime];
            }
            updateSql(model_sql, updateData, userId);
        } else if (id == -1) {
            //数据库无记录
            // console.log("没有数据");
            userId = usersList.length + 1;
            //添加用户数据
            let user = new User(userId, data.list, data.hostname, data.addres, data.sleeptime);
            usersList.push(user);
            insertDataToSql(user);
        }
        //倒计时
        setCountDown(usersList[userId - 1].countDown, userId, (s) => {
            usersList[userId - 1].countDown = s;
            // console.log("id:" + userId + "\t剩余时间：" + s);
            if (s == 0) {
                usersList[userId - 1].runStatus = -1;
            }
        })
        res.send();
    });
    res.render('index', { title: 'put成功' });
});

/**
 * 接收停止请求
 * @returns 
 */
router.put('/stop', (req, res, next) => {
    let data = req.body;
    queryId(data.addres, (id) => {
        let nowTime = getTime()
            // console.log("id:" + id);
        usersList[id - 1].runStatus = 0;
        usersList[id - 1].stopTime = nowTime;
        usersList[id - 1].isStop = true;
        let v3 = [0, nowTime, 'true']
        let model_sql = 'runStatus = ?,stopTime = ?,isStop = ?'
        updateSql(model_sql, v3, id);
        // console.log(usersList);
        stopTimer(id);
    });
    res.send("停止成功");
});
//修改name属性
router.get('/setname', (req, res, next) => {
    let { id, name } = req.query;
    if (id > usersList.length || id == undefined || name == undefined) {
        res.send("参数错误");
        return;
    }
    setName(id, name);
    res.send("修改成功");
})

/**
 * 设置name属性
 * @param {*id} id 
 * @param {*name} name 
 */
function setName(id, name) {
    let sql = `update users set name = "${name}" where id=${id};`
        // console.log(sql);
    querySql(sql, (res) => {

    });
    try {
        usersList[id - 1].name = name;
    } catch (error) {

    }
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

/**
 * 根据ip地址查询id 返回-1为未查询到数据
 * @param {*ip地址} ipAddress 
 * @param {*根据ip地址查询的id，-1表示没有数据} callback 
 */
function queryId(ipAddress, callback) {
    let sql = `select id from users where ipAddress = "${ipAddress}"`;
    var id = -1;
    querySql(sql, (res) => {
        if (res !== null) {
            id = res[0].id;
        }
        callback(id);
    })
}

/**
 * 向数据库插入初始化数据
 * @param {*要插入的数据} data 
 */
function insertDataToSql(data) {
    let sql = `INSERT INTO users (runStatus,firstOnlineTime,lastRefreshTime,list,hostName,ipAddress,sleepTime,isFist,isStop) values (${data.runStatus},"${data.firstOnlineTime}","${data.lastRefreshTime}","${data.list}","${data.hostName}","${data.ipAddress}",${data.sleepTime},"${data.isFist}","${data.isStop}")`;
    insertSql(sql);
}
/**
 * 根据id查询数据库数据
 */
function queryOne(id, callback) {
    let sql = `select * from users where id=${id}`;
    let data = null;
    querySql(sql, (res) => {
        if (res !== null) {
            data = res[0].id;
        }
        callback(data);
    });
}
/**
 * 查询数据库所有数据
 */
function queryAll(callback) {
    let sql = `select * from users`;
    let data = null;
    querySql(sql, (res) => {
        if (res !== null) {
            data = res;
        }
        callback(data);
    });
}

function init() {
    queryAll((res_data) => {
        if (res_data != null) {
            for (let i = 0; i < res_data.length; i++) {
                usersList.push(res_data[i]);
            }
        }
    });
}

module.exports = router;