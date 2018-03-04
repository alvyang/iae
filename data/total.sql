CREATE TABLE "contacts" (
	 "contacts_id" text(50,0) NOT NULL DEFAULT NULL,
	 "contacts_name" TEXT(20,0),
	 "contacts_phone" TEXT(20,0),
	PRIMARY KEY("contacts_id")
);
CREATE TABLE "drugs" (
	 "product_common_name" TEXT(50,0),
	 "product_specifications" TEXT(10,0),
	 "product_unit" TEXT(10,0),
	 "product_business" TEXT(20,0),
	 "product_id" text(50,0) NOT NULL DEFAULT NULL,
	 "contacts" text(50,0),
	 "product_price" TEXT(20,0),
	 "product_commission" TEXT(20,0),
	PRIMARY KEY("product_id"),
	FOREIGN KEY ("contacts") REFERENCES "contacts" ("contacts_id")
);

PRAGMA foreign_keys = true;
