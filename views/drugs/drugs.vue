<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>基础数据</el-breadcrumb-item>
			<el-breadcrumb-item>药品信息</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="formInline" class="demo-form-inline search">
		  <el-form-item label="产品通用名">
		    <el-input v-model="params.productCommonName" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
		  <el-form-item label="联系人">
		    <el-select v-model="params.contactId" filterable size="small" placeholder="请选择">
		    		<el-option key="" label="全部" value=""></el-option>
			    <el-option v-for="item in contacts"
			      :key="item.contacts_id"
			      :label="item.contacts_name"
			      :value="item.contacts_id">
			    </el-option>
			</el-select>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="searchDrugsList" size="small">查询</el-button>
		    <el-button type="primary" @click="add" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="200"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="120"></el-table-column>
  			<el-table-column prop="product_price" label="中标价" width="120"></el-table-column>
  			<el-table-column prop="contacts_name" label="联系人" width="120"></el-table-column>
  			<el-table-column prop="product_business" label="商业" width="120"></el-table-column>
  			<el-table-column prop="product_commission" label="佣金" width="120"></el-table-column>
				<el-table-column prop="per" label="返款比例" width="120" :formatter="formatterPer"></el-table-column>
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
				drugs:[],
				contacts:[],
				ipc:null,
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					productCommonName:"",
					contactId:"",
					start:0,
					limit:10
				}
			}
		},
		activated(){
			this.params.start = 0;
			this.getDrugsList();
		},
		mounted(){
			var that = this;
			if (window.require) {
				//获取药品信息
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('return-drugs-data', (event, arg) => {
				  	that.drugs = arg.data;
				  	that.count = arg.count;
				});
				this.getDrugsList();
				this.ipc.on('return-contacts-all-data', (event, arg) => {
				  	that.contacts = arg.data;
				  	sessionStorage["contacts_all"]=JSON.stringify(arg.data);
				});
				this.ipc.send('get-contacts-list-all');
			}
		},
		methods:{
			formatterPer(row, column, cellValue){
				var per = row.product_commission/row.product_price*100;
				return per.toFixed(2)+"%";
			},
			editRow(scope){//编辑药品信息
				sessionStorage["drugs_edit"] = JSON.stringify(this.drugs[scope.$index]);
				this.$router.push("/main/drugsedit");
			},
			deleteRow(scope){//删除
				this.deleteId = scope.row.product_id;
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
				this.ipc.send('delete-drugs',this.deleteId);
				this.ipc.on('delete-drugs-return', (event, arg) => {
				  	this.$message({
			          	message: '删除成功',
			          	type: 'success'
			        });
			        this.getDrugsList();
				});
			},
			//跳转到编辑页面
			add(){
				this.$router.push("/main/drugsedit");
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.params.start = 0;
				this.getDrugsList();
			},
			getDrugsList(){
				this.ipc.send('get-drugs-list',this.params);
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
    		this.params.limit = this.pageNum;
        this.getDrugsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
    		this.params.start = (val-1)*this.pageNum;
    		this.params.limit = this.pageNum;
				this.getDrugsList();
    	}
		}
	});
</script>
<style>

</style>
