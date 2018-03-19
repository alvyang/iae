const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();
exports.report = function(){
	//获取销售返利曲线
	ipcMain.on('get_report_1', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var reportSql1 = "select sum(p.shoule_return_money) as srm,sum(p.real_return_money) as rrm,d.product_common_name from purchase p left join drugs d where p.drugs_id == d.product_id and p.delete_flag != '1' ";
		if(arg.time.length > 0){
			var start = new Date(arg.time[0]).format("yyyy-MM-dd") + " 00:00:00";
			var end = new Date(arg.time[1]).format("yyyy-MM-dd") + " 23:59:59";
			reportSql1 += " and datetime(p.storage_time) >= datetime('"+start+"') and datetime(p.storage_time) <= datetime('"+end+"')";
		}

		reportSql1 += "group by d.product_id order by sum(p.shoule_return_money) desc limit 7 offset 0"
		db.all(reportSql1,function(err,res){
			var d = {
				srm:[],//应返金额
				rrm:[],//实返金额
				pcn:[]//药品名称
			};
			for(var i = 0 ;i < res.length;i++){
				d.srm.push(res[i].srm);
				d.rrm.push(res[i].rrm);
				d.pcn.push(res[i].product_common_name);
			}
			event.sender.send('get_report_return1',d);
		});
		db.close();
	});
	//获取销售量曲线
	ipcMain.on('get_report_2', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var reportSql2 = "select sum(p.puchase_number) as pn,d.product_common_name,d.product_unit from purchase p left join drugs d where p.drugs_id == d.product_id and p.delete_flag != '1' ";
		if(arg.time.length > 0){
			var start = new Date(arg.time[0]).format("yyyy-MM-dd") + " 00:00:00";
			var end = new Date(arg.time[1]).format("yyyy-MM-dd") + " 23:59:59";
			reportSql2 += " and datetime(p.storage_time) >= datetime('"+start+"') and datetime(p.storage_time) <= datetime('"+end+"') ";
		}

		reportSql2 += "group by d.product_id order by sum(p.puchase_number) desc limit 7 offset 0"
		db.all(reportSql2,function(err,res){
			var d = {
				pn:[],//销售量
				pcn:[]//药品名称
			};
			for(var i = 0 ;i < res.length;i++){
				d.pn.push(res[i].pn);
				d.pcn.push(res[i].product_common_name);
			}
			event.sender.send('get_report_return2',d);
		});
		db.close();
	});
	//获取普通品种销售额曲线
	ipcMain.on('get_report_3', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var reportSql3 = "select sum(s.sales_money) as sm,d.product_common_name,d.product_unit from sales s left join drugs d where s.drugs_id == d.product_id and s.delete_flag != '1' ";
		if(arg.time.length > 0){
			var start = new Date(arg.time[0]).format("yyyy-MM-dd") + " 00:00:00";
			var end = new Date(arg.time[1]).format("yyyy-MM-dd") + " 23:59:59";
			reportSql3 += " and datetime(s.sales_time) >= datetime('"+start+"') and datetime(s.sales_time) <= datetime('"+end+"') ";
		}

		reportSql3 += "group by d.product_id order by sum(s.sales_money) desc limit 7 offset 0"
		db.all(reportSql3,function(err,res){
			var d = {
				sm:[],//销售额
				pcn:[]//药品名称
			};
			for(var i = 0 ;i < res.length;i++){
				d.sm.push(res[i].sm);
				d.pcn.push(res[i].product_common_name);
			}
			event.sender.send('get_report_return3',d);
		});
		db.close();
	});
	//获取普通销售量曲线
	ipcMain.on('get_report_4', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var reportSql3 = "select sum(s.sales_number) as sm,d.product_common_name,d.product_unit from sales s left join drugs d where s.drugs_id == d.product_id and s.delete_flag != '1' ";
		if(arg.time.length > 0){
			var start = new Date(arg.time[0]).format("yyyy-MM-dd") + " 00:00:00";
			var end = new Date(arg.time[1]).format("yyyy-MM-dd") + " 23:59:59";
			reportSql3 += " and datetime(s.sales_time) >= datetime('"+start+"') and datetime(s.sales_time) <= datetime('"+end+"') ";
		}

		reportSql3 += "group by d.product_id order by sum(s.sales_number) desc limit 7 offset 0"
		db.all(reportSql3,function(err,res){
			var d = {
				sm:[],//销售额
				pcn:[]//药品名称
			};
			for(var i = 0 ;i < res.length;i++){
				d.sm.push(res[i].sm);
				d.pcn.push(res[i].product_common_name);
			}
			event.sender.send('get_report_return4',d);
		});
		db.close();
	});
	//获取普通品种近30天销售曲线量曲线
	ipcMain.on('get_report_5', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var reportSql5 = "select sum(s.sales_number) as sm,sum(s.sales_money) as sm2,datetime(s.sales_time,'start of day') as time from sales s where s.delete_flag != '1' ";
		reportSql5 += "group by datetime(s.sales_time,'start of day') order by datetime(s.sales_time,'start of day') desc limit 30 offset 0"
		db.all(reportSql5,function(err,res){
			var d = {
				sm:[],//销售量
				sm2:[],//销售额
				time:[]//药品名称
			};
			for(var i = 0 ;i < res.length;i++){
				d.sm.push(res[i].sm);
				d.sm2.push(res[i].sm2);
				d.time.push(res[i].time);
			}
			event.sender.send('get_report_return5',d);
		});
		db.close();
	});
	//获取高打品种近30天销售曲线量曲线
	ipcMain.on('get_report_6', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var reportSql6 = "select sum(p.puchase_number) as pn,sum(p.shoule_return_money) as srm,sum(p.real_return_money) as rrm,sum(p.puchase_money) as pm,datetime(p.storage_time,'start of day') as time from purchase p where p.delete_flag != '1' ";
		reportSql6 += "group by datetime(p.storage_time,'start of day') order by datetime(p.storage_time,'start of day') desc limit 30 offset 0"
		db.all(reportSql6,function(err,res){
			var d = {
				pn:[],//采购数量
				srm:[],//应返金额
				rrm:[],//实返金额
				pm:[],//采购金额
				time:[]//药品名称
			};
			for(var i = 0 ;i < res.length;i++){
				d.pn.push(res[i].pn);
				d.srm.push(res[i].srm);
				d.rrm.push(res[i].rrm);
				d.pm.push(res[i].pm);
				d.time.push(res[i].time);
			}
			event.sender.send('get_report_return6',d);
		});
		db.close();
	});
	//查询药品列表信息
	ipcMain.on('get_purchase_report', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
		var purchaseSql = "select sum(p.puchase_money) as pm,sum(p.shoule_return_money) as sm,sum(p.real_return_money) as rm,d.contacts from purchase p left join drugs d where p.drugs_id == d.product_id and p.delete_flag != '1' group by d.contacts ";
		var reportSql = "select * from ("+purchaseSql+") pd left join contacts c where pd.contacts = c.contacts_id";

		db.all(reportSql,function(err,res){
			event.sender.send('return-purchase-report', {
				data:res
			});
		});

		db.close();
	});

	ipcMain.on('close', e => mainWindow.close());
}
