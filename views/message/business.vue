<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>信息管理</el-breadcrumb-item>
			<el-breadcrumb-item>商业管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="机构名称" prop="business_name">
		    <el-input v-model="params.business_name" @keyup.13.native="reSearch(false)" style="width:210px;" size="mini" placeholder="商业名称"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('89') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('89') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('92') > -1" @click="addShow" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="businessList" style="width: 100%" size="mini" :stripe="true">
			<el-table-column prop="business_name" label="商业名称"></el-table-column>
			<el-table-column prop="business_mark" label="备注"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
			    <el-button v-dbClick v-show="authCode.indexOf('90') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
         	<el-button v-dbClick v-show="authCode.indexOf('91') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog :title="title == 1?'新增商业':'修改商业'" width="500px" :visible.sync="dialogFormVisible">
			<el-form :model="business" status-icon :rules="businessRule" ref="business" label-width="80px" class="demo-ruleForm">
				<el-form-item label="销售机构" prop="business_name">
					<el-input v-model="business.business_name" auto-complete="off" style="width:350px;" :maxlength="50" placeholder="请输入商业名称"></el-input>
				</el-form-item>
				<el-form-item label="机构地址" prop="business_mark">
					<el-input v-model="business.business_mark" auto-complete="off" style="width:350px;" :maxlength="100" placeholder="请输入备注"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="add('business')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				dialogFormVisible:false,
				business:{
					business_name:"",
					business_mark:""
				},
				businessRule:{
					business_name:[{ required: true, message: '请输入商业名称', trigger: 'blur' }],
				},
				title:1,
				authCode:"",
				loading:false,
				businessList:[],
				pageNum:10,
				currentPage:1,
				count:0,
				deleteId:null,
				params:{
					business_name:""
				}
			}
		},
		activated(){
			this.getBusinessList();
		},
		mounted(){
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				this.title=2;
				this.business = scope.row;
				var _self = this;
				setTimeout(function(){
					_self.$refs["business"].clearValidate();
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
				this.jquery('/iae/business/deleteBusiness',{
					business_id:scope.row.business_id
				},function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getBusinessList();
					_self.dialogFormVisible = false;
				});
			},
			addShow(){
				this.business={
					business_name:"",
					business_mark:""
				};
				this.title=1;
				this.dialogFormVisible = true;
			},
			add(formName){
				var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
						this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/business/saveBusiness',_self.business,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getBusinessList();
              });
            }else{
              this.jquery('/iae/business/editBusiness',_self.business,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.loading = false;
                _self.dialogFormVisible = false;
              });
            }
          } else {
            return false;
          }
        });
			},
			searchHospitalsList(){
				this.currentPage = 1;
				this.getBusinessList();
			},
			getBusinessList(){
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
        this.jquery('/iae/business/getBusiness',{
					data:_self.params,
          page:page
        },function(res){
            _self.businessList = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getBusinessList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getBusinessList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getBusinessList();
    	}
		}
	})
</script>
<style>

</style>
