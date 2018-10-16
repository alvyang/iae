const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();

exports.sales = function(){
	//查询药品列表信息
	ipcMain.on('export-sales-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
    //查询报表时，先查询药品信息
		var sql = "select * from drugs where 1=1 ";
		if(arg.productCommonName){
			sql += "and product_common_name like '%"+arg.productCommonName+"%'";
		}
    //查询销售记录
    var salesSql = "select *,date(s.sales_time) as st,h.hospital_name from sales s inner join ("+sql+") d on s.drugs_id == d.product_id  left join hospital h on s.sales_hospital_id == h.hospital_id where s.delete_flag != '1' ";
		if(arg.hospitalsId){
      salesSql += " and s.sales_hospital_id = '"+arg.hospitalsId+"'";
    }
    if(arg.salesTime.length > 0){
			var start = new Date(arg.salesTime[0]).format("yyyy-MM-dd") + " 00:00:00";
			var end = new Date(arg.salesTime[1]).format("yyyy-MM-dd") + " 23:59:59";
      salesSql += " and datetime(s.sales_time) >= datetime('"+start+"') and datetime(s.sales_time) <= datetime('"+end+"')";
    }
    db.all(salesSql,function(err,res){
			// 返回消息
			event.sender.send('return-export-sales-data', {
				data:res
			});
		});
		db.close();
	});
	//查询药品列表信息
	ipcMain.on('get-sales-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
    //查询销售记录
    var salesSql = "select *,h.hospital_name from sales s inner join drugs d on s.drugs_id == d.product_id  left join hospital h on s.sales_hospital_id == h.hospital_id where s.delete_flag != '1' ";
    var countSql = "select count(*) as count from sales s inner join drugs d on s.drugs_id == d.product_id where s.delete_flag != '1' ";
		var countMoneySql = "select sum(s.sales_money) as money from sales s inner join drugs d on s.drugs_id == d.product_id where s.delete_flag != '1' ";
		if(arg.hospitalsId){
      salesSql += " and s.sales_hospital_id = '"+arg.hospitalsId+"'";
      countSql += " and s.sales_hospital_id = '"+arg.hospitalsId+"'";
			countMoneySql += " and s.sales_hospital_id = '"+arg.hospitalsId+"'";
    }
		if(arg.productCommonName){
			salesSql += "and d.product_common_name like '%"+arg.productCommonName+"%'";
			countSql += "and d.product_common_name like '%"+arg.productCommonName+"%'";
			countMoneySql += "and d.product_common_name like '%"+arg.productCommonName+"%'";
		}
    if(arg.salesTime.length > 0){
			var start = new Date(arg.salesTime[0]).format("yyyy-MM-dd") + " 00:00:00";
			var end = new Date(arg.salesTime[1]).format("yyyy-MM-dd") + " 23:59:59";
      salesSql += " and datetime(s.sales_time) >= datetime('"+start+"') and datetime(s.sales_time) <= datetime('"+end+"')";
      countSql += " and datetime(s.sales_time) >= datetime('"+start+"') and datetime(s.sales_time) <= datetime('"+end+"')";
			countMoneySql += " and datetime(s.sales_time) >= datetime('"+start+"') and datetime(s.sales_time) <= datetime('"+end+"')";
    }
    salesSql += " order by s.sales_id desc limit "+arg.limit+" offset " + arg.start;
    db.all(salesSql,function(err,res){
			db.get(countSql,function(err1,count){
				db.get(countMoneySql,function(err1,money){
					// 返回消息
		  		event.sender.send('return-sales-data', {
		  			count:count.count,
						money:money.money,
		  			data:res
		  		});
				});
			});
		});
		db.close();
	});
	ipcMain.on('edit-sale', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var sql = "";
		if(!arg.sales_id){//如果没有id,新增
			var id = new Date().getTime();
			var keys="sales_id,",value="'"+id+"',";
			for(a in arg){
				if(a == "sales_time"){
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
			sql = "insert into sales ("+keys+") values ("+value+")";
		}else{//修改
			var keyValue="";
			for(a in arg){
				if(a == "sales_time"){
					var time = new Date(arg[a]).format("yyyy-MM-dd")+"T00:00:00.000Z";
					keyValue += ""+a+"='"+time+"',";
				}else{
					keyValue += ""+a+"='"+arg[a]+"',";
				}
			}
			keyValue = keyValue.substring(0,keyValue.length-1);
			sql = "update sales set "+keyValue+" where sales_id = '"+arg.sales_id+"'";
		}
		db.run(sql,function(err,res){
			event.sender.send('edit-sale-return',"success");
		});
		db.close();
	});
	ipcMain.on('delete-sales', (event, arg) => {//删除
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var deleteSql = "update sales set delete_flag = '1' where sales_id = '"+arg+"'";
		db.run(deleteSql,function(err,res){
			event.sender.send('delete-sales-return',"success");
		});
  	db.close();
	});
	ipcMain.on('close', e => mainWindow.close());
}
