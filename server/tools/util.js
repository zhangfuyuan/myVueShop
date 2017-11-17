// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1,                      //月份
        "d+": this.getDate(),                           //日
        "h+": this.getHours(),                          //小时
        "m+": this.getMinutes(),                        //分
        "s+": this.getSeconds(),                        //秒
        "q+": Math.floor((this.getMonth() + 3) / 3),    //季度
        "S": this.getMilliseconds()                     //毫秒
    };

    // 第一步：将参数首次重复出现的 y 替换成年份字符
    // RegExp.$1 是RegExp的一个属性,指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    // 第二步：将参数首次重复出现的 M、d、h、m、s、q、S 替换成相应的时间字符
    // 当用户需要双位数格式时：
    //      客观时间为个位数 -> 补零后，3个字符取索引为1开始的字符
    //      客观时间为双位数 -> 补零后，4个字符取索引为2开始的字符
    // 新的补零方法：("00" + t).substr(("" + t).length)
    for (var k in o) {
        if ((new RegExp("(" + k + ")")).test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }

    return fmt;
};
    // 调用：
    // var time1 = new Date().Format("yyyy-MM-dd");
    // var time2 = new Date().Format("yyyy-MM-dd HH:mm:ss");
module.exports = {};