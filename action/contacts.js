const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
const path = require('path');

exports.contacts = function(){
	ipcMain.on('get-contacts-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(path.join(__dirname,'../data/iae.db'));
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
		const db = new sqlite3.Database(path.join(__dirname,'../data/iae.db'));
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
		const db = new sqlite3.Database(path.join(__dirname,'../data/iae.db'));
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
		const db = new sqlite3.Database(path.join(__dirname,'../data/iae.db'));
		var deleteSql = "delete from contacts where contacts_id = '"+arg+"'";
		db.run(deleteSql,function(err,res){
			event.sender.send('delete-contacts-return',"success");
		});
	  	db.close();
	});
	ipcMain.on('close', e => mainWindow.close());
}
//Cannot find module 
//'/Users/lvyang/HBuilderProjects/iae/node_modules/sqlite3/lib/binding/electron-v1.8-darwin-x64/node_sqlite3.node
//npm install nan --save
//node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-darwin-x64
//node-gyp rebuild --target=1.8.2 --arch=x64 --target_platform=darwin --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-darwin-x64
//node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-win32-x64
//node-gyp rebuild --target=1.8.2 --arch=x64 --target_platform=win32 --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-win32-x64