const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
// const os = require("os");
// const getmac = require("getmac");

var os = require('os');
var dbPath = require("./sql.js").getdbPath();

exports.getCode = function(){

	ipcMain.on('get-code', (event, arg) => {
		console.log(getLocalIP());
		// getmac.getMac(function(err,macAddress){
	  //    	if (err)  throw err;
	  //    	event.sender.send('code-return',macAddress);
 		// });
		// sqlite3.verbose();
		// const db = new sqlite3.Database(dbPath);
		// var codeSql = "select * from code";
		// db.get(codeSql,function(err,res){
		// 	event.sender.send('code-return',res);
		// });
  	// db.close();
	});
	ipcMain.on('close', e => mainWindow.close());
}

/**
 * 获取指定网卡的IP
 * @param name 网卡名
 * @param family IP版本 IPv4 or IPv5
 * @returns ip
 */
function getLocalIP(name, family) {
    //所有的网卡
    var ifaces = os.networkInterfaces();

		console.log(ifaces);
    //移除loopback,没多大意义
    for (var dev in ifaces) {
        if (dev.toLowerCase().indexOf('loopback') != -1) {
            delete  ifaces[dev];
            continue;
        }
    }


    var ip = null;
    family = family.toUpperCase();


    var iface = null;
    if (name == null) {
        for (var dev in ifaces) {
            ifaces[dev].forEach(function (details) {
                if (details.family.toUpperCase() === family) {
                    ip = details.address;
                }
            });
            break;
        }
        return ip;
    }
    var nameList = name.split(',');
    for (var i = 0, j = nameList.length; i < j; i++) {
        var key = nameList[i];


        //指定的链接不存在
        if (ifaces[key] == null) {
            continue;
        }


        ifaces[key].forEach(function (details) {
            if (details.family.toUpperCase() === family) {
                ip = details.address;
            }
        });
        if (ip != null) {
            break;
        }
    }
    if (ip == null) {
        ip = '127.0.0.1';
        // logger.error('get ip error, return 127.0.0.1, please check');
    }


    return ip;
}
