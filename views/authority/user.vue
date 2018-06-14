<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>系统管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="用户名" prop="username">
		    <el-input v-model="params.username" v-show="authCode.indexOf('21') > -1" @keyup.13.native="reSearch" size="small" placeholder="用户名"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="reSearch" size="small">查询</el-button>
				<el-button type="primary" @click="reSearch(true)" size="small">重置</el-button>
		    <el-button type="primary" @click="addShow" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="users" style="width: 100%" :stripe="true">
			<el-table-column prop="username" label="用户名"></el-table-column>
			<el-table-column prop="realname" label="真实姓名"></el-table-column>
			<el-table-column prop="role_name" label="角色名"></el-table-column>
			<el-table-column fixed="right" label="操作" width="200">
	    <template slot-scope="scope">
		    <el-button v-show="authCode.indexOf('24') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="small"></el-button>
        <el-button v-show="authCode.indexOf('25') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
				<el-button v-show="authCode.indexOf('34') > -1" @click.native.prevent="addRole(scope)" type="primary" size="small">授权</el-button>
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
    <el-dialog :title="title == 1?'新增用户':'修改用户'" width="500px" :visible.sync="dialogFormVisible">
      <el-form :model="user" :rules="rules" ref="user" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username" :required="true">
          <el-input v-model="user.username" maxlength='20' placeholder="用户名" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="密码" prop="password">
          <el-input v-model="user.password" maxlength='20' type='password' placeholder="密码" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="真实姓名" prop="realname">
          <el-input v-model="user.realname" maxlength='20' placeholder="真实姓名" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="add('user')">确 定</el-button>
      </div>
    </el-dialog>
		<el-dialog title="选择角色" :visible.sync="dialogTableVisible">
			<el-table ref="singleTable"
				:data="roles"
				border
				highlight-current-row
				@current-change="handleCurrentChange">
				<el-table-column type="index" width="50"></el-table-column>
		    <el-table-column property="role_name" label="角色名"></el-table-column>
		    <el-table-column property="role_describe" label="角色描述"></el-table-column>
		  </el-table>
			<div class="page_div">
				<el-pagination
					background
		      @current-change="handleRoleCurrentChange"
		      :current-page="role.currentPage"
		      :page-size="role.pageNum"
		      layout="total,prev, pager, next, jumper"
		      :total="role.count">
		    </el-pagination>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="dialogTableVisible = false">取 消</el-button>
				<el-button type="primary" size="mini" @click="selectRole">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validateUsername = (rule, value, callback) => {
				var _self = this;
        if (value === '') {
          callback(new Error('请输入用户名'));
        } else {
					this.jquery('/iae/user/exitsUsers',{
						username:_self.user.username
					},function(res){
						if (_self.title == 1 && res.message.length > 0) {
		          callback(new Error('该用户名已存在'));
		        } else {
		          callback();
		        }
					});
				}
      };
			return {
				authCode:"",
        dialogFormVisible:false,
				dialogTableVisible:false,
				user:{
          username:"",
          password:"",
          realname:""
        },
        rules: {
          username: [{validator: validateUsername, trigger: 'blur' }],
					password: [{required: true, message: '请输入密码', trigger: 'blur' }]
        },
        users:[],
				roles:[],
        title:1,
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					username:""
				},
				role:{
					pageNum:5,
					currentPage:1,
					count:0
				},
				selectUser:null,
				currentRow: null
			}
		},
		activated(){
			this.searchUsersList();
			this.searchRolesList();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
			var that = this;
		},
		methods:{
			addShow(){
				this.dialogFormVisible = true;
				this.user={
          username:"",
          password:"",
          realname:""
        };
				var _self = this;
				setTimeout(function(){
					_self.$refs["user"].clearValidate();
				});
			},
			addRole(scope){
				var _self = this;
				this.dialogTableVisible =  true;
				this.selectUser = scope.row;
				setTimeout(function(){
					for(var i = 0 ; i < _self.roles.length ; i++){
						if(_self.roles[i].role_id == scope.row.role_id){
							_self.$refs.singleTable.setCurrentRow(_self.roles[i]);
							break;
						}
					}
				},10);
			},
			selectRole(){
				var _self = this;
				this.jquery('/iae/user/editUserRole',{
					id:this.selectUser.id,
					role_id:this.currentRow.role_id+""
				},function(res){
					_self.$message({message: '修改成功',type: 'success'});
					_self.dialogTableVisible = false;
					_self.selectUser.role_name = _self.currentRow.role_name;
					_self.selectUser.role_id = _self.currentRow.role_id;
				});
			},
			editRow(scope){//编辑药品信息
        this.dialogFormVisible = true;
        this.title=2;
        this.user = scope.row;
				var _self = this;
				setTimeout(function(){
					_self.$refs["user"].clearValidate();
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
        this.jquery('/iae/user/deleteUsers',{
          id:scope.row.id
        },function(res){
          _self.$message({message: '删除成功',type: 'success'});
          _self.searchUsersList();
          _self.dialogFormVisible = false;
        });
			},
			add(formName){
        var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(this.title == 1){
              this.jquery('/iae/user/saveUsers',_self.user,function(res){
                _self.$message({message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
              });
            }else{
              this.jquery('/iae/user/editUsers',_self.user,function(res){
                _self.$message({message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
			},
			searchRolesList(){
				var _self = this;
        if(!_self.role.currentPage){
          _self.role.currentPage = 1;
        }
        if(!_self.role.pageNum){
          _self.role.pageNum = 5;
        }
				var page = {
          start:(_self.role.currentPage-1)*_self.role.pageNum,
          limit:_self.role.pageNum
        }
        this.jquery('/iae/role/getRoles',{
					data:{group_id:0},
          page:page
        },function(res){
            _self.roles = res.message.data;
            _self.role.pageNum=parseInt(res.message.limit);
    				_self.role.count=res.message.totalCount;
        });
			},
			searchUsersList(){
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
        this.jquery('/iae/user/getUsers',{
          data:_self.params,
          page:page
        },function(res){
					console.log(res);
          _self.users = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
  				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
        this.searchUsersList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.searchUsersList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.searchUsersList();
    	},
      formatValue(row, column, cellValue, index){
        return cellValue.substring(0,10);
      },
			handleRoleCurrentChange(val){
				this.role.currentPage = val;
				this.searchRolesList();
			},
			handleCurrentChange(val) {
        this.currentRow = val;
      }
		}
	})
</script>
<style>
	.el-dialog__body{
		padding-top: 0 !important;
		padding-bottom: 0 !important;
	}
</style>
