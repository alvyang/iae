<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" @keyup.13.native="reSearch(false)" size="small" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" @keyup.13.native="reSearch(false)" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="reSearch(false)" size="small">查询</el-button>
			  <el-button type="primary" @click="reSearch(true)" size="small">重置</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="200"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="150"></el-table-column>
  			<el-table-column prop="product_makesmakers" label="生产产家" width="240"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column>
  			<el-table-column prop="product_packing" label="包装" width="80"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="80"></el-table-column>
        <el-table-column prop="stock" label="库存" width="100"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="80"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="130">
			    <template slot-scope="scope">
		        <el-button @click.native.prevent="editRow(scope)" type="primary" size="small">库存分析</el-button>
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
	</div>
</template>
<script>
	export default({
		data(){
			return {
				drugs:[],
				contacts:[],
				business:[],
				pageNum:10,
				currentPage:1,
				count:0,
				authCode:"",
				params:{
					productCommonName:"",
					contactId:"",
					product_type:['高打','高打(底价)'],
					product_medical_type:"",
					product_code:"",
					business:""
				}
			}
		},
		activated(){
			this.getDrugsList();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
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
				this.jquery('/iae/drugs/getDrugs',{
					data:_self.params,
					page:page
				},function(res){
						_self.drugs = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
				});
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
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
	.el-table .cell{
		white-space: nowrap;
	}
</style>
