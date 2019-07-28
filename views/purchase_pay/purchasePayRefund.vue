<template>
	<div style="box-sizing: border-box;padding: 0px 10px;" class="sale_list">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>采购管理</el-breadcrumb-item>
			<el-breadcrumb-item>预付招商应收管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="合同时间" prop="time">
				<el-date-picker v-model="params.time" type="daterange" size="mini" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
 		 	</el-form-item>
			<el-form-item label="打款时间" prop="payTime">
				<el-date-picker v-model="params.payTime" type="daterange" size="mini" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
 		 	</el-form-item>
			<el-form-item label="应收日期" prop="returnTime">
			 <el-date-picker v-model="params.returnTime" type="daterange" size="mini" align="right" unlink-panels
				 range-separator="至"
				 start-placeholder="开始日期"
				 end-placeholder="结束日期"
				 :picker-options="pickerOptions2">
			 </el-date-picker>
			</el-form-item>
			<el-form-item label="实收日期" prop="realReturnTime">
			 <el-date-picker v-model="params.realReturnTime" type="daterange" size="mini" align="right" unlink-panels
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
		 <el-form-item label="付积分人" prop="purchase_pay_refundser">
			 <el-autocomplete popper-class="my-autocomplete" size="mini" style="width:210px;"
				v-model="params.purchase_pay_refundser"
				:fetch-suggestions="querySearch1"
				placeholder="付积分人" @select="handleSelect1">
				<template slot-scope="{ item }">
					<div class="name">{{ item.purchase_pay_refundser }}</div>
				</template>
			 </el-autocomplete>
		 </el-form-item>
		 <el-form-item label="积分状态" prop="status">
			 <el-select v-model="params.status" filterable size="mini" style="width:210px;" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option key="已收" label="已收" value="已收"></el-option>
				 <el-option key="未收" label="未收" value="未收"></el-option>
			 </el-select>
		 </el-form-item>
		 <el-form-item label="是否超期" prop="overdue">
			 <el-select v-model="params.overdue" filterable size="mini" style="width:210px;" placeholder="请选择">
				 <el-option key="是" label="是" value="是"></el-option>
				 <el-option key="" label="否" value=""></el-option>
			 </el-select>
		 </el-form-item>
		 <el-form-item label="是否打款" prop="makeMoneyFlag">
			 <el-select v-model="params.makeMoneyFlag" filterable size="mini" style="width:210px;" placeholder="请选择">
				 <el-option key="2" label="是" value="2"></el-option>
				 <el-option key="" label="全部" value=""></el-option>
			 </el-select>
		 </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',168,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',168,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',170,') > -1"  @click="exportExcel" size="mini">导出</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money">
      积分：<a>{{refundMoney.ppsm}}</a>
      已收积分：<a>{{refundMoney.pprm}}</a>
      未收积分：<a>{{refundMoney.ppnc}}</a>
      其它积分：<a>{{refundMoney.ppsc}}</a>
    </div>
		<el-table :data="purchasePays" style="width: 100%" size="mini" :stripe="true" :border="true">
				<el-table-column fixed prop="purchase_pay_contract_time" label="合同时间" width="80" :formatter="formatterDate"></el-table-column>
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="purchase_pay_number" label="预付数量" width="70"></el-table-column>
				<el-table-column prop="purchase_pay_price" label="打款价" width="60"></el-table-column>
				<el-table-column prop="purchase_pay_money" label="预付金额" width="70"></el-table-column>
				<el-table-column prop="purchase_pay_time" label="打款时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="contacts_name1" label="业务员" width="60"></el-table-column>
				<el-table-column prop="purchase_pay_should_price" label="积分" width="80"></el-table-column>
				<el-table-column prop="purchase_pay_other_money" label="补点/费用票" width="80"></el-table-column>
				<el-table-column prop="purchase_pay_should_money" label="应收积分" width="80"></el-table-column>
				<el-table-column prop="purchase_pay_should_time" label="应收时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="purchase_pay_real_money" label="实收积分" width="80"></el-table-column>
				<el-table-column prop="purchase_pay_real_time" label="实收时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="purchase_pay_real_money" label="未收积分" width="80" :formatter="onRefund"></el-table-column>
				<el-table-column prop="purchase_pay_refundser" label="返积分人" width="80" ></el-table-column>
				<el-table-column prop="account_number" label="收积分账户" width="80"></el-table-column>
				<el-table-column prop="purchase_pay_remark" label="备注"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
			    <template slot-scope="scope">
						<!-- <el-button v-show="authCode.indexOf(',167,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button> -->
		        <el-button v-show="authCode.indexOf(',169,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog title="修改预付招商记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+purchasePay.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{purchasePay.product_code}}</div>
			    <div><span>产品规格:</span>{{purchasePay.product_specifications}}</div>
					<div><span>中标价:</span>{{purchasePay.product_price}}</div>
					<div><span>包装:</span>{{purchasePay.product_packing}}</div>
					<div><span>单位:</span>{{purchasePay.product_unit}}</div>
					<div><span>打款价:</span>{{purchasePay.purchase_pay_price}}</div>
					<div><span>预付数量:</span>{{purchasePay.purchase_pay_number}}</div>
					<div><span>生产厂家:</span>{{purchasePay.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="purchasePay" ref="purchasePay" status-icon :rules="purchasePayRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="应收日期" prop="purchase_pay_should_time">
          <el-date-picker v-model="purchasePay.purchase_pay_should_time" style="width:194px;" type="date" placeholder="请选择应付日期"></el-date-picker>
				</el-form-item>
				<el-form-item label="积　　分" prop="purchase_pay_should_price">
					<el-input v-model="purchasePay.purchase_pay_should_price" style="width:194px;"  @blur="shouldPrice" placeholder="应付积分" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="应收积分" prop="purchase_pay_should_money">
					<el-input v-model="purchasePay.purchase_pay_should_money" style="width:194px;" placeholder="应付积分" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="实收日期" prop="purchase_pay_real_time">
          <el-date-picker v-model="purchasePay.purchase_pay_real_time" style="width:194px;" type="date" placeholder="请选择实收日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="实收积分" prop="purchase_pay_real_money">
          <el-input v-model="purchasePay.purchase_pay_real_money" style="width:194px;" placeholder="实收积分" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="其它积分" prop="purchase_pay_service_charge">
          <el-input v-model="purchasePay.purchase_pay_service_charge" style="width:194px;" placeholder="其它积分" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="付积分人" prop="purchase_pay_refundser">
          <el-autocomplete popper-class="my-autocomplete" style="width:194px;"
					 v-model="purchasePay.purchase_pay_refundser"
					 :fetch-suggestions="querySearch"
					 placeholder="付积分人" @select="handleSelect">
					 <template slot-scope="{ item }">
						 <div class="name">{{ item.purchase_pay_refundser }}</div>
					 </template>
					</el-autocomplete>
				</el-form-item>
        <el-form-item label="收积分账号" prop="purchase_pay_receiver">
          <el-select v-model="purchasePay.purchase_pay_receiver" style="width:194px;" filterable placeholder="请选择">
            <el-option key="" label="请选择" value=""></el-option>
            <el-option v-for="item in accounts"
              :key="item.account_id"
              :label="item.account_number"
              :value="item.account_id">
            </el-option>
          </el-select>
				</el-form-item>
        <el-form-item label="备注" prop="purchase_pay_remark">
          <el-input v-model="purchasePay.purchase_pay_remark" style="width:194px;" placeholder="备注" auto-complete="off"></el-input>
        </el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="editPurchasePayRefund('purchasePay')">确 定</el-button>
      </div>
    </el-dialog>
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
				importPurchasesUrl:"",
				loadingImport:false,
				uploadButtom:"导入预付招商记录",
				dialogFormVisibleImport:false,
				refundMoney:{}
			}
		},
		activated(){
			this.getContacts();
			this.getPurchasePayList();
			this.getBankAccount();
			this.getPurchasePayRefunder();
			this.getProductBusiness();
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
			this.importDrugsUrl = this.$bus.data.host + "/iae/purchasepay/importPurchasePay";
		},
		methods:{
			shouldPrice(){
				var t = this.purchasePay.purchase_pay_should_price * this.purchasePay.purchase_pay_number;
				this.purchasePay.purchase_pay_should_money = Math.round(t*100)/100;
			},
			getPurchasePayRefunder(){
				var _self = this;
				this.jquery("/iae/purchasepay/getPurchasePayAllRefunder",null,function(res){//查询返款人
					_self.refundser=res.message;
				});
			},
			getBankAccount(){
	      var _self = this;
	      this.jquery("/iae/bankaccount/getAllAccounts",null,function(res){//查询账号
	        _self.accounts=res.message;
	      });
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
			exportExcel(){
				var url = this.$bus.data.host + "/iae/purchasepay/exportPurchasePayRefund";
				this.download(url,this.params);
			},
			handleSelect1(item) {
	      this.params.purchase_pay_refundser = item.purchase_pay_refundser;
	    },
	    querySearch1(queryString, cb) {
	      var receiver = this.refundser;
	      var results = queryString ? receiver.filter(this.createFilter1(queryString)) : receiver;
	      // 调用 callback 返回建议列表的数据
	      cb(results);
	    },
	    createFilter1(queryString) {
	      return (refundser) => {
	        if(!this.isEmpty(refundser.purchase_pay_refundser)){
	          return (refundser.purchase_pay_refundser.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
	        }else{
	          return ;
	        }

	      };
	    },
			handleSelect(item) {
	      this.purchasePay.purchase_pay_refundser = item.purchase_pay_refundser;
	    },
	    querySearch(queryString, cb) {
	      var receiver = this.contactRefunders;
	      var results = queryString ? receiver.filter(this.createFilter(queryString)) : receiver;
	      // 调用 callback 返回建议列表的数据
	      cb(results);
	    },
	    createFilter(queryString) {
	      return (refundser) => {
	        if(!this.isEmpty(refundser.purchase_pay_refundser)){
	          return (refundser.purchase_pay_refundser.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
	        }else{
	          return ;
	        }
	      };
	    },
			editPurchasePayRefund(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.loading = true;
						_self.jquery('/iae/purchasepay/editPurchasePayRefund',_self.purchasePay,function(res){
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.$message({showClose: true,message: '修改成功',type: 'success'});
							_self.getPurchasePayList();
						});
					} else {
						return false;
					}
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
				return Math.round(t*100)/100;
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
				var _self = this;
				this.jquery('/iae/purchasepay/getPurchasePayRefunder',{contactId:scope.row.purchase_pay_contact_id},function(res){
	        _self.contactRefunders = res.message;
	      });
				this.dialogFormVisible = true;
				var temp = JSON.stringify(scope.row);
				this.purchasePay = JSON.parse(temp);
				this.purchasePay.front_purchase = temp;
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
				this.jquery('/iae/purchasepay/deletePurchasePayRefund',{
					purchase_pay_id:scope.row.purchase_pay_id,
					purchase_pay_delete_flag1:""
				},function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getPurchasePayList();
					_self.dialogFormVisible = false;
				});
			},
			//跳转到编辑页面
			add(){
				sessionStorage["remarks"] = JSON.stringify(this.remarks);
				this.$router.push("/main/purchasepaydrugs");
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
