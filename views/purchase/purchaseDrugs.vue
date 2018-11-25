<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/main/purchase' }">备货管理</el-breadcrumb-item>
			<el-breadcrumb-item>选择药品<a style="color:#f24040;">（请先选择备货药品）</a></el-breadcrumb-item>
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
				<el-table-column prop="product_makesmakers" label="生厂企业" width="150"></el-table-column>
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
		<el-dialog title="新增备货记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{drug.product_code}}</div>
			    <div><span>产品规格:</span>{{drug.product_specifications}}</div>
					<div><span>中标价:</span>{{drug.product_price}}</div>
					<div><span>包装:</span>{{drug.product_packing}}</div>
					<div><span>单位:</span>{{drug.product_unit}}</div>
					<div><span>打款价:</span>{{drug.product_mack_price}}</div>
					<div style="display:block;width:100%;"><span>生产产家:</span>{{drug.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="purchase" ref="purchase" status-icon :rules="purchaseRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="购入数量" prop="purchase_number" :required="true">
					<el-input v-model="purchase.purchase_number" style="width:179px;" :maxlength="10" placeholder="请输入购入数量"></el-input>
				</el-form-item>
				<el-form-item label="购入金额" prop="purchase_money">
					<el-input v-model="purchase.purchase_money" style="width:179px;" :readonly="true"></el-input>
				</el-form-item>
				<el-form-item label="备货时间" prop="time">
					<el-date-picker v-model="purchase.time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="打款时间" prop="make_money_time">
					<el-date-picker v-model="purchase.make_money_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="发货时间" prop="send_out_time">
					<el-date-picker v-model="purchase.send_out_time" style="width:179px;" type="date" placeholder="请选择发货时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="入库时间" prop="storage_time">
					<el-date-picker v-model="purchase.storage_time" style="width:179px;" type="date" placeholder="请选择入库时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
				 <el-autocomplete popper-class="my-autocomplete" style="width:300px;"
					 v-model="purchase.remark"
					 :fetch-suggestions="querySearch"
					 placeholder="备注" @select="handleSelect">
					 <template slot-scope="{ item }">
						 <div class="name">{{ item.remark }}</div>
					 </template>
				 </el-autocomplete>
			 </el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="addPurchases('purchase')">确 定</el-button>
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
          callback(new Error('请输入购入数量'));
        } else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
					this.purchase.purchase_money = this.purchase.purchase_number * this.drug.product_mack_price;
						this.purchase.purchase_money = this.purchase.purchase_money.toFixed(2);
          callback();
        }
      };
			var validateRealReturnMoney = (rule, value, callback) => {
				var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if(!reg.test(value)){
					callback(new Error('请输入正确的实返金额'));
				} else if(this.purchase.shoule_return_money && parseFloat(value) > parseFloat(this.purchase.shoule_return_money)){
					callback(new Error('实返金额不能大于应返金额'));
				} else {
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
					product_type:['高打','高打(底价)'],
					productCommonName:"",
					contactId:"",
					product_code:"",
					business:"",
					product_distribution_flag:"0"
				},
				remarks:[],
				purchase:{
					drug_id:"",
					purchase_number:"",
					purchase_money:"",
					time:new Date(),
					storage_time:null,
					make_money_time:null,
					send_out_time:null,
					purchase_price:"",
					purchase_mack_price:"",
					puchase_gross_rate:"",
					remark:"",
					purchase_return_flag:""
				},
				purchaseRule:{
					purchase_number:[{validator:validateNum,trigger: 'blur' }],
					time:[{ required: true, message: '请选择备货时间', trigger: 'blur,change' }]
				},
			}
		},
		activated(){
			this.getDrugsList();
			this.getContacts();
			this.remarks = JSON.parse(sessionStorage["remarks"]);
			this.business = JSON.parse(sessionStorage["productbusiness"]);
		},
		mounted(){

		},
		methods:{
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种']},function(res){
					_self.contacts = res.message;
				});
			},
			handleSelect(item) {
				this.purchase.remark = item.remark;
      },
			querySearch(queryString, cb) {
        var remarks = this.remarks;
        var results = queryString ? remarks.filter(this.createFilter(queryString)) : remarks;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
			createFilter(queryString) {
        return (remarks) => {
					if(remarks.remark){
						return (remarks.remark.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
					}else{
						return ;
					}

        };
      },
			formatPercent(row, column, cellValue, index){
				return (100 - row.product_discount).toFixed(0)+"%";
			},
			//选择要进货的药品
			selectRow(scope){
				this.drug = scope.row;
				if(this.$refs["purchase"]){
					this.$refs["purchase"].resetFields();
				}
				this.dialogFormVisible = true;
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.getDrugsList();
			},
			returnPurchase(){
				this.$router.push("/main/purchase");
			},
			addPurchases(formName){
				var _self = this;
				this.purchase.purchase_price = this.drug.product_price;
				this.purchase.purchase_mack_price = this.drug.product_mack_price;
				this.purchase.drug_id = this.drug.product_id;
				this.purchase.stock = this.drug.stock,
				this.purchase.puchase_gross_rate = (100 - this.drug.product_discount).toFixed(0);
				this.purchase.purchase_return_flag = this.drug.product_return_statistics;
				this.purchase.product_return_money = this.drug.product_return_money;
				this.purchase.product_return_time_type = this.drug.product_return_time_type;
				this.purchase.product_return_time_day = this.drug.product_return_time_day;
			  this.purchase.product_return_time_day_num = 	this.drug.product_return_time_day_num;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/purchase/savePurchases',_self.purchase,function(res){
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
									_self.$router.push({path:`/main/purchase`});
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
