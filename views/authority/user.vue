<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>系统管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="用户名" prop="username">
		    <el-input v-model="params.username" style="width:210px;" @keyup.13.native="reSearch" size="mini" placeholder="用户名"></el-input>
		  </el-form-item>
			<el-form-item label="用户组" prop="groupId">
				<el-select v-model="params.groupId" style="width:210px;" size="mini" filterable placeholder="请选择组">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in groups" :key="item.group_id" :label="item.group_name" :value="item.group_id"></el-option>
				</el-select>
			</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',19,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',19,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',16,') > -1" @click="addShow" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="users" style="width: 100%" :height="tableHeight" size="mini" :stripe="true">
			<el-table-column prop="username" label="用户名"></el-table-column>
			<el-table-column prop="group_name" label="组名称"></el-table-column>
			<el-table-column prop="group_code" label="组编码"></el-table-column>
			<el-table-column prop="realname" label="真实姓名"></el-table-column>
			<el-table-column prop="data_authority" label="数据权限" :formatter="formatterType"></el-table-column>
			<el-table-column prop="role_name" label="角色名"></el-table-column>
			<el-table-column fixed="right" label="操作" width="200">
	    <template slot-scope="scope">
		    <el-button v-show="authCode.indexOf(',18,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
        <el-button v-show="authCode.indexOf(',17,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
				<el-button v-show="authCode.indexOf(',24,') > -1" v-dbClick @click.native.prevent="addRole(scope)" type="primary" size="mini">授权</el-button>
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
    <el-dialog :title="title == 1?'新增用户':'修改用户'" width="500px" :visible.sync="dialogFormVisible">
      <el-form :model="user" :rules="rules" ref="user" label-width="100px" class="demo-ruleForm">
				<el-form-item label="用户组" prop="group_id" :required="true">
					<el-select v-model="user.group_id" style="width:300px;" placeholder="请选择组">
						<el-option v-for="item in groups" :key="item.group_id" :label="item.group_name" :value="item.group_id"></el-option>
					</el-select>
				</el-form-item>
        <el-form-item label="用户名" prop="username" :required="true">
          <el-input v-model="user.username" maxlength='20' style="width: 300px;" placeholder="用户名" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="数据权限" prop="data_authority">
						<el-radio v-model="user.data_authority" label="1">系统级</el-radio>
	  				<el-radio v-model="user.data_authority" label="2">用户级</el-radio>
        </el-form-item>
				<el-form-item label="密码" prop="password">
          <el-input v-model="user.password" maxlength='20' style="width: 300px;" type='password' placeholder="密码" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="真实姓名" prop="realname">
          <el-input v-model="user.realname" maxlength='20' style="width: 300px;" placeholder="真实姓名" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="add('user')">确 定</el-button>
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
				<el-button size="small" v-dbClick @click="dialogTableVisible = false">取 消</el-button>
				<el-button type="primary" v-dbClick size="small" @click="selectRole">确 定</el-button>
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
        } else if(this.user.group_id){
					this.jquery('/iae/user/exitsUsers',{
						username:_self.user.username,
						group_id:_self.user.group_id
					},function(res){
						if (_self.title == 1 && res.message.length > 0) {
		          callback(new Error('该用户名已存在'));
		        } else {
		          callback();
		        }
					});
				}else{
					callback();
				}
      };
			return {
				authCode:"",
        dialogFormVisible:false,
				dialogTableVisible:false,
				loading:false,
				user:{
          username:"",
          password:"",
          realname:"",
					group_id:"",
					data_authority:"1",
        },
        rules: {
          username: [{validator: validateUsername, trigger: 'blur' }]
        },
        users:[],
				roles:[],
        title:1,
				pageNum:20,
				tableHeight:0,
				currentPage:1,
				count:0,
				params:{
					username:"",
					groupId:""
				},
				role:{
					pageNum:5,
					currentPage:1,
					count:0
				},
				selectUser:null,
				currentRow: null,
				groups:[]
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
			this.searchUsersList();
			this.searchRolesList();
			this.getAllGroups();
			this.params.groupId = JSON.parse(sessionStorage["user"]).group_id;
			this.user.group_id = JSON.parse(sessionStorage["user"]).group_id;
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
			this.params.groupId = JSON.parse(sessionStorage["user"]).group_id;
		},
		methods:{
			formatterType(row, column, cellValue){
				return cellValue=='1'?"系统级":"用户级";
			},
			addShow(){
				this.dialogFormVisible = true;
				this.user={
          username:"",
          password:"",
          realname:"",
					data_authority:"1",
        };
				// this.user.group_id = JSON.parse(sessionStorage["user"]).group_id;
				this.title=1;
				var _self = this;
				setTimeout(function(){
					_self.$refs["user"].clearValidate();
				});
			},
			addRole(scope){
				var _self = this;
				this.dialogTableVisible =  true;
				var temp = JSON.stringify(scope.row);
				this.selectUser = JSON.parse(temp);
				setTimeout(function(){
					for(var i = 0 ; i < _self.roles.length ; i++){
						if(_self.roles[i].role_id == this.selectUser.role_id){
							_self.$refs.singleTable.setCurrentRow(_self.roles[i]);
							break;
						}
					}
				},10);
			},
			getAllGroups(){
				var _self = this;
				this.jquery('/iae/group/getAllGroups',null,function(res){
					_self.groups = res.message;
				});
			},
			selectRole(){
				var _self = this;
				this.jquery('/iae/user/editUserRole',{
					id:this.selectUser.id,
					role_id:this.currentRow.role_id+"",
					front_role_id:this.selectUser.role_id,
				},function(res){
					_self.$message({showClose: true,message: '修改成功',type: 'success'});
					_self.dialogTableVisible = false;
					_self.selectUser.role_name = _self.currentRow.role_name;
					_self.selectUser.role_id = _self.currentRow.role_id;
				});
			},
			editRow(scope){//编辑药品信息
        this.dialogFormVisible = true;
        this.title=2;
				var temp = JSON.stringify(scope.row);
        this.user = JSON.parse(temp);
				this.user.front_message = temp;
				this.user.password = "";//密码不显示
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
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.searchUsersList();
          _self.dialogFormVisible = false;
        });
			},
			add(formName){
        var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
						this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/user/saveUsers',_self.user,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
              });
            }else{
              this.jquery('/iae/user/editUsers',_self.user,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading =false;
              });
            }
						_self.searchUsersList();
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
          _self.pageNum = 20;
        }
				var page = {
          start:(_self.currentPage-1)*_self.pageNum,
          limit:_self.pageNum
        }
        this.jquery('/iae/user/getUsers',{
          data:_self.params,
          page:page
        },function(res){
          _self.users = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
  				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
					this.params.groupId = JSON.parse(sessionStorage["user"]).group_id;
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

</style>
