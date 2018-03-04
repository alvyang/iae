const path = require('path');
var sqlite3 = require("sqlite3").verbose();
exports.runSql = function(){
	
	const db = new sqlite3.Database(path.join(__dirname,'iae.db'));

}
