<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>财务管理</el-breadcrumb-item>
			<el-breadcrumb-item>银行账号管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="持卡人" prop="contacts_name">
		    <el-input v-model="params.account_person" @keyup.13.native="reSearch(false)" size="small" placeholder="持卡人"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('67') > -1" @click="reSearch(false)" size="small">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('67') > -1" @click="reSearch(true)" size="small">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('68') > -1" @click="addShow" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="accounts" style="width: 100%" size="mini" :stripe="true">
      <el-table-column prop="account_number" label="账号"></el-table-column>
			<el-table-column prop="account_person" label="持卡人"></el-table-column>
			<el-table-column prop="money" label="余额"></el-table-column>
			<el-table-column fixed="right" label="操作" width="200">
	    <template slot-scope="scope">
		    <el-button v-show="authCode.indexOf('69') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="small"></el-button>
        <el-button v-show="authCode.indexOf('70') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
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
		<el-dialog :title="title == 1?'新增银行账号':'修改银行账号'" width="500px" :visible.sync="dialogFormVisible">
			<el-form :model="account" status-icon :rules="accountRule" ref="account" label-width="90px" class="demo-ruleForm">
				<el-form-item label="银行账号" prop="account_number">
					<el-input v-model="account.account_number" style="width:370px;" auto-complete="off" :maxlength="20" placeholder="请输入银行账号"></el-input>
				</el-form-item>
				<el-form-item label="持卡人" prop="account_person">
					<el-input v-model="account.account_person" style="width:370px;" auto-complete="off" :maxlength="11" placeholder="请输入持卡人"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="mini" :loading="loading" @click="add('account')">确 定</el-button>
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
					account_number:[{ required: true, message: '请输入银行账号', trigger: 'blur' }]
				},
				accounts:[],
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					account_person:""
				}
			}
		},
		activated(){
			this.getAccountsList();
		},
		mounted(){
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        this.title=2;
        this.account = scope.row;
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
					account_person:"",
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
                console.log(res);
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
          _self.pageNum = 10;
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
