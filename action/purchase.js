const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();
exports.purchase = function(){
	//查询药品列表信息
	ipcMain.on('get-purchases-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
    //查询进货记录
    var purchaseSql = "select * from purchase p left join drugs d left join contacts c on d.contacts=c.contacts_id where p.drugs_id == d.product_id and p.delete_flag != '1' ";
    var countSql = "select count(*) as count from purchase p left join drugs d left join contacts c on d.contacts=c.contacts_id where p.drugs_id == d.product_id and p.delete_flag != '1' ";
		var moneySql = "select sum(p.puchase_money) as pm,sum(p.shoule_return_money) as sm,sum(p.real_return_money) as rm from purchase p left join drugs d left join contacts c on d.contacts=c.contacts_id where p.drugs_id == d.product_id and p.delete_flag != '1' ";

		if(arg.productCommonName){
			purchaseSql += "and d.product_common_name like '%"+arg.productCommonName+"%'";
			countSql += "and d.product_common_name like '%"+arg.productCommonName+"%'";
			moneySql += "and d.product_common_name like '%"+arg.productCommonName+"%'";
		}
		if(arg.contactId){
			purchaseSql += "and d.contacts = '"+arg.contactId+"'";
			countSql += "and d.contacts = '"+arg.contactId+"'";
			moneySql += "and d.contacts = '"+arg.contactId+"'";
		}
		if(arg.storageTime.length > 0){
      var start = new Date(arg.storageTime[0]).format("yyyy-MM-dd") + " 00:00:00";
			var end = new Date(arg.storageTime[1]).format("yyyy-MM-dd") + " 23:59:59";
      purchaseSql += " and datetime(p.storage_time) >= datetime('"+start+"') and datetime(p.storage_time) <= datetime('"+end+"')";
      countSql += " and datetime(p.storage_time) >= datetime('"+start+"') and datetime(p.storage_time) <= datetime('"+end+"')";
			moneySql += " and datetime(p.storage_time) >= datetime('"+start+"') and datetime(p.storage_time) <= datetime('"+end+"')";
    }
		if(arg.status == "1"){//未返
			purchaseSql += " and p.shoule_return_money == p.own_money";
			countSql += " and p.shoule_return_money == p.own_money";
			moneySql += " and p.shoule_return_money == p.own_money";
		}else if(arg.status == "2"){//部分返
			purchaseSql += " and p.shoule_return_money - p.real_return_money > 0 and p.real_return_money != '0'";
			countSql += " and p.shoule_return_money - p.real_return_money > 0 and p.real_return_money != '0'";
			moneySql += " and p.shoule_return_money - p.real_return_money > 0 and p.real_return_money != '0'";
		}else if(arg.status == "3"){//全返
			purchaseSql += " and p.own_money == '0'";
			countSql += " and p.own_money == '0'";
			moneySql += " and p.own_money == '0'";
		}
		purchaseSql += " order by p.purchase_id desc limit "+arg.limit+" offset " +arg.start;
		db.all(purchaseSql,function(err,res){
			db.get(countSql,function(err1,count){
				db.get(moneySql,function(err1,money){
					// 返回消息
			  		event.sender.send('return-purchase-data', {
			  			count:count.count,
							money:money,
			  			data:res
			  		});
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
				if(a == "storage_time" || a == "should_return_time" || a == "real_return_time"){
					var time = new Date(arg[a]).format("yyyy-MM-dd")+"T00:00:00.000Z";
					keys += a+",";
					value += "'"+time+"',";
				}else{
					keys += a+",";
					value += "'"+arg[a]+"',";
				}
			}
			keys = keys.substring(0,keys.length-1); //取键
			value = value.substring(0,value.length-1);//取值
			sql = "insert into purchase ("+keys+") values ("+value+")";
		}else{//修改
			var keyValue="";
			for(a in arg){
				if(a == "storage_time" || a == "should_return_time" || a == "real_return_time"){
					var time = new Date(arg[a]).format("yyyy-MM-dd")+"T00:00:00.000Z";
					keyValue += ""+a+"='"+time+"',";
				}else{
					keyValue += ""+a+"='"+arg[a]+"',";
				}
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
