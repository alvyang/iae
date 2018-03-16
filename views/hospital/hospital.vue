<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>信息管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售机构管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="formInline" class="demo-form-inline search">
		  <el-form-item label="机构名称">
		    <el-input v-model="params.hospitalName" size="small" placeholder="机构名称"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="searchHospitalsList" size="small">查询</el-button>
		    <el-button type="primary" @click="add" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="hospitals" style="width: 100%" :stripe="true">
  			<el-table-column prop="hospital_name" label="销售机构"></el-table-column>
  			<el-table-column prop="hospital_address" label="机构地址"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="200">
		    <template slot-scope="scope">
			    <el-button @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="small"></el-button>
         	<el-button @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
		    </template>
  			</el-table-column>
		</el-table>
		<div class="page_div">
			<el-pagination
	      @size-change="handleSizeChange"
	      @current-change="handleCurrentChange"
	      :current-page="currentPage"
	      :page-sizes="[5, 10, 50, 100]"
	      :page-size="pageNum"
	      layout="total, sizes, prev, pager, next, jumper"
	      :total="count">
	    </el-pagination>
		</div>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				hospitals:[],
				ipc:null,
				pageNum:10,
				currentPage:1,
				count:0,
				deleteId:null,
				params:{
					hospitalName:"",
					start:0,
					limit:10,
				}
			}
		},
		activated(){
			this.params.start = 0;
			this.getHospitalsList();
		},
		mounted(){
			var that = this;
			if (window.require) {
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('return-hospitals-data', (event, arg) => {
					console.log(arg);
			  	that.hospitals = arg.data;
			  	that.count = arg.count;
				});
				this.getHospitalsList();
			}
		},
		methods:{
			editRow(scope){//编辑药品信息
				sessionStorage["hospital_edit"] = JSON.stringify(this.hospitals[scope.$index]);
				this.$router.push("/main/hospitaledit");
			},
			deleteRow(scope){
				this.deleteId = scope.row.hospital_id;
				this.$confirm('是否删除?', '提示', {
        	confirmButtonText: '确定',
        	cancelButtonText: '取消',
        	type: 'warning'
      	}).then(() => {
					this.deleteItem();
      	}).catch(() => {
      	});
			},
			deleteItem(){
				var that = this;
				this.ipc.send('delete-hospital',this.deleteId);
				this.ipc.on('delete-hospital-return', (event, arg) => {
			  	this.$message({
	          	message: '删除成功',
	          	type: 'success'
	        });
	        this.getHospitalsList();
				});
			},
			add(){
				this.$router.push("/main/hospitaledit");
			},
			searchHospitalsList(){
				this.params.start = 0;
				this.getHospitalsList();
			},
			getHospitalsList(){
				this.ipc.send('get-hospitals-list',this.params);
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
    		this.params.limit = this.pageNum;
        this.getHospitalsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
    		this.params.start = (val-1)*this.pageNum;
    		this.params.limit = this.pageNum;
				this.getHospitalsList();
    	}
		}
	})
</script>
<style>

</style>
