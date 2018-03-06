const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();
exports.purchase = function(){
	//查询药品列表信息
	ipcMain.on('get-purchases-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
    //查询报表时，先查询药品信息
		var sql = "select drugs.*,contacts.contacts_name from drugs left join contacts where drugs.contacts=contacts.contacts_id ";
		if(arg.productCommonName){
			sql += "and product_common_name like '%"+arg.productCommonName+"%'";
		}
		if(arg.contactId){
			sql += "and contacts = '"+arg.contactId+"'";
		}

    //查询进货记录
    var purchaseSql = "select * from purchase p left join ("+sql+") d where p.delete_flag != '1' and p.drugs_id == d.product_id ";
		purchaseSql += " order by p.purchase_id limit "+arg.limit+" offset " +arg.start;
    var countSql = "select count(*) as count from purchase p left join ("+sql+") d where p.delete_flag != '1' and p.drugs_id == d.product_id";
		db.all(purchaseSql,function(err,res){
			db.get(countSql,function(err1,count){
				// 返回消息
		  		event.sender.send('return-purchase-data', {
		  			count:count.count,
		  			data:res
		  		});
			});
		});
		db.close();
	});
	ipcMain.on('edit-purchase', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var sql = "";
		if(!arg.purchase_id){//如果没有id,新增
			var id = new Date().getTime();
			var keys="purchase_id,",value="'"+id+"',";
			for(a in arg){
				keys += a+",";
				value += "'"+arg[a]+"',";
			}
			keys = keys.substring(0,keys.length-1); //取键
			value = value.substring(0,value.length-1);//取值
			sql = "insert into purchase ("+keys+") values ("+value+")";
		}else{//修改
			var keyValue="";
			for(a in arg){
				keyValue += ""+a+"='"+arg[a]+"',";
			}
			keyValue = keyValue.substring(0,keyValue.length-1);
			sql = "update purchase set "+keyValue+" where purchase_id = '"+arg.purchase_id+"'";
		}
		db.run(sql,function(err,res){
			event.sender.send('edit-purchase-return',sql);
		});
		db.close();
	});
	ipcMain.on('delete-purchase', (event, arg) => {//删除
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var deleteSql = "update purchase set delete_flag = '1' where purchase_id = '"+arg+"'";
		db.run(deleteSql,function(err,res){
			event.sender.send('delete-purchase-return',"success");
		});
  	db.close();
	});
	ipcMain.on('close', e => mainWindow.close());
}
