const drugs = require("./drugs.js");
const contacts = require("./contacts.js");
const purchase = require("./purchase.js");
const hospital = require("./hospital.js");
const sqles = require("./sales.js");
const report = require("./report.js");
const code = require("./code.js");
const sql = require("./runSql.js");

Date.prototype.format = function(fmt) {
     var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt;
}

exports.runAction = function(){
	drugs.drugs();
	contacts.contacts();
	purchase.purchase();
	hospital.hospital();
	sqles.sales();
  report.report();
  code.getCode();
	sql.runSql();
}
