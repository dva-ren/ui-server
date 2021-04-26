/**
 * 提供准确的倒计时
 */
var timerList = []

function setCountDown(s, id, func) {
    //继续线程占用
    // setInterval(function() {
    //     var j = 0;
    //     while (j++ < 100000000);
    // }, 0);
    //倒计时
    var interval = 1000,
        ms = s * 1000, //从服务器和活动开始时间计算出的时间差
        count = 0,
        startTime = new Date().getTime();
    if (ms >= 0) {
        var timeCounter = setTimeout(countDownStart, interval);
    }
    let timer = new Object();
    timer.id = id;
    timer.flag = true; //停止标志位
    timerList.push(timer);
    let index = 0;
    for (let i; i < timerList.length; i++) {
        if (timerList[i].id === id) {
            index = i;
        }
    }

    function countDownStart() {
        count++;
        var offset = new Date().getTime() - (startTime + count * interval);
        var nextTime = interval - offset;
        // var daytohour = 0;
        if (nextTime < 0) { nextTime = 0 };
        ms -= interval;
        // console.log("误差：" + offset + "ms，下一次执行：" + nextTime + "ms后，离活动开始还有：" + ms / 1000 + "s");
        func(ms / 1000)
        if (ms < 0) {
            clearTimeout(timeCounter);
        } else {
            if (timerList[index].flag) {
                timeCounter = setTimeout(countDownStart, nextTime);
            } else {
                clearTimeout(timeCounter);
                timerList.splice(index, 1);
            }
        }
    }

}

function stopTimer(id) {
    if (timerList.length == 0) {
        return;
    }
    let index = 0;
    for (let i; i < timerList.length; i++) {
        if (timerList[i].id === id) {
            index = i;
        }
    }
    timerList[index].flag = false;
}
module.exports = {
    setCountDown,
    stopTimer
}