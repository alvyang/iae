var fs = require("fs")
var sqlite3 = require("sqlite3").verbose();
var dbPath = require("./sql.js").getdbPath();
// var UUID = require('uuid');
function execSql(flag){
	const db = new sqlite3.Database(dbPath);
	/*
	 * 判断是否第一次安装，第一次，执行全量sql。否则，执行，增量sql
	 */
	if(flag){//执行全量sql
		var ts = require("../data/total.js").getTotalSql();
		for(var i = 0 ; i < ts.length ; i++){
			db.serialize(function() {
			  db.run(ts[i]);
			});
		}
		// var sql = "insert into purchase (code) values ("+UUID.v1()+")"
		// db.run(sql);
	}else{

	}
	db.close();
}

exports.runSql = function(){
	//是否要执行全量sql，如果数据库文件不存在，执行全量sql，否则执行增量sql
	fs.access(dbPath,function(err){
		//文件和目录不存在的情况下；并执行全量sql
    if(err && err.code == "ENOENT"){
				execSql(true);
    }
	});
}
