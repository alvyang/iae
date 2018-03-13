<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" size="small" placeholder="产品名称"></el-input>
		  </el-form-item>
			<el-form-item label="销售机构" prop="hospitalsId">
			 <el-select v-model="params.hospitalsId" filterable size="small" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option v-for="item in hospitals"
					 :key="item.hospital_id"
					 :label="item.hospital_name"
					 :value="item.hospital_id">
				 </el-option>
		 </el-select>
		 </el-form-item>
		 <el-form-item label="日期" prop="salesTime">
			 <el-date-picker v-model="params.salesTime" type="date" size="small" placeholder="请选择日期"></el-date-picker>
		 </el-form-item>
	   <el-form-item>
	     <el-button type="primary" style="margin-left: 14px;" @click="searchDrugsList" size="small">查询</el-button>
			 <el-button type="primary" @click="reSearch" size="small">重置</el-button>
	     <el-button type="primary" @click="add" size="small">新增</el-button>
	   </el-form-item>
		</el-form>
		<el-table :data="sales" style="width: 100%">
  			<el-table-column fixed prop="sales_time" label="日期" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="hospital_name" label="销售机构" width="180"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="120"></el-table-column>
				<el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="120"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="120"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="120"></el-table-column>
				<el-table-column prop="sales_number" label="计划数量" width="120"></el-table-column>
				<el-table-column prop="sales_money" label="购入金额" width="120"></el-table-column>
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
				sales:[],
				contacts:[],
				ipc:null,
				pageNum:10,
				deleteId:"",
				currentPage:1,
				count:0,
				hospitals:[],
				params:{
					productCommonName:"",
					salesTime:"",
					hospitalsId:"",
					start:0,
					limit:10
				}
			}
		},
		activated(){
			this.params.start = 0;
			this.getSalesList();
		},
		mounted(){
			var that = this;
			if (window.require) {
				//获取药品信息
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('return-sales-data', (event, arg) => {
					console.log(arg);
				  	that.sales = arg.data;
				  	that.count = arg.count;
				});
				this.getSalesList();

				this.ipc.on('return-hospital-all-data', (event, arg) => {
          this.hospitals = arg.data;
					sessionStorage["hospital_all"]=JSON.stringify(arg.data);
				});
        this.ipc.send('get-hospitals-list-all',this.sale);
			}
		},
		methods:{
			formatterDate(row, column, cellValue){
				return cellValue.substring(0,10);
			},
			editRow(scope){//编辑药品信息
				sessionStorage["sale_edit"] = JSON.stringify(this.sales[scope.$index]);
				this.$router.push("/main/salesedit");
			},
			deleteRow(scope){//删除
				this.deleteId = scope.row.sales_id;
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
				this.ipc.send('delete-sales',this.deleteId);
				this.ipc.on('delete-sales-return', (event, arg) => {
			  	this.$message({
	          	message: '删除成功',
	          	type: 'success'
	        });
	        this.getSalesList();
				});
			},
			//跳转到编辑页面
			add(){
				this.$router.push("/main/salesdrugs");
			},
			reSearch(){
				this.$refs["params"].resetFields();
				this.getSalesList();
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.params.start = 0;
				this.getSalesList();
			},
			getSalesList(){
				this.ipc.send('get-sales-list',this.params);
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
    		this.params.limit = this.pageNum;
        this.getSalesList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
    		this.params.start = (val-1)*this.pageNum;
    		this.params.limit = this.pageNum;
				this.getSalesList();
    	}
		}
	});
</script>
<style>

</style>
