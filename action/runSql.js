var fs = require("fs");
const path = require('path');
var sqlite3 = require("sqlite3").verbose();

exports.runSql = function(){
	var file ="/Users/lvyang/HBuilderProjects/iae/data/iaae.db";
	var exists = fs.existsSync(file);
	
	if(!exists){
		fs.open(file,"w",(err, fd) => {
		  	
		});
	}
	var db = new sqlite3.Database(file);  //connect to our file/database

}
