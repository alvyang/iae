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
    var purchaseSql = "select * from purchase p left join ("+sql+") d where p.drugs_id == d.product_id ";
		purchaseSql += " order by p.purchase_id limit "+arg.limit+" offset " +arg.start;
    var countSql = "select count(*) as count from purchase p left join ("+sql+") d";
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
	ipcMain.on('edit-drugs', (event, arg) => {

	});
	ipcMain.on('delete-drugs', (event, arg) => {//删除

	});
	ipcMain.on('close', e => mainWindow.close());
}
//Cannot find module
//'/Users/lvyang/HBuilderProjects/iae/node_modules/sqlite3/lib/binding/electron-v1.8-darwin-x64/node_sqlite3.node
//
//node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-darwin-x64
//node-gyp rebuild --target=1.8.2 --arch=x64 --target_platform=darwin --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-darwin-x64
