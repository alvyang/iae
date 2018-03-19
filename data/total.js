exports.getTotalSql = function(){
	return [
		"CREATE TABLE 'code' ('code' text(200,0) NOT NULL,PRIMARY KEY('code'));",
		"CREATE TABLE 'contacts' ('contacts_id' text(50,0) NOT NULL DEFAULT NULL,'contacts_name' TEXT(20,0),'contacts_phone' TEXT(20,0),'delete_flag' TEXT(2,0) DEFAULT 0,PRIMARY KEY('contacts_id'));",
		"CREATE TABLE 'drugs' ('product_common_name' TEXT(50,0),'product_specifications' TEXT(10,0),'product_unit' TEXT(10,0),'product_business' TEXT(20,0),'product_id' text(50,0) NOT NULL DEFAULT NULL,'contacts' text(50,0),'product_price' TEXT(20,0),'product_commission' TEXT(20,0),'delete_flag' TEXT(2,0) DEFAULT 0,'product_code' TEXT(20,0),'product_makesmakers' TEXT(100,0),'product_type' TEXT(2,0),PRIMARY KEY('product_id'),FOREIGN KEY ('contacts') REFERENCES 'contacts' ('contacts_id'));",
		"CREATE TABLE 'hospital' ('hospital_id' text(50,0) NOT NULL,'hospital_name' TEXT(50,0),'hospital_address' TEXT(100,0),'delete_flag' TEXT(2,0) DEFAULT 0,PRIMARY KEY('hospital_id'));",
		"CREATE TABLE 'purchase' ('purchase_id' text(50,0) NOT NULL,'puchase_number' text(100,0),'puchase_money' TEXT(100,0),'storage_time' TEXT(20,0),'shoule_return_money' TEXT(100,0),'real_return_money' TEXT(100,0),'real_return_time' TEXT(20,0),'own_money' TEXT(100,0),'should_return_time' TEXT(20,0),'drugs_id' text(50,0),'delete_flag' TEXT(2,0) DEFAULT 0,'regenerator' TEXT(20,0),'payee' TEXT(20,0),PRIMARY KEY('purchase_id'),FOREIGN KEY ('drugs_id') REFERENCES 'drugs' ('product_id'));",
		"CREATE TABLE 'sales' ('sales_id' text(50,0) NOT NULL,'sales_time' TEXT(20,0),'sales_number' text(20,0),'sales_money' TEXT(20,0),'sales_hospital_id' TEXT(50,0),'drugs_id' text(50,0),'delete_flag' TEXT(2,0) DEFAULT 0,PRIMARY KEY('sales_id'),FOREIGN KEY ('sales_hospital_id') REFERENCES 'hospital' ('hospital_id'),FOREIGN KEY ('drugs_id') REFERENCES 'drugs' ('product_id'));"
	];
}
