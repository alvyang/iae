<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>调货积分管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="调货时间" prop="allot_time">
				<el-date-picker v-model="params.allot_time" type="daterange" size="mini" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
 		 	</el-form-item>
			<el-form-item label="回积分日期" prop="allotReturnTime">
 			<el-date-picker v-model="params.allotReturnTime" type="daterange" style="width:196px !important;" size="mini" align="right" unlink-panels
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
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品通用名"></el-input>
		  </el-form-item>
			<el-form-item label="调货单位" prop="allot_hospital">
				<el-select v-model="params.allot_hospital" style="width:210px;" size="mini" filterable placeholder="请选择供货单位">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in hospitals" :key="item.hospital_id" :label="item.hospital_name" :value="item.hospital_id"></el-option>
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
		 <el-form-item label="调货联系人" prop="contactId">
			 <el-select v-model="params.contactId" style="width:196px;" filterable size="mini" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option v-for="item in contacts"
					 :key="item.contacts_id"
					 :label="item.contacts_name"
					 :value="item.contacts_id">
				 </el-option>
			 </el-select>
		 </el-form-item>
		 <el-form-item label="积分状态" prop="allot_return_flag">
			 <el-select v-model="params.allot_return_flag" style="width:210px;" size="mini" filterable placeholder="请选择供货单位">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option key="未回" label="未回" value="未回"></el-option>
				 <el-option key="已回" label="已回" value="已回"></el-option>
			 </el-select>
		 </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('130627a0-cb9b-11e8-81ff-23b7b224f706') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('130627a0-cb9b-11e8-81ff-23b7b224f706') > -1" @click="reSearch(true)" size="mini">重置</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('f8037330-d802-11e8-a19c-cf0f6be47d2e') > -1" @click="exportAllotReturn" size="mini">导出</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money_allot">
			<a>回款总额：</a>{{money}} <span>元</span>
		</div>
		<el-table :data="allots" style="width: 100%" size="mini" :stripe="true" :border="true">
				<el-table-column fixed prop="allot_time" label="调货时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="hospital_name" label="调货单位" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
  			<el-table-column prop="product_common_name" label="产品通用名" width="120"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生厂企业" width="150"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="contacts_name" label="调货联系人" width="80"></el-table-column>
				<el-table-column prop="allot_number" label="数量" width="50"></el-table-column>
				<el-table-column prop="allot_mack_price" label="打款价" width="60"></el-table-column>
				<el-table-column prop="allot_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="allot_money" label="金额" width="70"></el-table-column>
				<el-table-column label="上游实返积分" width="70" :formatter="formatterReturnMoney"></el-table-column>
				<el-table-column prop="allot_return_price" label="政策积分" width="70"></el-table-column>
				<el-table-column prop="allot_return_money" label="应回积分" width="70"></el-table-column>
				<el-table-column prop="allot_return_time" label="回积分时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="allot_account_name" label="积分账户名" width="80" ></el-table-column>
				<el-table-column prop="allot_account_number" label="积分账户" width="80" ></el-table-column>
				<el-table-column prop="allot_account_address" label="积分账户地址" width="80"></el-table-column>
				<el-table-column prop="allot_policy_remark" label="积分备注" width="80"></el-table-column>
				<!-- <el-table-column fixed="right" prop="allot_return_flag" label="是否回款" width="80"></el-table-column> -->
				<el-table-column fixed="right" label="操作" width="60">
			    <template slot-scope="scope">
		        <el-button v-show="authCode.indexOf('12303a00-cb9b-11e8-81ff-23b7b224f706') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog title="修改调货记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+allot.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{allot.product_code}}</div>
			    <div><span>产品规格:</span>{{allot.product_specifications}}</div>
					<div><span>中标价:</span>{{allot.product_price}}</div>
					<div><span>包装:</span>{{allot.product_packing}}</div>
					<div><span>单位:</span>{{allot.product_unit}}</div>
					<div><span>打款价:</span>{{allot.product_mack_price}}</div>
					<div><span>积分:</span>{{allot.product_return_money}}</div>
					<div style="display:block;width:100%;"><span>生产产家:</span>{{allot.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="allot" ref="allot" status-icon :rules="allotRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="政策积分" prop="allot_return_price">
					<el-input v-model="allot.allot_return_price" style="width:179px;" placeholder="政策积分"></el-input>
				</el-form-item>
				<el-form-item label="应返积分" prop="allot_return_money">
					<el-input v-model="allot.allot_return_money" style="width:179px;" placeholder="应返积分" :readonly="true"></el-input>
				</el-form-item>
				<el-form-item label="回积分账号" prop="allot_account_id">
          <el-select v-model="allot.allot_account_id" style="width:179px;" filterable placeholder="请选择">
            <el-option v-for="item in accounts"
              :key="item.account_id"
              :label="item.account_number"
              :value="item.account_id">
            </el-option>
          </el-select>
				</el-form-item>
				<el-form-item label="回积分时间" prop="allot_return_time">
					<el-date-picker v-model="allot.allot_return_time" style="width:179px;" type="date" placeholder="请选择回积分时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="调货联系人" prop="allot_policy_contact_id">
				 <el-select v-model="allot.allot_policy_contact_id" @change="selectAllotContact" style="width:179px;" filterable placeholder="请选择">
					 <el-option key="" label="" value=""></el-option>
					 <el-option v-for="item in contacts"
						 :key="item.contacts_id"
						 :label="item.contacts_name"
						 :value="item.contacts_id">
					 </el-option>
				 </el-select>
			  </el-form-item>
				<el-form-item label="积分备注" prop="allot_policy_remark">
					<el-input v-model="allot.allot_policy_remark" style="width:179px;" placeholder="积分备注"></el-input>
				</el-form-item>
				<!-- <el-form-item label="是否返款" prop="allot_return_flag">
					<el-select v-model="allot.allot_return_flag" placeholder="请选择" style="width:179px;" >
						<el-option key="是" label="是" value="是"></el-option>
						<el-option key="否" label="否" value="否"></el-option>
					</el-select>
				</el-form-item> -->
				<div style="padding-left: 16px;" v-show="selectContact.account_name && selectContact.account_number">
						<div>积分账号名：{{selectContact.account_name}}</div>
						<div>　积分账号：{{selectContact.account_number}}</div>
						<div>　积分地址：{{selectContact.account_address}}</div>
				</div>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="editallots('allot')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			var validateNum = (rule, value, callback) => {
				var regu = /^\+?[1-9][0-9]*$/;
        if (value === '') {
          callback(new Error('请输入调货数量'));
        } else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
					this.allot.allot_money = this.mul(this.allot.allot_number,this.allot.allot_price,2);
					if(this.allot.allot_return_price && reg.test(this.allot.allot_return_price)){
						this.allot.allot_return_money = this.mul(this.allot.allot_return_price,this.allot.allot_number,2);
					}
          callback();
        }
      };
			var validateNull = (rule, value, callback) =>{
				if(this.allot.allot_return_flag && !value){
					callback(new Error('请选择'+rule.labelname));
				}else{
					callback();
				}
			}
			var validateRealReturnMoney = (rule, value, callback) => {
				if(this.allot.allot_return_flag && !value){
					callback(new Error('请输入回款单价'));
				}else if(this.allot.allot_return_flag && value && !reg.test(value)){
					callback(new Error('请输入正确的回款单价'));
				} else {
					this.allot.allot_return_money = this.mul(value,this.allot.allot_number,2);
          callback();
        }
      };
			const nowDate = new Date();
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
					}]
				},
				allots:[],
				allot:{},
				hospitals:[],
				contacts:[],
				business:[],
				loading:false,
				money:0,//总额统计
				pageNum:10,
				currentPage:1,
				count:0,
				dialogFormVisible:false,
				params:{
					productCommonName:"",
					allot_hospital:"",
					allot_time:[],
					allotReturnTime:[],
					product_code:"",
					allot_return_flag:"",
					business:"",
					contactId:"",
				},
				allotRule:{
					allot_account_id:[{validator:validateNull,labelname:'回款账号',trigger: 'change' }],
					allot_return_time:[{validator:validateNull,labelname:'回款时间',trigger: 'change' }],
					allot_return_price:[{validator:validateRealReturnMoney,trigger: 'blur' }],
				},
				authCode:"",
				selectContact:{}
			}
		},
		activated(){
			this.getAllotsList();
			this.getAllotHospitalList();
			this.getBankAccount();
			this.getProductBusiness();
			this.getContacts();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			formatterReturnMoney(row, column, cellValue){
				if(row.refunds_real_time && row.refunds_real_money){
					return this.div(row.refunds_real_money,row.purchase_number,2);
				}else{
					return 0;
				}
			},
			selectAllotContact(val){
				this.selectContact={};
				for(var i = 0 ; i < this.contacts.length;i++){
					if(this.contacts[i].contacts_id == val){
						this.selectContact = this.contacts[i];
					}
				}
			},
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['调货']},function(res){
					_self.contacts = res.message;
				});
			},
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
					sessionStorage["productbusiness"] = JSON.stringify(_self.business);
				});
			},
			getBankAccount(){
				var _self = this;
				this.jquery("/iae/bankaccount/getAllAccounts",null,function(res){//查询账号
					_self.accounts=res.message;
				});
			},
			getAllotHospitalList(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'调货医院'},function(res){
						_self.hospitals = res.message;
				});
			},
			formatPercent(row, column, cellValue, index){
				if(cellValue){
					return cellValue+" %";
				}else{
					return "-";
				}
			},
			handleSelect(item) {
				this.allot.allot_hospital = item.allot_hospital;
      },
			querySearch(queryString, cb) {
        var hospitals = this.hospitals;
        var results = queryString ? hospitals.filter(this.createFilter(queryString)) : hospitals;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
			createFilter(queryString) {
        return (hospitals) => {
					if(hospitals.allot_hospital){
						return (hospitals.allot_hospital.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
					}else{
						return;
					}
        };
      },
			editallots(formName){
				var _self = this;
				this.allot.account_detail = this.formatterDate(null,null,this.allot.allot_time)+this.allot.hospital_name+"调货（"+this.allot.allot_number+"）"+this.allot.product_common_name+"回积分";
				if(this.allot.allot_account_id && this.allot.allot_return_money){
					this.allot.allot_account_name = this.selectContact.account_name?this.selectContact.account_name:"";
					this.allot.allot_account_number = this.selectContact.account_number?this.selectContact.account_number:"";
					this.allot.allot_account_address = this.selectContact.account_address?this.selectContact.account_address:"";
				}
				this.$refs[formName].validate((valid) => {
						if (valid) {
							_self.loading=true;
							_self.jquery('/iae/allot/editAllot',_self.allot,function(res){
								_self.dialogFormVisible = false;
								_self.loading=false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getAllotsList();
							});
						} else {
							return false;
						}
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
				this.allot = scope.row;
				this.allot.allot_policy_money = this.allot.allot_policy_money?this.allot.allot_policy_money:"";
				this.allot.allot_return_price = this.allot.allot_return_price?this.allot.allot_return_price:this.allot.allot_policy_money;
				if(this.allot.allot_return_price){
					this.allot.allot_return_money = this.mul(this.allot.allot_return_price,this.allot.allot_number,2);
				}
				this.allot.allot_number_temp = scope.row.allot_number;
				for(var i = 0 ; i < this.contacts.length;i++){
					if(this.contacts[i].contacts_id == this.allot.allot_policy_contact_id){
						this.selectContact = this.contacts[i];
					}
				}
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
				this.jquery('/iae/allot/deleteAllot',{
					allot_id:scope.row.allot_id,
					product_type:scope.row.product_type,
					stock:scope.row.stock,
					product_id:scope.row.product_id,
					allot_number:scope.row.allot_number
				},function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getAllotsList();
					_self.dialogFormVisible = false;
				});
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getAllotsList();
			},
			exportAllotReturn(){
				var url = this.$bus.data.host + "/iae/allotPolicy/exportAllotRefund";
				this.download(url,this.params);
			},
			getAllotsList(){
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
				this.jquery('/iae/allotPolicy/getAllotReturnMoney',{
					data:_self.params,
					page:page
				},function(res){
						_self.allots = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
						_self.money = res.message.returnMoney.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				});
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getAllotsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getAllotsList();
    	}
		}
	});
</script>
<style>
	.sum_money_allot > a{
		padding-left: 20px;
		color: #606266;
	}
	.sum_money_allot > span{
		color:#606266;
	}
	.sum_money_allot .more_detail{
		position: absolute;
		right: 10px;
		height: 30px;
		line-height: 30px;
		color: #409EFF;
		text-decoration: none;
	}
	.sum_money_allot{
		position: relative;
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		color:#f24040;
		line-height: 30px;
		font-size: 14px;
	}
</style>
