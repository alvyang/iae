<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>采购管理</el-breadcrumb-item>
			<el-breadcrumb-item>报损管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="报损时间" prop="time">
				<el-date-picker v-model="params.time" type="daterange" size="mini" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
 		 	</el-form-item>
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
					<el-option v-for="item in contacts"
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
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',114,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',114,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',117,') > -1"  @click="add" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="purchasesloss" style="width: 100%" size="mini" :height="tableHeight" :stripe="true" :border="true">
				<el-table-column fixed prop="purchaseloss_time" label="报损时间" width="80" :formatter="formatterDate"></el-table-column>
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="product_mack_price" label="打款价" width="60"></el-table-column>
				<el-table-column prop="purchaseloss_batch_stock_time" label="入库时间" width="60" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="purchaseloss_batch_number" label="批号" width="60"></el-table-column>
				<el-table-column prop="purchaseloss_number" label="报数数量" width="70"></el-table-column>
				<el-table-column prop="purchaseloss_money" label="报损金额" width="70"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
				<el-table-column prop="business_name" label="商业"  width="80"></el-table-column>
				<el-table-column prop="purchase_loss_remark" label="备注"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
			    <template slot-scope="scope">
						<el-button v-show="authCode.indexOf(',115,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
		        <el-button v-show="authCode.indexOf(',116,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
			    </template>
  			</el-table-column>
		</el-table>
		<div class="page_div">
			<el-pagination
				background
	      @size-change="handleSizeChange"
	      @current-change="handleCurrentChange"
	      :current-page="currentPage"
	      :page-sizes="[10,20, 50, 100]"
	      :page-size="pageNum"
	      layout="total, sizes, prev, pager, next, jumper"
	      :total="count">
	    </el-pagination>
		</div>
		<el-dialog title="修改报损记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+purchaseloss.product_common_name+ '）' " name="2">
			    <div><span>产品编号:</span>{{purchaseloss.product_code}}</div>
			    <div><span>产品规格:</span>{{purchaseloss.product_specifications}}</div>
					<div><span>中标价:</span>{{purchaseloss.product_price}}</div>
					<div><span>包装:</span>{{purchaseloss.product_packing}}</div>
					<div><span>单位:</span>{{purchaseloss.product_unit}}</div>
					<div><span>打款价:</span>{{purchaseloss.product_mack_price}}</div>
					<div style="display:block;width:100%;"><span>生产厂家:</span>{{purchaseloss.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="purchaseloss" ref="purchaseloss" status-icon :rules="purchaselossRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="报损时间" prop="purchaseloss_time">
					<el-date-picker v-model="purchaseloss.purchaseloss_time" style="width:179px;" type="date" placeholder="请选择报损时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="报损数量" prop="purchaseloss_number" :required="true">
					<el-input v-model="purchaseloss.purchaseloss_number" style="width:179px;" :readonly="true" :maxlength="10" placeholder="请输入报损数量"></el-input>
				</el-form-item>
				<el-form-item label="报损金额" prop="purchaseloss_money" :required="true">
					<el-input v-model="purchaseloss.purchaseloss_money" style="width:179px;" :maxlength="10" placeholder="请输入报损金额"></el-input>
				</el-form-item>
				<el-form-item label="备　　注" prop="purchase_loss_remark">
					<el-input v-model="purchaseloss.purchase_loss_remark" style="width:179px;" placeholder="备注"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="editpurchaseloss('purchaseloss')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default({
	data(){
		var validateBatchNumber = (rule, value, callback) => {
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			if (value === '') {
				callback(new Error('请输入报损金额'));
			} else if (!reg.test(value)) {
				callback(new Error('请输入正确的报损金额'));
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
			purchasesloss:[],
			purchaseloss:{
				purchaseloss_time:null,
				purchaseloss_money:"",
				purchaseloss_number:""
			},
			contacts:[],
			money:0,//总额统计
			pageNum:20,
			currentPage:1,
			count:0,
			remarks:[],
			dialogFormVisible:false,
			loading:false,
			params:{
				product_makesmakers:"",
				productCommonName:"",
				contactId:"",
				time:[],
				product_code:"",
				business:"",
			},
			purchaselossRule:{
				purchaseloss_money:[{validator:validateBatchNumber,trigger: 'blur' }],
				purchaseloss_time:[{ required: true, message: '请选择报损时间', trigger: 'blur,change' }]
			},
			authCode:"",
			business:[],
			tableHeight:0,
		}
	},
	updated(){
		this.tableHeight = $(window).height() - 200 - $(".search").height();
		var that = this;
		$(window).resize(function(){
				that.tableHeight = $(window).height() - 200 - $(".search").height();
		});
	},
	activated(){
		this.getContacts();
		this.getPurchasesLossList();
		this.getProductBusiness();
		this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted(){

	},
	methods:{
		getProductBusiness(){
			var _self = this;
			this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
				_self.business=res.message;
				sessionStorage["productbusiness"] = JSON.stringify(_self.business);
			});
		},
		editpurchaseloss(formName){
			var _self = this;
			this.$refs[formName].validate((valid) => {
					if (valid) {
						this.loading = true;
						_self.jquery('/iae/purchaseloss/editPurchaseLoss',_self.purchaseloss,function(res){
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.$message({showClose: true,message: '修改成功',type: 'success'});
							_self.getPurchasesLossList();
						});
					} else {
						return false;
					}
			});
		},
		getContacts(){
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种']},function(res){
				_self.contacts = res.message;
			});
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
		editRow(scope){//编辑药品信息
			this.dialogFormVisible = true;
			var temp = JSON.stringify(scope.row);
			this.purchaseloss = JSON.parse(temp);
			this.purchaseloss.front_purchaseloss = temp;
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
			this.jquery('/iae/purchaseloss/deletePurchasesLoss',{
				purchaseloss_id:scope.row.purchaseloss_id,
				purchaseloss_drug_id:scope.row.purchaseloss_drug_id,
				purchaseloss_purchase_id:scope.row.purchaseloss_purchase_id,
				purchaseloss_number:scope.row.purchaseloss_number,
				delete_flag:""
			},function(res){
				_self.$message({showClose: true,message: '删除成功',type: 'success'});
				_self.getPurchasesLossList();
				_self.dialogFormVisible = false;
			});
		},
		//跳转到编辑页面
		add(){
			this.$router.push("/main/purchaselossdrugs");
		},
		reSearch(arg){
			if(arg){
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getPurchasesLossList();
		},
		getPurchasesLossList(){
			var _self = this;
			if(!_self.currentPage){
				_self.currentPage = 1;
			}
			if(!_self.pageNum){
				_self.pageNum = 20;
			}
			var page = {
				start:(_self.currentPage-1)*_self.pageNum,
				limit:_self.pageNum
			}
			this.jquery('/iae/purchaseloss/getPurchasesLossList',{
				data:_self.params,
				page:page
			},function(res){
					_self.purchasesloss = res.message.data;
					_self.pageNum=parseInt(res.message.limit);
					_self.count=res.message.totalCount;
			});
		},
		handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getPurchasesLossList();
		},
		handleCurrentChange(val) {
			this.currentPage = val;
			this.getPurchasesLossList();
		}
	}
});
</script>
<style>

</style>
