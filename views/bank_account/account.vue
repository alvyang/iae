<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>财务管理</el-breadcrumb-item>
			<el-breadcrumb-item>积分账号管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="积分账号姓名" prop="contacts_name">
		    <el-input v-model="params.account_person" @keyup.13.native="reSearch(false)" style="width:210px;" size="mini" placeholder="持卡人"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',67,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',67,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',68,') > -1" @click="addShow" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="accounts" style="width: 100%" :height="tableHeight"  size="mini" :stripe="true">
      <el-table-column prop="account_number" label="积分账号"></el-table-column>
			<el-table-column prop="account_person" label="积分账号姓名"></el-table-column>
			<!-- <el-table-column prop="bank_account_type" label="卡类型" :formatter="formatterType"></el-table-column> -->
			<el-table-column prop="money" label="积分"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
	    <template slot-scope="scope">
		    <el-button v-show="authCode.indexOf(',69,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
        <el-button v-show="authCode.indexOf(',70,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog :title="title == 1?'新增积分账号':'修改积分账号'" width="500px" :visible.sync="dialogFormVisible">
			<el-form :model="account" status-icon :rules="accountRule" ref="account" label-width="110px" class="demo-ruleForm">
				<!-- <el-form-item label="账户类型" prop="bank_account_type">
					<el-radio v-model="account.bank_account_type" label="0">收款账户</el-radio>
					<el-radio v-model="account.bank_account_type" label="1">回款账户</el-radio>
				</el-form-item> -->
				<el-form-item label="积分账号" prop="account_number">
					<el-input v-model="account.account_number" style="width:340px;" auto-complete="off" :maxlength="20" placeholder="请输入积分账号"></el-input>
				</el-form-item>
				<el-form-item label="积分账号姓名" prop="account_person">
					<el-input v-model="account.account_person" style="width:340px;" auto-complete="off" :maxlength="11" placeholder="请输入积分账号姓名"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="add('account')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				title:1,
				dialogFormVisible:false,
				loading:false,
				authCode:"",
				account:{
					account_number:"",
          account_person:""
				},
				accountRule:{
					account_number:[{ required: true, message: '请输入积分账号', trigger: 'blur' }]
				},
				accounts:[],
				pageNum:20,
				currentPage:1,
				count:0,
				params:{
					account_person:""
				},
				tableHeight:0,
			}
		},
		updated(){
			this.tableHeight = $(window).height() - 170 - $(".search").height();
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 170 - $(".search").height();
			});
    },
		activated(){
			this.getAccountsList();
		},
		mounted(){
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
			formatterType(row, column, cellValue){
				return cellValue=="0"?"回款账户":"收款账户";
			},
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        this.title=2;
				var temp = JSON.stringify(scope.row);
        this.account = JSON.parse(temp);
				this.account.front_account = temp;
				var _self = this;
				setTimeout(function(){
					_self.$refs["account"].clearValidate();
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
        this.jquery('/iae/bankaccount/deleteAccount',{
          account_id:scope.row.account_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.getAccountsList();
          _self.dialogFormVisible = false;
        });
			},
			addShow(){
				this.title=1;
				this.account={
					account_number:"",
					account_person:""
				};
				this.dialogFormVisible = true;
			},
			add(formName){
				var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/bankaccount/saveAccounts',_self.account,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getAccountsList();
              });
            }else{
              this.jquery('/iae/bankaccount/editAccounts',_self.account,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getAccountsList();
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
			},
			getAccountsList(){
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
        this.jquery('/iae/bankaccount/getAccounts',{
					data:_self.params,
          page:page
        },function(res){
            _self.accounts = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getAccountsList();
			},
			handleSizeChange(val) {
    		this.currentPage = 1;
        this.getAccountsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getAccountsList();
    	}
		}
	})
</script>
<style>

</style>
