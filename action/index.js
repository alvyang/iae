const drugs = require("./drugs.js");
const contacts = require("./contacts.js");
const purchase = require("./purchase.js");
const hospital = require("./hospital.js");
const sql = require("./runSql.js");

exports.runAction = function(){
	drugs.drugs();
	contacts.contacts();
	purchase.purchase();
	hospital.hospital();
	sql.runSql();
}
