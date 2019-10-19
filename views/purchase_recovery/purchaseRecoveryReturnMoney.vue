<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>采退应付管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="采退日期" prop="time">
 			 <el-date-picker v-model="params.time" type="daterange" size="mini" align="right" unlink-panels
 				 range-separator="至"
 				 start-placeholder="开始日期"
 				 end-placeholder="结束日期"
 				 :picker-options="pickerOptions2">
 			 </el-date-picker>
 		 </el-form-item>
		 <el-form-item label="付积分日期" prop="recoveryReturnTime">
			<el-date-picker v-model="params.recoveryReturnTime" type="daterange" style="width:196px !important;" size="mini" align="right" unlink-panels
				range-separator="至"
				start-placeholder="开始日期"
				end-placeholder="结束日期"
				:picker-options="pickerOptions2">
			</el-date-picker>
		 </el-form-item>
			<el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
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
		 <el-form-item label="积分状态" prop="recovery_status">
			 <el-select v-model="params.recovery_status" style="width:210px;" size="mini" filterable placeholder="请选择积分状态">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option key="未付" label="未付" value="未付"></el-option>
				 <el-option key="已付" label="已付" value="已付"></el-option>
			 </el-select>
		 </el-form-item>
	   <el-form-item>
	     <el-button type="primary" v-dbClick v-show="authCode.indexOf(',185,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',185,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
			 <!-- <el-button type="primary" v-dbClick v-show="authCode.indexOf(',183,') > -1" @click="exportPurchaseRecoveryReturn" size="mini">导出</el-button> -->
	   </el-form-item>
		</el-form>
		<div class="sum_money">应付积分：<a>{{sm}}</a> 已付积分：<a>{{sm1}}</a> 未付积分：<a>{{sm2}}</a></div>
		<el-table :data="purchaseRecoverys" style="width: 100%" size="mini" :height="tableHeight" :stripe="true" :border="true">
  			<el-table-column fixed prop="purchaserecovery_time" label="日期" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="contacts_name" label="业务员" width="60"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="purchaserecovery_number" label="采退数量" width="70"></el-table-column>
				<el-table-column prop="purchaserecovery_money" label="采退金额" width="70"></el-table-column>
				<el-table-column prop="purchaserecovery_batch_number" label="批号" width="70"></el-table-column>
				<el-table-column prop="purchase_recovery_receiver_money" label="实收积分" width="70"></el-table-column>
				<el-table-column prop="purchase_recovery_return_money" label="应付积分" width="70"></el-table-column>
				<el-table-column prop="purchase_recovery_real_pay_money" label="实付积分" width="70"></el-table-column>
				<el-table-column prop="purchase_recovery_pay_time" label="付积分时间" width="70" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="purchase_recovery_receiver_name" label="收积分账户名" width="80" ></el-table-column>
				<el-table-column prop="purchase_recovery_receiver_number" label="收积分账户" width="80" ></el-table-column>
				<el-table-column prop="purchase_recovery_receiver_address" label="收积分账户地址" width="80"></el-table-column>
				<el-table-column prop="purchase_recovery_pay_remark" label="备注" width="70"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="60">
		    <template slot-scope="scope">
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf(',186,') > -1"  icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
	      layout="total, sizes, prev, pager, next"
	      :total="count">
	    </el-pagination>
		</div>
		<el-dialog title="修改销售积分记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+purchaseRecovery.product_common_name+ '）'" name="1">
			    <div><span>产品编号:</span>{{purchaseRecovery.product_code}}</div>
			    <div><span>产品规格:</span>{{purchaseRecovery.product_specifications}}</div>
					<div><span>中标价:</span>{{purchaseRecovery.product_price}}</div>
					<div><span>采退数量:</span>{{purchaseRecovery.purchaserecovery_number}}</div>
					<div><span>单位:</span>{{purchaseRecovery.product_unit}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="purchaseRecovery" status-icon :rules="purchaseRecoveryRule" style="margin-top:20px;" :inline="true" ref="purchaseRecovery" label-width="100px" class="demo-ruleForm">
				<el-form-item label="应付积分" prop="purchase_recovery_return_money">
					<el-input v-model="purchaseRecovery.purchase_recovery_return_money" placeholder="应付积分" style="width:179px;"></el-input>
				</el-form-item>
				<el-form-item label="实付积分" prop="purchase_recovery_real_pay_money">
					<el-input v-model="purchaseRecovery.purchase_recovery_real_pay_money" placeholder="实付积分" style="width:179px;"></el-input>
				</el-form-item>
				<el-form-item label="付积分账号" prop="purchase_recovery_pay_number">
					<el-select v-model="purchaseRecovery.purchase_recovery_pay_number" style="width:179px;" filterable placeholder="请选择">
						<el-option v-for="item in accounts"
							:key="item.account_id"
							:label="item.account_number"
							:value="item.account_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="付积分时间" prop="purchase_recovery_pay_time">
					<el-date-picker v-model="purchaseRecovery.purchase_recovery_pay_time" style="width:179px;" type="date" placeholder="请选择付积分时间"></el-date-picker>
				</el-form-item>
			 <el-form-item label="收积分账号名" prop="purchase_recovery_receiver_name">
				 <el-input v-model="purchaseRecovery.purchase_recovery_receiver_name" style="width:179px;" placeholder="收积分账号名"></el-input>
			 </el-form-item>
			 <el-form-item label="收积分账号" prop="purchase_recovery_receiver_number">
				 <el-input v-model="purchaseRecovery.purchase_recovery_receiver_number" style="width:179px;" placeholder="收积分账号"></el-input>
			 </el-form-item>
			 <el-form-item label="收积分地址" prop="purchase_recovery_receiver_address">
				 <el-input v-model="purchaseRecovery.purchase_recovery_receiver_address" style="width:179px;" placeholder="收积分地址"></el-input>
			 </el-form-item>
				<el-form-item label="备注" prop="purchase_recovery_pay_remark">
					<el-input v-model="purchaseRecovery.purchase_recovery_pay_remark" style="width:179px;" placeholder="备注"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editPurchaseRecovery('purchaseRecovery')">确 定</el-button>
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
						callback(new Error('请再输入正确的'+rule.labelname));
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
				purchaseRecoverys:[],
				purchaseRecovery:{},//修改的销售信息
				purchaseRecoveryRule:{
					purchase_recovery_return_money:[{validator: validateMoney,labelname:"应付积分",trigger: 'blur' }],
					purchase_recovery_real_pay_money:[{validator: validateMoney,labelname:"实付积分",trigger: 'blur' }],
				},
				contacts:[],
				business:[],
				accounts:[],
				pageNum:20,
				currentPage:1,
				count:0,
				hospitals:[],
				sm:0,//总总额
				sm1:0,//已付金额
				sm2:0,//未付金额
				params:{//查询参数
					productCommonName:"",
					time:[],
					recoveryReturnTime:[],
					hospitalsId:"",
					business:"",
					contactId:"",
					product_code:"",
					recovery_status:""
				},
				dialogFormVisible:false,
				loading:false,
				authCode:"",
				selectContact:{},
				remindFlag:false,//应付积分是否大于实收上游积分
				remindMoney:0,//实收上游积分
				tableHeight:0
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
			this.getPurchasesRecorveryList();
			this.getContacts();
			this.getProductBusiness();
			this.getBankAccount();
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			getBankAccount(){
				var _self = this;
				this.jquery("/iae/bankaccount/getAllAccounts",null,function(res){//查询账号
					_self.accounts=res.message;
				});
			},
			getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打']},function(res){
	        _self.contacts = res.message;
	      });
	    },
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
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
				var temp = JSON.stringify(scope.row);
				this.purchaseRecovery = JSON.parse(temp);
				this.purchaseRecovery.front_purchaserecovery = temp;
				this.dialogFormVisible = true;
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getPurchasesRecorveryList();
			},
			exportPurchaseRecoveryReturn(){
				var url = this.$bus.data.host + "/iae/purchaserecovery/exportPurchaseRecoveryReturn";
				this.download(url,this.params);
			},
			getPurchasesRecorveryList(){
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
        this.jquery('/iae/purchaserecovery/getPurchasesRecorveryPayList',{
					data:_self.params,
          page:page
        },function(res){
						_self.sm = (res.message.sm+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						_self.sm1 = (res.message.sm1+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						_self.sm2 = _self.sub(res.message.sm+"",res.message.sm1+"",2);
						_self.sm2 = (_self.sm2+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _self.purchaseRecoverys = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			editPurchaseRecovery(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/purchaserecovery/editPurchaseRecoveryPay',_self.purchaseRecovery,function(res){
								_self.dialogFormVisible = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getPurchasesRecorveryList();
							});
						} else {
							return false;
						}
				});
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getPurchasesRecorveryList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getPurchasesRecorveryList();
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
