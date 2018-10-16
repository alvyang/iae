const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
const os = require("os");
var dbPath = require("./sql.js").getdbPath();

exports.getCode = function(){

	ipcMain.on('get-code', (event, arg) => {
		var macAddress="";
		const networksObj = os.networkInterfaces();
		for(let nw in networksObj){
		    let objArr = networksObj[nw];
		    objArr.forEach((obj,idx,arr)=>{
					if(obj.family === 'IPv4' && obj.address !== '127.0.0.1' && !obj.internal){
						macAddress = obj.mac;
						// console.log(`地址：${obj.address}`);
		        // console.log(`掩码：${obj.netmask}`);
		        // console.log(`物理地址：${obj.mac}`);
		        // console.log(`协议族：${obj.family}`);
					}
		    });
		}
		event.sender.send('code-return',macAddress);
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
