const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();

exports.contacts = function(){
	ipcMain.on('get-contacts-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var sql = "select * from contacts where 1=1 ";
		var countSql = "select count(*) as count from contacts where 1=1 ";
		if(arg.contactName){
			sql += "and contacts_name like '%"+arg.contactName+"%'";
			countSql += "and contacts_name like '%"+arg.contactName+"%'";
		}
		sql += " order by contacts_id desc limit "+arg.limit+" offset " +arg.start;
		db.all(sql,function(err,res){//分页查询
			db.get(countSql,function(err1,count){//获取总数
				// 返回消息
		  		event.sender.send('return-contacts-data', {
		  			count:count.count,
		  			data:res
		  		});
			});
		});
		db.close();
	});
	ipcMain.on('get-contacts-list-all', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var contactsAllSql = "select contacts_id,contacts_name from contacts";
		db.all(contactsAllSql,function(err,res){//分页查询
			// 返回消息
	  		event.sender.send('return-contacts-all-data', {
	  			data:res
	  		});
		});
		db.close();
	});
	ipcMain.on('edit-contacts', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var sql = "";
		if(!arg.contacts_id){
			var id = new Date().getTime();
			var keys="contacts_id,",value="'"+id+"',";
			for(a in arg){
				keys += a+",";
				value += "'"+arg[a]+"',";
			}
			keys = keys.substring(0,keys.length-1); //取键
			value = value.substring(0,value.length-1);//取值
			sql = "insert into contacts ("+keys+") values ("+value+")";
		}else{
			var keyValue="";
			for(a in arg){
				keyValue += ""+a+"='"+arg[a]+"',";
			}
			keyValue = keyValue.substring(0,keyValue.length-1);
			sql = "update contacts set "+keyValue+" where contacts_id = '"+arg.contacts_id+"'";
		}

		db.run(sql,function(err,res){
			event.sender.send('edit-contacts-return',"success");
		});
	  	db.close();
	});

	ipcMain.on('delete-contacts', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var deleteSql = "delete from contacts where contacts_id = '"+arg+"'";
		db.run(deleteSql,function(err,res){
			event.sender.send('delete-contacts-return',"success");
		});
	  	db.close();
	});
	ipcMain.on('close', e => mainWindow.close());
}
