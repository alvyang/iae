<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>系统管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="角色名" prop="role_name">
		    <el-input v-model="params.role_name" @keyup.13.native="reSearch" size="small" placeholder="角色名"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="reSearch" size="small">查询</el-button>
				<el-button type="primary" @click="reSearch(true)" size="small">重置</el-button>
		    <el-button type="primary" @click="add" v-show="authCode.indexOf('22') > -1" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="roles" style="width: 100%" highlight-current-row :stripe="true">
    			<el-table-column prop="role_name" label="角色名"></el-table-column>
    			<el-table-column prop="role_describe" label="角色描述"></el-table-column>
    			<el-table-column fixed="right" label="操作" width="200">
			    <template slot-scope="scope">
				    <el-button v-show="authCode.indexOf('26') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="small"></el-button>
	          <el-button v-show="authCode.indexOf('27') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
            <el-button v-show="authCode.indexOf('35') > -1" @click.native.prevent="editAuthorityShow(scope)" type="primary" size="small">授权</el-button>
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
      <el-dialog :title="title == 1?'新增角色':'修改角色'" :visible.sync="dialogFormVisible">
        <el-form :model="role" :rules="rules" ref="role" label-width="80px" class="demo-ruleForm">
          <el-form-item label="角色名" prop="role_name">
            <el-input v-model="role.role_name" maxlength='20' auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="role.role_describe" maxlength='100' auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" size="mini" @click="submitForm('role')">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="角色授权" :visible.sync="dialogTreeVisible" width="315px">
        <div class="custom-tree-container">
          <div class="block">
            <el-tree :data="data" node-key="id" ref="tree" show-checkbox :expand-on-click-node="false">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="dialogTreeVisible = false">取 消</el-button>
          <el-button type="primary" size="mini" @click="editAuthority">确 定</el-button>
        </div>
      </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				authCode:"",
				roles:[],
        data:[],
				pageNum:10,
				currentPage:1,
				count:0,
				roleId:null,
        title:"1",
				params:{
					role_name:""
				},
        role:{
          role_name:"",
          role_describe:"",
          authority_code:""
        },
        rules: {
          role_name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
        },
        dialogFormVisible: false,
        dialogTreeVisible: false,
				authorityRole:null//授权时，暂存。点击确定修改，避免重新请求，刷新数据
			}
		},
		activated(){
			this.searchRolesList();
      this.getAuthority();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
      editAuthorityShow(scope){//授权
				var _self = this;
				this.authorityRole = scope.row;
				this.dialogTreeVisible = true;
				this.roleId = scope.row.role_id;
				setTimeout(function(){
					_self.$refs.tree.setCheckedKeys(scope.row.authority_code.split(","));
				},10);
      },
			editAuthority(){
				var _self = this;
				var keys = this.$refs.tree.getCheckedKeys();
				var halfKeys = this.$refs.tree.getHalfCheckedKeys();
				this.authorityRole.authority_code = keys.toString();
				this.jquery('/iae/role/editRoles',{
					authority_code:keys.toString(),
					authority_parent_code:halfKeys.toString(),
					role_id:_self.roleId
				},function(res){
					_self.$message({message: '授权成功',type: 'success'});
					_self.dialogTreeVisible = false;
				});
			},
      getAuthority(){
				var _self = this;
        this.jquery('/iae/authority/getOpenAuthoritys',null,function(res){
					_self.data = res.message[0].children;
        });
      },
      add(){//新增
        this.title = "1";
        this.dialogFormVisible = true;
        this.role={
          role_name:"",
          role_describe:"",
          authority_code:""
        };
				var _self = this;
				setTimeout(function(){
					_self.$refs["role"].clearValidate();
				});
      },
      editRow(scope){//编辑
        this.title = "2";
        this.role = scope.row;
        this.dialogFormVisible = true;
				var _self = this;
				setTimeout(function(){
					_self.$refs["role"].clearValidate();
				});
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
        this.jquery('/iae/role/deleteRoles',scope.row,function(res){
          _self.$message({message: '删除成功',type: 'success'});
          _self.searchRolesList();
          _self.dialogFormVisible = false;
        });
			},
			searchRolesList(){
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
        this.jquery('/iae/role/getRoles',{
          data:_self.params,
          page:page
        },function(res){
            _self.roles = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){//重置
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
        this.searchRolesList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.searchRolesList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.searchRolesList();
    	},
      submitForm(formName) {//新增修改
        var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(this.title == 1){
              this.jquery('/iae/role/saveRoles',_self.role,function(res){
                _self.$message({message: '新增成功',type: 'success'});
                _self.searchRolesList();
                _self.dialogFormVisible = false;
              });
            }else{
              this.jquery('/iae/role/editRoles',_self.role,function(res){
                _self.$message({message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
		}
	})
</script>
<style scoped="scoped">
	.custom-tree-container{
		border-right: none;
		max-height:300px;
		overflow-y:auto;
	}
</style>
