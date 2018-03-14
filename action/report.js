const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();
exports.report = function(){
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
