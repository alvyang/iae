<template>
	<div style="box-sizing: border-box;padding: 0px 10px;" class="sale_list">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>采购管理</el-breadcrumb-item>
			<el-breadcrumb-item>预付招商应收管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" size="mini" @keyup.13.native="reSearch(false)" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="生产厂家" prop="product_makesmakers">
		    <el-input v-model="params.product_makesmakers" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="生产厂家"></el-input>
		  </el-form-item>
		  <el-form-item label="　联系人" prop="contactId">
		    <el-select v-model="params.contactId" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts" v-if="item.contact_type.indexOf('高打品种')>-1"
			      :key="item.contacts_id"
			      :label="item.contacts_name"
			      :value="item.contacts_id">
			    </el-option>
				</el-select>
		  </el-form-item>
			<el-form-item label="　业务员" prop="contactId1">
		    <el-select v-model="params.contactId1" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts" v-if="item.contact_type.indexOf('业务员')>-1"
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
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',168,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',168,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
				<el-button type="primary" v-dbClick style="margin-left: 14px;" @click="$router.push('/main/reportpurchasepay');" size="mini">返回</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money">
      应收积分：<a>{{refundMoney.ppsm}}</a>
      实收积分：<a>{{refundMoney.pprm}}</a>
      未收积分：<a>{{refundMoney.ppnc}}</a>
			应付积分：<a>{{refundMoney.ppspm}}</a>
			实付积分：<a>{{refundMoney.pprpm}}</a>
			未付积分：<a>{{refundMoney.ppnc1}}</a>
    </div>
		<el-table :data="purchasePays" style="width: 100%" size="mini" :stripe="true" :border="true">
				<el-table-column prop="purchase_pay_time" label="打款时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="purchase_pay_number" label="预付数量" width="70"></el-table-column>
				<el-table-column prop="purchase_pay_price" label="打款价" width="60"></el-table-column>
				<el-table-column prop="purchase_pay_money" label="预付金额" width="70"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
				<el-table-column prop="purchase_pay_should_money" label="应收积分" width="80" :formatter="formatNull"></el-table-column>
				<el-table-column prop="purchase_pay_real_money" label="实收积分" width="80" :formatter="formatNull"></el-table-column>
				<el-table-column prop="purchase_pay_real_money" label="未收积分" width="80" :formatter="onRefund"></el-table-column>
				<el-table-column prop="contacts_name1" label="业务员" width="60"></el-table-column>
				<el-table-column prop="purchase_pay_should_pay_money" label="应付积分" width="80" :formatter="formatNull"></el-table-column>
				<el-table-column prop="purchase_pay_real_pay_money" label="实付积分" width="80" :formatter="formatNull"></el-table-column>
				<el-table-column prop="purchase_pay_real_money" label="未付积分" width="80" :formatter="onRefund1"></el-table-column>

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
	</div>
