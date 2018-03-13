const electron = require('electron');
const ipcMain = electron.ipcMain;
const sqlite3 = require("sqlite3");
var dbPath = require("./sql.js").getdbPath();

exports.sales = function(){
	//查询药品列表信息
	ipcMain.on('get-sales-list', (event, arg) => {
		sqlite3.verbose();
		const db = new sqlite3.Database(dbPath);
    //查询报表时，先查询药品信息
		var sql = "select * from drugs where 1=1 ";
		if(arg.productCommonName){
			sql += "and product_common_name like '%"+arg.productCommonName+"%'";
		}
    //查询销售记录
    var salesSql = "select *,h.hospital_name from sales s inner join ("+sql+") d on s.drugs_id == d.product_id  left join hospital h on s.sales_hospital_id == h.hospital_id where s.delete_flag != '1' ";
    var countSql = "select count(*) as count from sales s inner join ("+sql+") d on s.drugs_id == d.product_id where s.delete_flag != '1' ";
    if(arg.hospitalsId){
      salesSql += " and s.sales_hospital_id = '"+arg.hospitalsId+"'";
      countSql += " and s.sales_hospital_id = '"+arg.hospitalsId+"'";
    }
    if(arg.salesTime){
      var d = new Date(arg.salesTime).format("yyyy-MM-dd");
      salesSql += " and s.sales_time like '%"+d+"%'";
      countSql += " and s.sales_time like '%"+d+"%'";
    }
    salesSql += " order by s.sales_id desc limit "+arg.limit+" offset " + arg.start;
    db.all(salesSql,function(err,res){
			db.get(countSql,function(err1,count){
				// 返回消息
	  		event.sender.send('return-sales-data', {
	  			count:count.count,
	  			data:res
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
				keys += a+",";
				value += "'"+arg[a]+"',";
			}
			keys = keys.substring(0,keys.length-1); //取键
			value = value.substring(0,value.length-1);//取值
			sql = "insert into sales ("+keys+") values ("+value+")";
		}else{//修改
			var keyValue="";
			for(a in arg){
				keyValue += ""+a+"='"+arg[a]+"',";
			}
			keyValue = keyValue.substring(0,keyValue.length-1);
			sql = "update sales set "+keyValue+" where sales_id = '"+arg.sales_id+"'";
		}
    console.log(sql);
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
