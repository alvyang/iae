const drugs = require("./drugs.js");
const contacts = require("./contacts.js");
const purchase = require("./purchase.js");
const sql = require("./runSql.js");

exports.runAction = function(){
	drugs.drugs();
	contacts.contacts();
	purchase.purchase();
	sql.runSql();
}