</template>
<script>
	export default({
		data(){
			var validateMoney = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
        if (value && !reg.test(value)) {
        	callback(new Error('请输入正确的'+rule.labelname));
        } else {
          callback();
        }
    	};
			const nowDate = new Date();
			const beforeDate = new Date();
			beforeDate.setFullYear(nowDate.getFullYear()-1);
			return {
				pickerOptions2: {
					shortcuts: [{
						text: '本月',
						onClick(picker) {
							const end = new Date();
							const start = new Date(end.getFullYear()+"-"+(end.getMonth()+1)+"-01");
							picker.$emit('pick', [start, end]);
						}
					},{
						text: nowDate.getFullYear()+'年',
						onClick(picker) {
							const end = new Date();
							const start = new Date(end.getFullYear()+"-01"+"-01");
							picker.$emit('pick', [start, end]);
						}
					},{
						text: beforeDate.getFullYear()+'年',
						onClick(picker) {
							const start = new Date(beforeDate.getFullYear()+"-01"+"-01");
							const end = new Date(beforeDate.getFullYear()+"-12"+"-31");
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				purchasePays:[],
				contacts:[],
				accounts:[],
				pageNum:10,
				currentPage:1,
				count:0,
				dialogFormVisible:false,
				loading:false,
				params:{
					product_makesmakers:"",
					productCommonName:"",
					contactId:"",
					time:[],
					payTime:[],
					returnTime:[],
	        realReturnTime:[],
					product_code:"",
					status:"",
					remark:"",
					business:"",
					batch_number:"",
					overdue:"",
					purchase_pay_refundser:"",
					makeMoneyFlag:"2",
					refundFlag:"2"
				},
				purchasePay:{
					purchase_pay_should_price:"",
					purchase_pay_should_money:"",
					purchase_pay_real_money:"",
					purchase_pay_service_charge:"",
					purchase_pay_refundser:"",
					purchase_pay_receiver:"",
					purchase_pay_remark:"",
					purchase_pay_id:"",
					purchase_pay_should_time:null,
					purchase_pay_real_time:null
				},
				purchasePayRule:{
					purchase_pay_should_price:[{validator: validateMoney,labelname:'政策积分',trigger: 'blur' }],
					purchase_pay_should_money:[{validator: validateMoney,labelname:'应收积分',trigger: 'blur' }],
					purchase_pay_real_money:[{validator: validateMoney,labelname:'实收积分',trigger: 'blur' }],
					purchase_pay_service_charge:[{validator: validateMoney,labelname:'其它积分',trigger: 'blur' }],
				},
				authCode:"",
				business:[],
				refundser:[],
				contactRefunders:[],
				errorMessage:"",
				refundMoney:{}
			}
		},
		activated(){
			this.getContacts();
			this.getProductBusiness();
			var start = new Date(this.$route.query.time+"-01");
			var end = new Date(this.$route.query.time+"-01");
			end.setMonth(end.getMonth() + 1) ;
			end.setDate(end.getDate() -1);
			this.params.payTime = [start,end];
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
			this.getPurchasePayList();
		},
		mounted(){
		},
		methods:{
			formatNull(row, column, cellValue, index){
        cellValue = Math.round(cellValue*100)/100;
        return cellValue?(cellValue+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','):0;
      },
			onRefund1(row, column, cellValue){
				var t = row.purchase_pay_should_pay_money-row.purchase_pay_real_pay_money;
				t = Math.round(t*100)/100;
				return t?(t+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','):0;
			},
			formatPercent(row, column, cellValue, index){
				if(!this.isEmpty(cellValue)){
					return cellValue+" %";
				}else{
					return "-";
				}
			},
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
					sessionStorage["productbusiness"] = JSON.stringify(_self.business);
				});
			},
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种','业务员']},function(res){
					_self.contacts = res.message;
				});
			},
			onRefund(row, column, cellValue){
				var t = row.purchase_pay_should_money-row.purchase_pay_real_money;
				t = Math.round(t*100)/100;
				return t?(t+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','):0;
			},
			formatterDate(row, column, cellValue){
				if(cellValue && typeof cellValue == "string"){
	        var temp = cellValue.substring(0,10);
	        var d = new Date(temp);
	        d.setDate(d.getDate()+1);
	        return d.format("yyyy-MM-dd");
	      }else if(cellValue && typeof cellValue == "object"){
	        return new Date(cellValue).format("yyyy-MM-dd");
	      }else{
	        return "";
	      }
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getPurchasePayList();
			},
			getPurchasePayList(){
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
				this.jquery('/iae/purchasepay/getPurchasePay',{
					data:_self.params,
					page:page
				},function(res){
						_self.purchasePays = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
						_self.refundMoney.ppsm = res.message.ppsm;//应收
						_self.refundMoney.pprm = res.message.pprm;//实收
						_self.refundMoney.ppnc = res.message.ppsm - res.message.pprm;//未收
						_self.refundMoney.ppnc = Math.round(_self.refundMoney.ppnc*100)/100
						_self.refundMoney.ppsc = res.message.ppsc;//其它

						_self.refundMoney.ppspm = res.message.ppspm;//应收
						_self.refundMoney.pprpm = res.message.pprpm;//实收
						_self.refundMoney.ppnc1 = res.message.ppspm - res.message.pprpm;//未收
						_self.refundMoney.ppnc1 = Math.round(_self.refundMoney.ppnc1*100)/100
				});
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getPurchasePayList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getPurchasePayList();
    	}
		}
	});
</script>
<style>
	.sum_money_purchase > a{
		padding-left: 20px;
		color: #606266;
	}
	.sum_money_purchase > span{
		color:#606266;
	}
	.sum_money_purchase .more_detail{
		position: absolute;
		right: 10px;
		height: 30px;
		line-height: 30px;
		color: #409EFF;
		text-decoration: none;
	}
	.sum_money_purchase{
		position: relative;
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		color:#f24040;
		line-height: 30px;
		font-size: 14px;
	}
</style>
