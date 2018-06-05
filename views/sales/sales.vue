<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
			<div>
			  <el-form-item label="产品名称" prop="productCommonName">
			    <el-input v-model="params.productCommonName" @keyup.13.native="reSearch(false)" size="small" placeholder="产品名称"></el-input>
			  </el-form-item>
				<el-form-item label="销售机构" prop="hospitalsId">
				 <el-select v-model="params.hospitalsId" filterable size="small" placeholder="请选择">
					 <el-option key="" label="全部" value=""></el-option>
					 <el-option v-for="item in hospitals"
						 :key="item.hospital_id"
						 :label="item.hospital_name"
						 :value="item.hospital_id">
					 </el-option>
			 	</el-select>
			 </el-form-item>
			 <el-form-item label="品种类型" prop="productType">
				 <el-select v-model="params.productType" style="width: 240px;" size="small" multiple placeholder="请选择">
					 <el-option key="普药" label="普药" value="普药"></el-option>
					 <el-option key="佣金" label="佣金" value="佣金"></el-option>
					 <el-option key="高打" label="高打" value="高打"></el-option>
					 <el-option key="高打(底价)" label="高打(底价)" value="高打(底价)"></el-option>
					 <el-option key="其它" label="其它" value="其它"></el-option>
				 </el-select>
			 </el-form-item>
		 </div>
		 <div>
			 <el-form-item label="　　日期" prop="salesTime">
				 <el-date-picker v-model="params.salesTime" type="daterange" size="small" align="right" unlink-panels
					 range-separator="至"
					 start-placeholder="开始日期"
					 end-placeholder="结束日期"
					 :picker-options="pickerOptions2">
				 </el-date-picker>
			 </el-form-item>
		   <el-form-item>
		     <el-button type="primary" style="margin-left: 14px;" @click="reSearch(false)" size="small">查询</el-button>
				 <el-button type="primary" @click="reSearch(true)" size="small">重置</el-button>
		     <el-button type="primary" v-show="authCode.indexOf('68') > -1"  @click="add" size="small">新增</el-button>
				 <el-button type="primary" v-show="authCode.indexOf('70') > -1" @click="exportExcel" size="small">导出</el-button>
		   </el-form-item>
		 </div>
		</el-form>
		<div class="sum_money">销售总额：<a>{{money}}</a> 元</div>
		<el-table :data="sales" style="width: 100%" :stripe="true" :border="true">
  			<el-table-column fixed prop="bill_date" label="日期" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="hospital_name" label="医院名称" width="180"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="140"></el-table-column>
				<el-table-column prop="product_common_name" label="产品名称" width="180" ></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="120"></el-table-column>
				<el-table-column prop="product_packing" label="单位" width="60"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
				<el-table-column prop="sale_price" label="中标价" width="100"></el-table-column>
				<el-table-column prop="sale_num" label="计划数量" width="100"></el-table-column>
				<el-table-column prop="sale_money" label="购入金额" width="120"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="130">
		    <template slot-scope="scope">
			    <el-button @click.native.prevent="deleteRow(scope)" v-show="authCode.indexOf('67') > -1"  icon="el-icon-delete" type="primary" size="small"></el-button>
	        <el-button @click.native.prevent="editRow(scope)" v-show="authCode.indexOf('66') > -1"  icon="el-icon-edit-outline" type="primary" size="small"></el-button>
		    </template>
  			</el-table-column>
		</el-table>
		<div class="page_div">
			<el-pagination
				background
	      @size-change="handleSizeChange"
	      @current-change="handleCurrentChange"
	      :current-page="currentPage"
	      :page-sizes="[5, 10, 50, 100]"
	      :page-size="pageNum"
	      layout="total, sizes, prev, pager, next"
	      :total="count">
	    </el-pagination>
		</div>
		<el-dialog title="修改销售记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+sale.product_common_name+ '）'" name="1">
			    <div><span>产品编号:</span>{{sale.product_code}}</div>
			    <div><span>产品规格:</span>{{sale.product_specifications}}</div>
					<div><span>中标价:</span>{{sale.sale_price}}</div>
					<div><span>包装:</span>{{sale.product_packing}}</div>
					<div><span>单位:</span>{{sale.product_unit}}</div>
					<div style="display:block;width:100%;"><span>生产产家:</span>{{sale.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="sale" status-icon :rules="saleRule" style="margin-top:20px;" :inline="true" ref="sale" label-width="100px" class="demo-ruleForm">
				<el-form-item label="计划数量" prop="sale_num" :maxlength="10" :required="true" >
					<el-input v-model="sale.sale_num" style="width:194px;" placeholder="请输入计划数量" @blur="saleNumBlur();"></el-input>
				</el-form-item>
				<el-form-item label="购入金额" prop="sale_money">
					<el-input v-model="sale.sale_money" style="width:194px;"  auto-complete="off" :readonly="true"></el-input>
				</el-form-item>
				<el-form-item label="销售机构" prop="hospital_id">
					<el-select v-model="sale.hospital_id" filterable placeholder="请选择销售机构">
						<el-option v-for="item in hospitals"
							:key="item.hospital_id"
							:label="item.hospital_name"
							:value="item.hospital_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="销售日期" prop="bill_date">
					<el-date-picker v-model="sale.bill_date" style="width:194px;" type="date" placeholder="请选择销售时间"></el-date-picker>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="editSales('sale')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	import XLSX from 'xlsx';
	export default({
		data(){
			var validateNum = (rule, value, callback) => {
				var regu = /^\+?[1-9][0-9]*$/;
				if (value === '') {
					callback(new Error('请输入计划数量'));
				} else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
					callback();
				}
			};
			const defaultEnd = new Date();
			const defaultStart = new Date(defaultEnd.getFullYear()+"-01"+"-01");
			return {
				pickerOptions2: {
					shortcuts: [{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				sales:[],
				contacts:[],
				pageNum:10,
				currentPage:1,
				count:0,
				hospitals:[],
				money:'',//销售总额
				params:{//查询参数
					productCommonName:"",
					salesTime:[defaultStart,defaultEnd],
					hospitalsId:"",
					productType:""
				},
				sale:{},//修改的销售信息
				saleRule:{
					sale_num:[{validator: validateNum,trigger: 'blur,change' }],
					bill_date:[{ required: true, message: '请选择销售时间', trigger: 'blur,change' }],
					hospital_id:[{ required: true, message: '请选择销售机构', trigger: 'blur,change' }],
				},
				dialogFormVisible:false,
				authCode:"",
			}
		},
		activated(){
			this.getSalesList();
			this.getHospitals();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			exportExcel(){
				var url = this.$bus.data.host + "/iae/sales/exportSales?1=1";
				if(this.params.productCommonName){
			    url+="&name="+this.params.productCommonName
			  }
			  if(this.params.productType){
			    var type = this.params.productType;
			    var t = "";
			    for(var i = 0 ; i < type.length ; i++){
			      t+="'"+type[i]+"',"
			    }
			    t = t.substring(0,t.length-1);
			    url+="&type="+t;
			  }
			  if(this.params.hospitalsId){
			    url+="&id="+this.params.hospitalsId;
			  }
			  if(this.params.salesTime){
			    var start = new Date(this.params.salesTime[0]).format("yyyy-MM-dd");
			    var end = new Date(this.params.salesTime[1]).format("yyyy-MM-dd");
					url+="&start="+start+"&end="+end;
			  }
				window.location = url;
				// var _self = this;
				// this.jquery('/iae/sales/getAllSales',{
				// 	data:_self.params
        // },function(res){
				// 	var _headers = ['bill_date', 'hospital_name', 'product_code', 'product_common_name', 'product_specifications','product_unit','sale_price','sale_num','sale_money','product_type','buyer'];
			  //   var _headersCha = ['日期', '销售机构', '产品编码', '产品名称', '产品规格','单位','中标价','计划数量','购入金额','品种类型','采购员']
			  //   var _data = res.message;
				// 	for(var i = 0 ; i < _data.length; i++){
				// 		_data[i].bill_date = new Date(_data[i].bill_date).format('yyyy-MM-dd');
				// 		_data[i].sale_price = parseFloat(_data[i].sale_price);
				// 		_data[i].sale_num = parseInt(_data[i].sale_num);
				// 		_data[i].sale_money = parseFloat(_data[i].sale_money);
				// 	}
			  //   var headers = _headers.map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 1 })).reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});
			  //   var headersCha = _headersCha.map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 1 })).reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});
			  //   var data = _data.map((v, i) => _headers.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65+j) + (i+2) })))
			  //                 .reduce((prev, next) => prev.concat(next))
			  //                 .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});
				// 	// 合并 headers 和 data
			  //   var output = Object.assign({}, headersCha, data);
			  //   // 获取所有单元格的位置
			  //   var outputPos = Object.keys(output);
			  //   // 计算出范围
			  //   var ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
			  //   // 构建 workbook 对象
			  //   var wb = {
			  //     SheetNames: ["report"],
			  //     Sheets: {}
			  //   };
			  //   wb.Sheets["report"] = Object.assign({}, output, { '!ref': ref });
			  //   // 导出 Excel
			  //   XLSX.writeFile(wb, "report"+'.xlsx');
        // });
			},
			formatterDate(row, column, cellValue){
				var temp = cellValue.substring(0,10);
				var d = new Date(temp);
				d.setDate(d.getDate()+1);
				return d.format("yyyy-MM-dd");
			},
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				this.sale = scope.row;
			},
			deleteRow(scope){//删除
				this.$confirm('是否删除?', '提示', {
          	confirmButtonText: '确定',
          	cancelButtonText: '取消',
          	type: 'warning'
        }).then(() => {
						this.deleteItem(scope);
        }).catch(() => {
        });
			},
			deleteItem(scope){
				var _self = this;
				this.jquery('/iae/sales/deleteSales',{
					sale_id:scope.row.sale_id,
					delete_flag:""
				},function(res){
					_self.$message({message: '删除成功',type: 'success'});
					_self.getSalesList();
					_self.dialogFormVisible = false;
				});
			},
			//跳转到编辑页面
			add(){
				sessionStorage["hospitals"] = JSON.stringify(this.hospitals);
				this.$router.push("/main/salesdrugs");
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getSalesList();
			},
			getHospitals(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',null,function(res){
						_self.hospitals = res.message;
				});
			},
			getSalesList(){
				var _self = this;
        if(!_self.currentPage){
          _self.currentPage = 1;
        }
        if(!_self.pageNum){
          _self.pageNum = 10;
        }
				var page = {
          start:(_self.currentPage-1)*_self.pageNum,
          limit:_self.pageNum
        }
        this.jquery('/iae/sales/getSales',{
					data:_self.params,
          page:page
        },function(res){
						console.log(res);
						_self.money = res.message.saleMoney;
            _self.sales = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			editSales(formName){
				var _self = this;
				this.sale.sale_price = this.sale.product_price;
				this.sale.gross_profit = this.sale.cost_univalent*this.sale.sale_num;
				this.sale.gross_profit = this.sale.gross_profit.toFixed(2);
				this.$refs[formName].validate((valid) => {
						if (valid) {
							_self.jquery('/iae/sales/editSales',_self.sale,function(res){
								_self.dialogFormVisible = false;
								_self.$message({message: '修改成功',type: 'success'});
								_self.getSalesList();
							});
						} else {
							return false;
						}
				});
			},
			saleNumBlur(){
				var regu = /^\+?[1-9][0-9]*$/;
				if(this.sale.sale_num && regu.test(this.sale.sale_num)){
					this.sale.sale_money = (this.sale.sale_num * this.sale.sale_price).toFixed(2);
				}
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getSalesList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getSalesList();
    	}
		}
	});
</script>
<style>
	.sum_money{
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		line-height: 30px;
		padding-left: 10px;
		font-size: 14px;
		color:#606266;
	}
	.sum_money a{
		color: #f24040;
	}
	.main_content .el-date-editor--daterange{
		width: 310px !important;
	}
	.main_content .el-date-editor--daterange > input{
		width: 37% !important;
	}
	.el-collapse-item__content > div{
		display: inline-block;
		width: 30%;
	}
	.el-collapse-item__content > div > span{
		display: inline-block;
		width: 56px;
		text-align: right;
		padding-right: 10px;
	}
</style>
