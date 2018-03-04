const drugs = require("./drugs.js");
const contacts = require("./contacts.js");
const sql = require("./runSql.js");

exports.runAction = function(){
	drugs.drugs();
	contacts.contacts();
	sql.runSql();
}
