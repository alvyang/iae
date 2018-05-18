<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品通用名" prop="productCommonName">
		    <el-input v-model="params.productCommonName" @keyup.13.native="searchDrugsList" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="searchDrugsList" size="small">查询</el-button>
			  <el-button type="primary" @click="reSearch" size="small">重置</el-button>
		    <el-button type="primary" @click="add" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" :stripe="true">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="200"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="150"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="120"></el-table-column>
  			<el-table-column prop="product_price" label="价格" width="120"></el-table-column>
  			<el-table-column prop="product_makesmakers" label="生产产家" width="200"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="200"></el-table-column>
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
			}
		},
		methods:{
			formatterPer(row, column, cellValue){
				var per = row.product_commission/row.product_price*100;
				return per.toFixed(2)+"%";
			},
			editRow(scope){//编辑药品信息
				sessionStorage["drugs_edit"] = JSON.stringify(this.drugs[scope.$index]);
				this.$router.push({path:`/main/drugsedit`});
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
				this.$router.push({path:`/main/drugsedit`});
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.params.start = 0;
				this.getDrugsList();
			},
			getDrugsList(){
				this.ipc.send('get-drugs-list',this.params);
			},
			reSearch(){
				this.$refs["params"].resetFields();
				// this.params.salesTime=[];
				this.getDrugsList();
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
