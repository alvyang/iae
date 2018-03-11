const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();

exports.hospital = function(){
	ipcMain.on('get-hospitals-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var sql = "select * from hospital where delete_flag != '1' ";
		var countSql = "select count(*) as count from hospital where delete_flag != '1' ";
		if(arg.hospitalName){
			sql += "and hospital_name like '%"+arg.hospitalName+"%'";
			countSql += "and hospital_name like '%"+arg.hospitalName+"%'";
		}
		sql += " order by hospital_id desc limit "+arg.limit+" offset " +arg.start;
		db.all(sql,function(err,res){//分页查询
			db.get(countSql,function(err1,count){//获取总数
				//返回消息
	  		event.sender.send('return-hospitals-data', {
	  			count:count.count,
	  			data:res
	  		});
			});
		});
		db.close();
	});
	ipcMain.on('get-hospitals-list-all', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var contactsAllSql = "select hospital_id,hospital_name from hospital where delete_flag != '1'";
		db.all(contactsAllSql,function(err,res){//分页查询
			// 返回消息
  		event.sender.send('return-hospital-all-data', {
  			data:res
  		});
		});
		db.close();
	});
	ipcMain.on('edit-hospital', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var sql = "";
		if(!arg.hospital_id){
			var id = new Date().getTime();
			var keys="hospital_id,",value="'"+id+"',";
			for(a in arg){
				keys += a+",";
				value += "'"+arg[a]+"',";
			}
			keys = keys.substring(0,keys.length-1); //取键
			value = value.substring(0,value.length-1);//取值
			sql = "insert into hospital ("+keys+") values ("+value+")";
		}else{
			var keyValue="";
			for(a in arg){
				keyValue += ""+a+"='"+arg[a]+"',";
			}
			keyValue = keyValue.substring(0,keyValue.length-1);
			sql = "update hospital set "+keyValue+" where hospital_id = '"+arg.hospital_id+"'";
		}
		db.run(sql,function(err,res){
			event.sender.send('edit-hospital-return',"success");
		});
  	db.close();
	});

	ipcMain.on('delete-hospital', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var deleteSql = "update hospital set delete_flag = '1' where hospital_id = '"+arg+"'";
		db.run(deleteSql,function(err,res){
			event.sender.send('delete-hospital-return',"success");
		});
	  	db.close();
	});
	ipcMain.on('close', e => mainWindow.close());
}
