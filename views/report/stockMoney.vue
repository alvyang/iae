<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>库存负债</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick @click="reSearch(false)" size="mini">查询</el-button>
			  <el-button type="primary" v-dbClick @click="reSearch(true)" size="mini">重置</el-button>
	   </el-form-item>
		</el-form>
		<div class="sum_money">库存总负债：<a>{{numMoney}}</a></div>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
			<el-table-column fixed prop="product_common_name" label="产品通用名" width="180"></el-table-column>
			<el-table-column prop="product_code" label="产品编号" width="130"></el-table-column>
			<el-table-column prop="product_makesmakers" label="生产厂家" width="200"></el-table-column>
			<el-table-column prop="product_specifications" label="产品规格" width="130"></el-table-column>
			<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
			<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
			<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
      <el-table-column prop="batch_number" label="批号" width="60"></el-table-column>
      <el-table-column prop="batch_stock_time" label="入库时间" width="100" :formatter="formatterDate"></el-table-column>
      <el-table-column prop="batch_stock_number" label="库存" width="60"></el-table-column>
      <el-table-column prop="shouldReturn" label="应收" :formatter="formatterMoney"></el-table-column>
      <el-table-column prop="realReturn" label="实收" :formatter="formatterMoney"></el-table-column>
      <el-table-column prop="debt" label="负债额" :formatter="formatterMoney"></el-table-column>
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
	</div>
</template>
<script>
	export default({
		data(){
			return {
				drugs:[],
				pageNum:10,
				currentPage:1,
				count:0,
				authCode:"",
				numMoney:0,//库存金额
				params:{
					productCommonName:"",
					product_code:"",
				},
			}
		},
		activated(){
			this.getDrugsList();
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			//搜索所有药品信息
			searchDrugsList(){
				this.getDrugsList();
			},
			getDrugsList(){
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
				this.jquery('/iae/report/getBatchStock',{
					data:_self.params,
					page:page
				},function(res){
						_self.drugs = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
            _self.numMoney = res.message.numMoney;
				});
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getDrugsList();
			},
      formatterMoney(row, column, cellValue){
        if(cellValue){
          return Math.round(cellValue*100)/100;
        }else{
          return 0;
        }
      },
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
    	},
		}
	});
</script>
<style>
	.el-table .cell{
		white-space: nowrap;
	}
</style>
