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
		<el-table :data="groups" style="width: 100%" size="mini" :stripe="true" :border="true">
			<el-table-column prop="group_name" label="组名称"></el-table-column>
			<el-table-column prop="group_code" label="组编码"></el-table-column>
			<el-table-column prop="start_time" :formatter="formatValue" label="有效期开始时间"></el-table-column>
      <el-table-column prop="end_time" :formatter="formatValue" label="有效期结束时间"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
	    <template slot-scope="scope">
		    <el-button v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
        <el-button v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					group_name:""
				}
			}
		},
		activated(){
			this.searchGroupsList();
		},
		mounted(){
			var that = this;

		},
		methods:{
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
        this.group = scope.row;
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
          _self.pageNum = 10;
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
