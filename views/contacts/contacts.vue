<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>信息管理</el-breadcrumb-item>
			<el-breadcrumb-item>联系人管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="联系人" prop="contactName">
		    <el-input v-model="params.contactName" @keyup.13.native="searchContactsList" size="small" placeholder="联系人"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="searchContactsList" size="small">查询</el-button>
				<el-button type="primary" @click="reSearch" size="small">重置</el-button>
		    <el-button type="primary" @click="add" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="contacts" style="width: 100%" :stripe="true">
    			<el-table-column prop="contacts_name" label="联系人"></el-table-column>
    			<el-table-column prop="contacts_phone" label="电话"></el-table-column>
    			<el-table-column fixed="right" label="操作" width="200">
			    <template slot-scope="scope">
				    <el-button @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="small">
			        </el-button>
			         <el-button @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small">
			        </el-button>
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
				contacts:[],
				ipc:null,
				pageNum:10,
				currentPage:1,
				count:0,
				deleteId:null,
				params:{
					contactName:"",
					start:0,
					limit:10,
				}
			}
		},
		activated(){
			this.params.start = 0;
			this.getContactsList();
		},
		mounted(){
			var that = this;
			if (window.require) {
		    this.ipc = window.require('electron').ipcRenderer;
					this.ipc.on('return-contacts-data', (event, arg) => {
			  	that.contacts = arg.data;
			  	that.count = arg.count;
				});
			}
		},
		methods:{
			editRow(scope){//编辑药品信息
				sessionStorage["contacts_edit"] = JSON.stringify(this.contacts[scope.$index]);
				this.$router.push("/main/contactsedit");
			},
			deleteRow(scope){
				this.deleteId = scope.row.contacts_id;
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
				this.ipc.send('delete-contacts',this.deleteId);
				this.ipc.on('delete-contacts-return', (event, arg) => {
				  	this.$message({
		          	message: '删除成功',
		          	type: 'success'
		        });
		        this.getContactsList();
				});
			},
			add(){
				this.$router.push("/main/contactsedit");
			},
			searchContactsList(){
				this.params.start = 0;
				this.getContactsList();
			},
			getContactsList(){
				this.ipc.send('get-contacts-list',this.params);
			},
			reSearch(){
				this.$refs["params"].resetFields();
				this.getContactsList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
    		this.params.limit = this.pageNum;
        this.getContactsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
    		this.params.start = (val-1)*this.pageNum;
    		this.params.limit = this.pageNum;
				this.getContactsList();
    	}
		}
	})
</script>
<style>

</style>
