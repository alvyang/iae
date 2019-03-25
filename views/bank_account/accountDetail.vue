<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>财务管理</el-breadcrumb-item>
			<el-breadcrumb-item>积分流水账管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="日期" prop="account_detail_time">
				<el-date-picker v-model="params.account_detail_time" type="daterange" size="mini" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
			</el-form-item>
		  <el-form-item label="积分账户" prop="account_id">
				<el-select v-model="params.account_id" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in accounts"
						:key="item.account_id"
						:label="item.account_number"
						:value="item.account_id">
					</el-option>
        </el-select>
		  </el-form-item>
			<el-form-item label="收支" prop="account_type">
				<el-select v-model="params.account_type" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="1" label="收入" value="1"></el-option>
					<el-option key="2" label="支出" value="2"></el-option>
        </el-select>
		  </el-form-item>
			<el-form-item label="事项" prop="textarea">
		    <el-input v-model="params.textarea" @keyup.13.native="reSearch(false)" style="width:210px;" size="mini" placeholder="事项"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',73,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',73,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',76,') > -1" @click="addShow" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="accountsDetails" style="width: 100%" size="mini" :stripe="true" :border="true">
      <el-table-column prop="account_detail_time" label="日期" width="100" :formatter="formatterDate"></el-table-column>
			<el-table-column prop="account_detail_money" label="收入" width="120" :formatter="formatterIncome"></el-table-column>
			<el-table-column prop="account_detail_money" label="支出" width="120" :formatter="formatterExpenditure"></el-table-column>
			<el-table-column prop="account_number" label="账户" width="120" ></el-table-column>
			<el-table-column prop="account_detail_mark" label="事项"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
	    <template slot-scope="scope">
		    <el-button v-show="authCode.indexOf(',75,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
        <el-button v-show="authCode.indexOf(',74,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog :title="title == 1?'新增流水':'修改流水'" :visible.sync="dialogFormVisible">
			<el-form :model="accountDetail" status-icon :rules="accountDetailRule" :inline="true" ref="accountDetail" label-width="60px"  class="demo-ruleForm">
				<el-form-item label="日期" prop="account_detail_time">
					<el-date-picker v-model="accountDetail.account_detail_time" style="width:194px;" type="date" placeholder="请选择日期"></el-date-picker>
				</el-form-item>
				<el-form-item label="金额" prop="account_detail_money" :maxlength="10">
					<el-input v-model="accountDetail.account_detail_money" style="width:194px;" placeholder="请输入金额" :required="true" ></el-input>
				</el-form-item>
				<div>
					<el-form-item label="账号" prop="account_id">
						<el-select v-model="accountDetail.account_id" filterable placeholder="请选择账号">
							<el-option key="" label="请选择" value=""></el-option>
							<el-option v-for="item in accounts"
								:key="item.account_id"
								:label="item.account_number"
								:value="item.account_id">
							</el-option>
						</el-select>
					</el-form-item>
				</div>
				<el-form-item label="事项" prop="account_detail_mark">
					<el-input type="textarea" maxlength="200" :autosize="{ minRows: 5, maxRows: 4}" v-model="accountDetail.account_detail_mark" style="width:462px;" placeholder="请输入事项"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="add('accountDetail')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validateMoney = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,4})?|\d(.[0-9]{1,4})?)|([-]([1-9]\d+(.[0-9]{1,4})?|\d(.[0-9]{1,4})?)))$/;
				if(!value){
					callback(new Error('请再输入金额'));
				}else if (!reg.test(value)) {
        	callback(new Error('请再输入正确的金额'));
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
				title:1,
				dialogFormVisible:false,
				loading:false,
				authCode:"",
				accountDetail:{
					account_detail_time:"",
          account_detail_money:"",
					account_detail_mark:"",
					account_id:""
				},
				accountDetailRule:{
					account_detail_time:[{ required: true, message: '请选择日期', trigger: 'blur' }],
					account_detail_money:[{validator: validateMoney,trigger: 'blur' }],
					account_detail_mark:[{ required: true, message: '请输入事项', trigger: 'blur' }],
					account_id:[{ required: true, message: '请选择账号', trigger: 'change' }]
				},
				accountsDetails:[],
				accounts:[],//账号列表
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					account_id:"",
					account_detail_time:[],
					textarea:"",
					account_type:"",
				}
			}
		},
		activated(){
			this.getAccountsDetailsList();
			this.getAccounts();
		},
		mounted(){
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
			getAccounts(){
				var _self = this;
        this.jquery('/iae/bankaccount/getAllAccounts',{},function(res){
					_self.accounts = res.message;
        });
			},
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        this.title=2;
				var temp = JSON.stringify(scope.row);
        this.accountDetail = JSON.parse(temp);
				var _self = this;
				setTimeout(function(){
					_self.$refs["accountDetail"].clearValidate();
				});
			},
			deleteRow(scope){
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
        this.jquery('/iae/bankaccountdetail/deleteAccountDetail',{
          account_detail_id:scope.row.account_detail_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.getAccountsDetailsList();
          _self.dialogFormVisible = false;
        });
			},
			addShow(){
				var _self = this;
				setTimeout(function(){
					_self.$refs["accountDetail"].resetFields();
				},10);
				this.title=1;
				this.accountDetail={
					account_detail_time:"",
          account_detail_money:"",
					account_detail_mark:"",
					account_id:""
				},
				this.dialogFormVisible = true;
			},
			add(formName){
				var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/bankaccountdetail/saveAccountsDetail',_self.accountDetail,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getAccountsDetailsList();
              });
            }else{
              this.jquery('/iae/bankaccountdetail/editAccountsDetail',_self.accountDetail,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getAccountsDetailsList();
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
			},
			getAccountsDetailsList(){
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
        this.jquery('/iae/bankaccountdetail/getAccountsDetails',{
					data:_self.params,
          page:page
        },function(res){
            _self.accountsDetails = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			formatterIncome(row, column, cellValue){
				if(cellValue>=0){
					return cellValue;
				}else{
					return "-";
				}
			},
			formatterExpenditure(row, column, cellValue){
				if(cellValue<0){
					return cellValue;
				}else{
					return "-";
				}
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
				this.getAccountsDetailsList();
			},
			handleSizeChange(val) {
				this.pageNum = val;
    		this.currentPage = 1;
        this.getAccountsDetailsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getAccountsDetailsList();
    	}
		}
	})
</script>
<style>

</style>
