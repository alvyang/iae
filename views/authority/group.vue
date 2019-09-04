<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>系统管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户组管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="组名称" prop="group_name">
		    <el-input v-model="params.group_name" @keyup.13.native="reSearch" style="width:210px;" size="mini" placeholder="组名称"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick @click="reSearch" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick @click="addShow" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="groups" style="width: 100%" :height="tableHeight" size="mini" :stripe="true" :border="true">
			<el-table-column prop="group_name" label="组名称"></el-table-column>
			<el-table-column prop="group_code" label="组编码"></el-table-column>
			<el-table-column prop="start_time" :formatter="formatterDate" label="有效期开始时间" ></el-table-column>
      <el-table-column prop="end_time" :formatter="formatterDate" label="有效期结束时间" ></el-table-column>
			<el-table-column fixed="right" label="操作" width="180">
	    <template slot-scope="scope">
		    <el-button v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
        <el-button v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
				<el-button v-dbClick @click.native.prevent="editRoleShow(scope)" type="primary" size="mini">授权</el-button>
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
    <el-dialog :title="title == 1?'新增用户组':'修改用户组'" width="500px" :visible.sync="dialogFormVisible">
      <el-form :model="group" :rules="rules" ref="group" label-width="130px" class="demo-ruleForm">
        <el-form-item label="组名称" prop="group_name">
          <el-input v-model="group.group_name" style="width: 300px;" maxlength='20' auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="组编码" prop="group_code" :required="true">
          <el-input v-model="group.group_code" style="width: 300px;" maxlength='20' auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="有效期开始日期" prop="start_time">
          <el-date-picker v-model="group.start_time" style="width: 300px;" type="date" placeholder="选择开始日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="有效期结束日期" prop="end_time">
          <el-date-picker v-model="group.end_time" style="width: 300px;" type="date" placeholder="选择结束日期"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading"  @click="add('group')">确 定</el-button>
      </div>
    </el-dialog>
		<el-dialog title="角色授权" :visible.sync="dialogTreeVisible" width="315px">
			<div class="custom-tree-container">
				<div class="block">
					<el-tree :data="data" node-key="id" ref="tree" show-checkbox
						:expand-on-click-node="false">
						<span class="custom-tree-node" slot-scope="{ node, data }">
							<span>{{ node.label }}</span>
						</span>
					</el-tree>
				</div>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" v-dbClick @click="dialogTreeVisible = false">取 消</el-button>
				<el-button type="primary" v-dbClick size="small" @click="editGroupAuthority">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validateGroup = (rule, value, callback) => {
				var _self = this;
        if (value === '') {
          callback(new Error('请输入组编码'));
        } else {
					this.jquery('/iae/group/exitsGroup',{
						group_code:_self.group.group_code
					},function(res){
						if (_self.title == 1 && res.message.length > 0) {
		          callback(new Error('该组编码已存在'));
		        } else {
		          callback();
		        }
					});
				}
      };
			return {
				loading:false,
        dialogFormVisible:false,
				dialogTreeVisible:false,
				group:{
          group_name:"",
					group_code:"",
          start_time:null,
          end_time:null
        },
        rules: {
          group_name: [{ required: true, message: '请输入组名称', trigger: 'blur' }],
					group_code: [{validator: validateGroup, trigger: 'blur' }]
        },
        groups:[],
        title:1,
				pageNum:20,
				tableHeight:0,
				currentPage:1,
				groupId:"",
				count:0,
				data:[],
				params:{
					group_name:""
				},
				front_authority_code:"",
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
			this.searchGroupsList();
			this.getAuthority();
		},
		mounted(){
			var that = this;

		},
		methods:{
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
			editGroupAuthority(){
				var _self = this;
				var keys = this.$refs.tree.getCheckedKeys();
				var halfKeys = this.$refs.tree.getHalfCheckedKeys();
				this.jquery('/iae/group/editGroupAuthority',{
					authority_code:keys.concat(halfKeys),
					front_authority_code:_self.front_authority_code,
					group_id:_self.groupId
				},function(res){
					_self.$message({showClose: true,message: '授权成功',type: 'success'});
					_self.searchGroupsList();
					_self.dialogTreeVisible = false;
				});
			},
			getAuthority(){
				var _self = this;
        this.jquery('/iae/authority/getOpenAuthoritys',null,function(res){
					_self.data = res.message[0].children;
        });
      },
			editRoleShow(scope){
				var _self = this;
				this.dialogTreeVisible = true;
				this.groupId = scope.row.group_id;
				this.front_authority_code = scope.row.authority_code;
				setTimeout(function(){
					_self.$refs.tree.setCheckedKeys([]);
					var code = scope.row.authority_code.substring(0,scope.row.authority_code.length-1).split(",");
					for(var i = 0 ; i < code.length;i++){
							_self.$refs.tree.setChecked(code[i],true,false);
					}
				},10);
			},
			addShow(){
				this.dialogFormVisible = true;
				this.group={
          group_name:"",
					group_code:"",
          start_time:null,
          end_time:null
        };
				var _self = this;
				this.title=1;
				setTimeout(function(){
					_self.$refs["group"].clearValidate();
				});
			},
			editRow(scope){//编辑药品信息
        this.dialogFormVisible = true;
        this.title=2;
				var temp = JSON.stringify(scope.row);
        this.group = JSON.parse(temp);
				this.group.front_message = temp;
				var _self = this;
				setTimeout(function(){
					_self.$refs["group"].clearValidate();
				});
			},
			deleteRow(scope){
				this.deleteId = scope.row.contacts_id;
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
        this.jquery('/iae/group/deleteGroups',{
          group_id:scope.row.group_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.searchGroupsList();
          _self.dialogFormVisible = false;
        });

			},
			add(formName){
        var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
						this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/group/saveGroups',_self.group,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
								_self.loading = false;
                _self.dialogFormVisible = false;
              });
            }else{
              this.jquery('/iae/group/editGroups',_self.group,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
              });
            }
						_self.searchGroupsList();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
			},
			searchGroupsList(){
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
        this.jquery('/iae/group/getGroups',{
          data:_self.params,
          page:page
        },function(res){
          _self.groups = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
  				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
        this.searchGroupsList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
    		this.params.limit = this.pageNum;
        this.searchGroupsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
    		this.params.start = (val-1)*this.pageNum;
    		this.params.limit = this.pageNum;
				this.searchGroupsList();
    	},
      formatValue(row, column, cellValue, index){
        return cellValue.substring(0,10);
      }
		}
	})
</script>
<style scoped="scoped">

</style>
