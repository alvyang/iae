<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/main/sales' }">销售管理</el-breadcrumb-item>
			<el-breadcrumb-item>选择药品<a style="color:#f24040;">（请先选择销售药品）</a></el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="formInline" class="demo-form-inline search">
		  <el-form-item label="产品名称">
		    <el-input v-model="params.productCommonName" size="small" placeholder="产品名称"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="searchDrugsList" size="small">查询</el-button>
				<el-button type="primary" @click="returnSale" size="small">返回销售管理</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%">
  			<el-table-column fixed prop="product_common_name" label="产品名称" width="200"></el-table-column>
        <el-table-column prop="product_code" label="产品编号" width="200"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="120"></el-table-column>
  			<el-table-column prop="product_price" label="中标价" width="120"></el-table-column>
        <el-table-column prop="product_makesmakers" label="生产产家" width="200"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="200">
			    <template slot-scope="scope">
						<el-button @click.native.prevent="selectRow(scope)" type="primary" size="small">选择</el-button>
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
				ipc:null,
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					productType:"2",
					productCommonName:"",
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
			}
		},
		methods:{
			//选择要进货的药品
			selectRow(scope){
				sessionStorage["drugs_select"] = JSON.stringify(this.drugs[scope.$index]);
				this.$router.push("/main/salesedit");
			},
			//搜索药品信息
			searchDrugsList(){
				this.params.start = 0;
				this.getDrugsList();
			},
			returnSale(){
				this.$router.push("/main/sales");
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
