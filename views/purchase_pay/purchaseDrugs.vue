<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item>采购管理</el-breadcrumb-item>
		  <el-breadcrumb-item :to="{ path: '/main/purchasepay' }">预付招商管理</el-breadcrumb-item>
			<el-breadcrumb-item>选择药品<a style="color:#f24040;">（请先选择预付药品）</a></el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="searchDrugsList" size="mini" placeholder="产品名称"></el-input>
		  </el-form-item>
			<el-form-item label="产品编码" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="searchDrugsList" size="mini" placeholder="产品编码"></el-input>
		  </el-form-item>
		  <el-form-item label="联系人" prop="contactId">
		    <el-select v-model="params.contactId" style="width:210px;" size="mini" filterable placeholder="请选择">
		    	<el-option key="" label="全部" value=""></el-option>
			    <el-option v-for="item in contacts" v-if="item.contact_type.indexOf('高打品种')>-1"
			      :key="item.contacts_id"
			      :label="item.contacts_name"
			      :value="item.contacts_id">
			    </el-option>
				</el-select>
		  </el-form-item>
			<el-form-item label="　　商业" prop="business">
 			 <el-select v-model="params.business" style="width:210px;" size="mini" filterable placeholder="请选择商业">
 				 <el-option key="" label="全部" value=""></el-option>
 				 <el-option v-for="item in business"
 					 :key="item.business_id"
 					 :label="item.business_name"
 					 :value="item.business_id"></el-option>
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
				<el-button type="primary" v-dbClick @click="returnPurchase" size="mini">返回列表</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品名称" width="200"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="150"></el-table-column>
				<!-- <el-table-column prop="product_supplier" label="供货单位" width="150"></el-table-column> -->
				<el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
  			<el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="product_mack_price" label="打款价" width="60"></el-table-column>
				<el-table-column prop="product_discount" label="毛利率(百分比)" :formatter="formatPercent" width="60"></el-table-column>
				<!-- <el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column> -->
				<el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
				<el-table-column prop="business_name" label="商业"></el-table-column>
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
		<el-dialog title="新增预付招商记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{drug.product_code}}</div>
			    <div><span>产品规格:</span>{{drug.product_specifications}}</div>
					<div><span>中标价:</span>{{drug.product_price}}</div>
					<div><span>包装:</span>{{drug.product_packing}}</div>
					<div><span>单位:</span>{{drug.product_unit}}</div>
					<div><span>打款价:</span>{{drug.product_mack_price}}</div>
					<div style="display:block;width:100%;"><span>生产厂家:</span>{{drug.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="purchasePay" ref="purchasePay" status-icon :rules="purchasePayRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="业务员" prop="purchase_pay_contact_id">
			    <el-select v-model="purchasePay.purchase_pay_contact_id" style="width:179px;" @change="contactChange" filterable placeholder="请选择">
			    	<el-option key="" label="全部" value=""></el-option>
				    <el-option v-for="item in contacts" v-if="item.contact_type.indexOf('业务员')>-1"
				      :key="item.contacts_id"
				      :label="item.contacts_name"
				      :value="item.contacts_id">
				    </el-option>
					</el-select>
			  </el-form-item>
				<el-form-item label="商业" prop="purchase_pay_business_id">
					<el-select v-model="purchasePay.purchase_pay_business_id" style="width:179px;" filterable placeholder="请选择商业">
						<el-option v-for="item in business"
						 :key="item.business_id"
						 :label="item.business_name"
						 :value="item.business_id"></el-option>
						</el-select>
					</el-select>
				</el-form-item>
				<el-form-item label="预付价" prop="purchase_pay_price" >
					<el-input v-model="purchasePay.purchase_pay_price" style="width:179px;"></el-input>
				</el-form-item>
				<el-form-item label="预付数量" prop="purchase_pay_number" >
					<el-input v-model="purchasePay.purchase_pay_number" style="width:179px;" :maxlength="10" placeholder="请输入购入数量"></el-input>
				</el-form-item>
				<el-form-item label="预付金额" prop="purchase_pay_money" >
					<el-input v-model="purchasePay.purchase_pay_money" style="width:179px;"></el-input>
				</el-form-item>
				<el-form-item label="补点/费用票" prop="purchase_pay_other_money">
					<el-input v-model="purchasePay.purchase_pay_other_money" style="width:179px;" placeholder="补点/费用票"></el-input>
				</el-form-item>
				<el-form-item label="合同时间" prop="purchase_pay_contract_time">
					<el-date-picker v-model="purchasePay.purchase_pay_contract_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="付款时间" prop="purchase_pay_time">
					<el-date-picker v-model="purchasePay.purchase_pay_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="发货时间" prop="purchase_pay_send_time">
					<el-date-picker v-model="purchasePay.purchase_pay_send_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="到货时间" prop="purchase_pay_arrived_time">
					<el-date-picker v-model="purchasePay.purchase_pay_arrived_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input v-model="purchasePay.purchase_pay_receive_remark" style="width:179px;"></el-input>
			 	</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="addPurchasePay('purchasePay')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validateNum = (rule, value, callback) => {
				var regu = /^\+?[1-9][0-9]*$/;
        if (value === '') {
          callback(new Error('请输入预付数量'));
        } else if(!regu.test(value)){
					callback(new Error('预付数量为正整数'));
				} else {
					this.purchasePay.purchase_pay_money = this.purchasePay.purchase_pay_money?this.purchasePay.purchase_pay_money:this.purchasePay.purchase_pay_number * this.purchasePay.purchase_pay_price;
					this.purchasePay.purchase_pay_money = Math.round(this.purchasePay.purchase_pay_money*100)/100;
          callback();
        }
      };
			var validateMoney = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
        if(value === ''){
					callback(new Error('请输入'+rule.message));
				}else if (!reg.test(value)) {
        	callback(new Error('请输入正确的'+rule.message));
        } else {
					this.purchasePay.purchase_pay_money = this.purchasePay.purchase_pay_money?this.purchasePay.purchase_pay_money:this.purchasePay.purchase_pay_number * this.purchasePay.purchase_pay_price;
					this.purchasePay.purchase_pay_money = Math.round(this.purchasePay.purchase_pay_money*100)/100;
          callback();
        }
    	};
			return {
				loading:false,
				dialogFormVisible:false,
				drugs:[],
				drug:{},
				contacts:[],
				business:[],
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					product_type:['高打'],
					productCommonName:"",
					contactId:"",
					product_code:"",
					business:"",
					product_distribution_flag:"0"
				},
				purchasePay:{
					purchase_pay_contact_id:"",
					purchase_pay_contract_time:new Date(),
					purchase_pay_number:"",
					purchase_pay_money:"",
					purchase_pay_time:null,
					purchase_pay_receive_remark:"",
					purchase_pay_other_money:"",
					purchase_pay_price:""
				},
				purchasePayRule:{
					purchase_pay_contact_id:[{required: true, message: '请选择业务员', trigger: 'change' }],
					purchase_pay_contract_time:[{required: true, message: '请选择合同时间', trigger: 'blur' }],
					purchase_pay_number:[{validator:validateNum,trigger: 'blur' }],
					purchase_pay_money:[{validator:validateMoney,message:"预付金额",trigger: 'blur' }],
					purchase_pay_price:[{validator:validateMoney,message:"预付价",trigger: 'blur' }],
				},
				business:[],//商业
			}
		},
		activated(){
			this.getDrugsList();
			this.getContacts();
			this.getProductBusiness();
			this.business = JSON.parse(sessionStorage["productbusiness"]);
		},
		mounted(){

		},
		methods:{
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
			contactChange(){
				var _self = this;
				_self.purchasePay.purchase_pay_policy_floor_price = "";
				_self.purchasePay.purchase_pay_policy_price = "";
				_self.purchasePay.purchase_pay_policy_remark = "";
				_self.purchasePay.purchase_pay_policy_tax = "";
				_self.purchasePay.purchase_pay_price = _self.drug.product_mack_price;
				this.jquery('/iae/purchasepay/getPurchasePolicy',{
					contactId:_self.purchasePay.purchase_pay_contact_id,
					drugId:_self.drug.product_id
				},function(res){
					if(res.message && res.message.length > 0){
						_self.purchasePay.purchase_pay_price = res.message[0].purchase_pay_policy_make_price;
						_self.purchasePay.purchase_pay_policy_floor_price = res.message[0].purchase_pay_policy_floor_price;
						_self.purchasePay.purchase_pay_policy_price = res.message[0].purchase_pay_policy_price;
						_self.purchasePay.purchase_pay_policy_remark = res.message[0].purchase_pay_policy_remark;
						_self.purchasePay.purchase_pay_policy_tax = res.message[0].purchase_pay_policy_tax;
					}
				});
			},
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种','业务员']},function(res){
					_self.contacts = res.message;
				});
			},
			formatPercent(row, column, cellValue, index){
				return (100 - row.product_discount).toFixed(0)+"%";
			},
			//选择要进货的药品
			selectRow(scope){
				var temp = JSON.stringify(scope.row);
				this.drug = JSON.parse(temp);
				if(this.$refs["purchasePay"]){
					this.$refs["purchasePay"].resetFields();
				}
				this.dialogFormVisible = true;
				this.purchasePay.purchase_pay_price = this.drug.product_mack_price;
				this.purchasePay.purchase_pay_business_id = this.drug.product_business;
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.getDrugsList();
			},
			returnPurchase(){
				this.$router.push("/main/purchasepay");
			},
			addPurchasePay(formName){
				var _self = this;
				this.purchasePay.purchase_pay_drug_id = this.drug.product_id;
				this.purchasePay.product_return_money = this.drug.product_return_money;
				this.purchasePay.product_return_time_type = this.drug.product_return_time_type;
				this.purchasePay.product_return_time_day = this.drug.product_return_time_day;
			  this.purchasePay.product_return_time_day_num = 	this.drug.product_return_time_day_num;
				this.purchasePay.product_floor_price = this.drug.product_floor_price;
				this.purchasePay.product_high_discount = this.drug.product_high_discount;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/purchasepay/savePurchasesPay',_self.purchasePay,function(res){
								_self.$confirm('新增成功', '提示', {
										confirmButtonText:'继续添加',
										cancelButtonText:'返回备货列表',
										type: 'success'
								}).then(() => {
									_self.$refs["purchase"].resetFields();
									_self.dialogFormVisible = false;
									_self.loading = false;
								}).catch(() => {
									_self.dialogFormVisible = false;
									_self.loading = false;
									_self.$router.push({path:`/main/purchasepay`});
								});
							});
						} else {
							return false;
						}
				});
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
			reSearch(){
				this.$refs["params"].resetFields();
				this.getDrugsList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getDrugsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getDrugsList();
    	}
		}
	});
</script>
<style scoped="scoped">
	.el-table .cell{
		white-space: nowrap;
	}
</style>
