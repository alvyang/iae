<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/main/sales' }">销售管理</el-breadcrumb-item>
			<el-breadcrumb-item>选择药品<a style="color:#f24040;">（请先选择销售药品）</a></el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="　联系人" prop="contactId">
				<el-select v-model="params.contactId" style="width:210px;" size="mini" filterable placeholder="请选择联系人">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts" :key="item.contacts_id" :label="item.contacts_name" :value="item.contacts_id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="商业" prop="business">
				<el-select v-model="params.business" style="width:210px;" size="mini" filterable placeholder="请选择商业">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in business"
 					 :key="item.business_id"
 					 :label="item.business_name"
 					 :value="item.business_id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="品种类型" prop="product_type">
				<el-select v-model="params.product_type" style="width:210px;" size="mini" multiple placeholder="请选择">
					<el-option key="佣金" label="佣金" value="佣金"></el-option>
					<el-option key="高打" label="高打" value="高打"></el-option>
					<el-option key="其它" label="其它" value="其它"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="医保类型" prop="product_medical_type">
				<el-select v-model="params.product_medical_type" style="width:210px;" size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="甲类" label="甲类" value="甲类"></el-option>
					<el-option key="乙类" label="乙类" value="乙类"></el-option>
					<el-option key="丙类" label="丙类" value="丙类"></el-option>
					<el-option key="省医保" label="省医保" value="省医保"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="是否配送" prop="product_distribution_flag">
				<el-select v-model="params.product_distribution_flag" style="width:210px;" size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="0" label="配送" value="0"></el-option>
					<el-option key="1" label="不配送" value="1"></el-option>
				</el-select>
			</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick @click="searchDrugsList" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick @click="reSearch" size="mini">重置</el-button>
				<el-button type="primary" v-dbClick @click="returnSale" size="mini">返回列表</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
			<el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
			<el-table-column prop="product_code" label="产品编号" width="100"></el-table-column>
			<el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
			<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
			<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
			<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
			<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
			<el-table-column prop="buyer" label="采购员" width="60"></el-table-column>
			<el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
			<el-table-column prop="product_discount" label="扣率" width="60"></el-table-column>
			<el-table-column prop="product_mack_price" label="打款价" width="60"></el-table-column>
			<el-table-column prop="product_type" label="返费类型" width="70"></el-table-column>
			<!-- <el-table-column prop="product_return_money" label="返费金额" width="80" :formatter="formatNull"></el-table-column>
			<el-table-column prop="product_return_discount" label="返费率" width="80" :formatter="formatNull"></el-table-column>
			<el-table-column prop="product_return_explain" label="返费说明" width="200" :formatter="formatNull"></el-table-column> -->
			<el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
			<el-table-column prop="product_medical_type" label="医保类型" ></el-table-column>
			<!-- <el-table-column prop="remark" label="备注" width="200"></el-table-column> -->
			<el-table-column fixed="right" label="操作" width="70">
		    <template slot-scope="scope">
					<el-button v-dbClick @click.native.prevent="selectRow(scope)" type="primary" size="mini">选择</el-button>
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
	      layout="total, sizes, prev, pager, next, jumper"
	      :total="count">
	    </el-pagination>
		</div>
		<el-dialog title="新增销售记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="1">
			    <div><span>产品编号:</span>{{drug.product_code}}</div>
			    <div><span>产品规格:</span>{{drug.product_specifications}}</div>
					<div><span>中标价:</span>{{drug.product_price}}</div>
					<div><span>包装:</span>{{drug.product_packing}}</div>
					<div><span>单位:</span>{{drug.product_unit}}</div>
					<div style="display:block;width:100%;"><span>生产产家:</span>{{drug.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="sale" status-icon :rules="saleRule" style="margin-top:20px;" :inline="true" ref="sale" label-width="100px" class="demo-ruleForm">
				<div>
					<el-form-item label="销售类型" prop="sale_type">
						<el-radio v-model="sale.sale_type" label="1">销售出库</el-radio>
						<el-radio v-model="sale.sale_type" label="2">销售退回</el-radio>
						<el-radio v-model="sale.sale_type" label="3">销售退补价</el-radio>
					</el-form-item>
				</div>
				<el-form-item label="销售单价" prop="sale_price" :maxlength="10" :required="true" >
					<el-input v-model="sale.sale_price" style="width:194px;" placeholder="请输入销售单价"></el-input>
				</el-form-item>
				<el-form-item label="计划数量" prop="sale_num" :maxlength="10" :required="true" >
					<el-input v-model="sale.sale_num" style="width:194px;" placeholder="请输入计划数量"></el-input>
				</el-form-item>
				<el-form-item label="购入金额" prop="sale_money">
					<el-input v-model="sale.sale_money" style="width:194px;"  auto-complete="off" :readonly="true"></el-input>
				</el-form-item>
				<el-form-item label="销往单位" prop="hospital_id">
					<el-select v-model="sale.hospital_id" @change="hospitalChange" style="width:194px;" filterable placeholder="请选择销售机构">
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
			<div style="font-size:12px;color:#f04040;" v-show="!drug.product_code">温馨提示：该药品无产品编码，不可添加。请到药品管理中维护。</div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="addSales('sale')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
export default({
	data(){
		var validateNum = (rule, value, callback) => {
			var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
			if (value === '') {
				callback(new Error('请输入计划数量'));
			} else if(!regu.test(value)){
				callback(new Error('请输入整数'));
			} else {
				this.sale.sale_money = this.mul(this.sale.sale_num,this.sale.sale_price,2);
				callback();
			}
		};
		return {
			drugs:[],
			contacts:[],
			pageNum:10,
			currentPage:1,
			count:0,
			authCode:"",
			dialogFormVisible:false,
			loading:false,
			params:{
				productCommonName:"",
				contactId:"",
				product_type:"",
				product_medical_type:"",
				product_code:"",
				business:"",
				product_distribution_flag:"0",
			},
			sale:{
				product_code:"",
				sale_money:"",
				sale_price:"",
				sale_num:"",
				gross_profit:"",
				real_gross_profit:"",
				accounting_cost:"",
				cost_univalent:"",
				group_id:"",
				bill_date:new Date(),
				hospital_id:"",
				sale_type:"1",
				sale_return_flag:"",
			},
			drug:{},//选择的药品信息
			hospitals:[],
			business:[],
			saleRule:{
				sale_num:[{validator: validateNum,trigger: 'blur' }],
				bill_date:[{ required: true, message: '请选择销售时间', trigger: 'change' }],
				hospital_id:[{ required: true, message: '请选择销售机构', trigger: 'change' }],
			}
		}
	},
	activated(){
		this.getDrugsList();
		this.getContacts();
		this.hospitals = JSON.parse(sessionStorage["hospitals"]);
		this.business = JSON.parse(sessionStorage["business"]);
		this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted(){

	},
	methods:{
		hospitalChange(){
			var _self = this;
			this.jquery('/iae/sales/selesPolicy',{product_id:this.drug.product_id,hospital_id:this.sale.hospital_id},function(res){
				if(res.message.length > 0){
					_self.sale.sale_return_price=res.message[0].sale_policy_money?res.message[0].sale_policy_money:"";
					_self.sale.sale_contact_id = res.message[0].sale_policy_contact_id?res.message[0].sale_policy_contact_id:"";
				}else{
					_self.sale.sale_return_price="";
					_self.sale.sale_contact_id = "";
				}
			});
		},
		addSales(formName){
			if(!this.drug.product_code){
				return;
			}
			this.sale.gross_profit = 0;
			this.sale.real_gross_profit= 0;
			if(this.drug.product_mack_price){
				this.sale.gross_profit = this.mul(this.sale.sale_num,this.sub(this.sale.sale_price,this.drug.product_mack_price),2);
			}
			if(this.drug.accounting_cost){
				this.sale.real_gross_profit = this.mul(this.sale.sale_num,this.sub(this.sale.sale_price,this.drug.accounting_cost),2);
			}
			this.sale.accounting_cost = this.drug.accounting_cost;
			this.sale.cost_univalent = this.drug.product_mack_price;
			this.sale.product_code = this.drug.product_code;
			this.sale.product_type = this.drug.product_type;
			this.sale.product_id = this.drug.product_id;
			this.sale.sale_return_flag = this.drug.product_return_statistics;
			this.sale.stock = this.drug.stock;
			this.sale.sale_tax_rate = this.drug.product_tax_rate;
			this.sale.product_return_money = this.drug.product_return_money;
			this.sale.product_return_time_type = this.drug.product_return_time_type;
			this.sale.product_return_time_day = this.drug.product_return_time_day;
		  this.sale.product_return_time_day_num = 	this.drug.product_return_time_day_num;
			var _self = this;
			this.$refs[formName].validate((valid) => {
					if(_self.sale.sale_return_price){//销售回款金额
						_self.sale.sale_return_money=_self.mul(_self.sale.sale_return_price,_self.sale.sale_num);
					}
					if (valid) {
						this.loading = true;
						_self.jquery('/iae/sales/saveSales',_self.sale,function(res){
							_self.$confirm('新增成功', '提示', {
									confirmButtonText:'继续添加',
									cancelButtonText:'返回销售列表',
									type: 'success'
							}).then(() => {
									_self.$refs["sale"].resetFields();
									_self.dialogFormVisible = false;
									_self.loading = false;
							}).catch(() => {
									_self.$refs["sale"].resetFields();
									_self.dialogFormVisible = false;
									_self.loading = false;
									_self.$router.push({path:`/main/sales`});
							});
						});
					} else {
						return false;
					}
			});
		},
		returnSale(){
			this.$router.push({path:"/main/sales"});
		},
		selectRow(scope){
			this.drug = scope.row;
			if(this.$refs["sale"]){
				this.$refs["sale"].resetFields();
			}
			this.sale.sale_price = this.drug.product_price;
			this.dialogFormVisible = true;
		},
		formatNull(row, column, cellValue, index){
			if(row.product_type == "其它"){
				return "-";
			}else{
				return cellValue;
			}
		},
		getContacts(){
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种','佣金品种']},function(res){
				_self.contacts = res.message;
			});
		},
		formatterPer(row, column, cellValue){
			var per = row.product_commission/row.product_price*100;
			return per.toFixed(2)+"%";
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
			this.jquery('/iae/drugs/deleteDrugs',{
				product_id:scope.row.product_id
			},function(res){
				_self.$message({showClose: true,message: '删除成功',type: 'success'});
				_self.getDrugsList();
				_self.dialogFormVisible = false;
			});
		},
		//搜索所有药品信息
		searchDrugsList(){
			this.getDrugsList();
		},
		getDrugsList(){
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
			this.jquery('/iae/drugs/getDrugs',{
				data:_self.params,
				page:page
			},function(res){
					_self.drugs = res.message.data;
					_self.pageNum=parseInt(res.message.limit);
					_self.count=res.message.totalCount;
			});
		},
		reSearch(arg){
			if(arg){
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getDrugsList();
		},
		handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.params.limit = this.pageNum;
			this.getDrugsList();
		},
		handleCurrentChange(val) {
			this.currentPage = val;
			this.params.start = (val-1)*this.pageNum;
			this.params.limit = this.pageNum;
			this.getDrugsList();
		}
	}
});
</script>
<style scoped="scoped">
.el-table .cell{
	white-space: nowrap;
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
