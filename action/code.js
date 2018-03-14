const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
const getmac = require("getmac");
var dbPath = require("./sql.js").getdbPath();

exports.getCode = function(){
	ipcMain.on('get-code', (event, arg) => {
		getmac.getMac(function(err,macAddress){
	     	if (err)  throw err;
	     	// var mac = macAddress; //获取mac地址
	     	event.sender.send('code-return',macAddress);
 		});
		// sqlite3.verbose();
		// const db = new sqlite3.Database(dbPath);
		// var codeSql = "select * from code";
		// db.get(codeSql,function(err,res){
		// 	event.sender.send('code-return',res);
		// });
	  // 	db.close();
	});
	ipcMain.on('close', e => mainWindow.close());
}
