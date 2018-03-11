const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();
exports.drugs = function(){
	//查询药品列表信息
	ipcMain.on('get-drugs-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var sql = "select drugs.*,contacts.contacts_name from drugs left join contacts on drugs.contacts=contacts.contacts_id  where drugs.delete_flag !='1' ";
		var countSql = "select count(*) as count from drugs where delete_flag !='1' ";
		if(arg.productCommonName){
			sql += "and product_common_name like '%"+arg.productCommonName+"%'";
			countSql += "and product_common_name like '%"+arg.productCommonName+"%'";
		}
		if(arg.contactId){
			sql += "and contacts = '"+arg.contactId+"'";
			countSql += "and contacts = '"+arg.contactId+"'";
		}
		if(arg.productType){
			sql += "and product_type = '"+arg.productType+"'";
			countSql += "and product_type = '"+arg.productType+"'";
		}
		sql += " order by product_id limit "+arg.limit+" offset " +arg.start;
		db.all(sql,function(err,res){
			db.get(countSql,function(err1,count){
				// 返回消息
		  		event.sender.send('return-drugs-data', {
		  			count:count.count,
		  			data:res
		  		});
			});
		});
		db.close();
	});
	ipcMain.on('edit-drugs', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var sql = "";
		if(!arg.product_id){//如果没有id,新增
			var id = new Date().getTime();
			var keys="product_id,",value="'"+id+"',";
			for(a in arg){
				keys += a+",";
				value += "'"+arg[a]+"',";
			}
			keys = keys.substring(0,keys.length-1); //取键
			value = value.substring(0,value.length-1);//取值
			sql = "insert into drugs ("+keys+") values ("+value+")";
		}else{//修改
			var keyValue="";
			for(a in arg){
				keyValue += ""+a+"='"+arg[a]+"',";
			}
			keyValue = keyValue.substring(0,keyValue.length-1);
			sql = "update drugs set "+keyValue+" where product_id = '"+arg.product_id+"'";
		}
		db.run(sql,function(err,res){
			event.sender.send('edit-drugs-return',"success");
		});
		db.close();
	});

	ipcMain.on('delete-drugs', (event, arg) => {//删除
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var deleteSql = "update drugs set delete_flag = '1' where product_id = '"+arg+"'";
		db.run(deleteSql,function(err,res){
			event.sender.send('delete-drugs-return',"success");
		});
	  	db.close();
	});
	ipcMain.on('close', e => mainWindow.close());
}
