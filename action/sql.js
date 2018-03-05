/*
 * 该js 用于创建数据库连接等
 */
const path = require('path');
// var dbPath = path.join(__dirname,'../iae.db');
var dbPath = "/Users/lvyang/iae.db";

exports.getdbPath = function(){
  return dbPath;
}
