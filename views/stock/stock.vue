<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>药品管理</el-breadcrumb-item>
			<el-breadcrumb-item>库存管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="　　商业" prop="business">
	 			 <el-select v-model="params.business" style="width:210px;" size="mini" filterable placeholder="请选择商业">
	 				 <el-option key="" label="全部" value=""></el-option>
	 				 <el-option v-for="item in business"
	 					 :key="item.business_id"
	 					 :label="item.business_name"
	 					 :value="item.business_id"></el-option>
	 			 </el-select>
 		 </el-form-item>
		 <el-form-item>
		    <el-button type="primary" v-dbClick @click="reSearch(false)" size="mini">查询</el-button>
			  <el-button type="primary" v-dbClick @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money">库存总额：<a>{{stockMoney}}</a> 元；库存量：<a>{{stockNum}}</a></div>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="180"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="130"></el-table-column>
  			<el-table-column prop="product_makesmakers" label="生产产家" width="200"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="130"></el-table-column>
  			<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="batch_stock_number" label="总库存" width="60"></el-table-column>
				<el-table-column prop="pnum" label="当前备货量" width="80"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" ></el-table-column>
  			<el-table-column fixed="right" label="操作" width="180">
			    <template slot-scope="scope">
		        <el-button v-dbClick @click.native.prevent="analysis(scope)" type="primary" size="mini">销售分析</el-button>
						<el-button v-dbClick @click.native.prevent="editStockShow(scope)" type="primary" size="mini">批次库存</el-button>
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
		<el-dialog title="库存分析" width="700px" :visible.sync="dialogFormVisible">
				<div><span>产品名称:</span>{{drug.product_common_name}}</div>
				<div>
					<span>产品编号:</span>{{drug.product_code}}
					<span style="padding-left:30px;">产品规格:</span>{{drug.product_specifications}}
					<span style="padding-left:30px;">库存:</span>{{drug.stock}}
				</div>
				<div><span>生产产家:</span>{{drug.product_makesmakers}}</div>
				<div>
					<div id="stock_analysis_line" style="width:660px;height:200px;"></div>
				</div>
    </el-dialog>
		<el-dialog :title="'修改库存  '+drug.product_common_name" width="700px" :visible.sync="dialogFormVisibleStock">
			<el-table :data="drugsStock" style="width: 100%" size="mini" :stripe="true" :border="true">
					<el-table-column fixed prop="batch_stock_time" label="入库时间" :formatter="formatterDate"></el-table-column>
					<el-table-column prop="batch_number" label="批号"></el-table-column>
					<el-table-column label="当前库存">
						<template slot-scope="scope">
		          <el-input v-model="scope.row.batch_stock_number" @blur="editBatchStock(scope)" size="mini"></el-input>
		        </template>
					</el-table-column>
					<el-table-column fixed="right" label="操作" width="60">
						<template slot-scope="scope">
							<el-button v-dbClick @click.native.prevent="deleteBatchStockRow(scope)" type="primary" icon="el-icon-delete" size="mini"></el-button>
						</template>
					</el-table-column>
			</el-table>
			<div class="page_div">
				<el-pagination
					background
					@size-change="handleSizeChangeStock"
					@current-change="handleCurrentChangeStock"
					:current-page="currentPageStock"
					:page-sizes="[5, 10, 50, 100]"
					:page-size="pageNumStock"
					layout="total, sizes, prev, pager, next, jumper"
					:total="countStock">
				</el-pagination>
			</div>
    </el-dialog>
	</div>
</template>
<script>
	import echarts from "echarts";
	export default({
		data(){
			var validateNum = (rule, value, callback) => {
				var regu = /^([1-9]\d*|[0]{1,1})$/;;
				if (value === '') {
					callback(new Error('请输入库存'));
				} else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
					callback();
				}
			};
			return {
				drugs:[],
				drugsStock:[],//库存列表
				drug:{},
				drugRule:{
					stock:[{validator:validateNum,trigger: 'blur' }]
				},
				contacts:[],
				business:[],
				pageNum:10,
				currentPage:1,
				count:0,
				pageNumStock:10,
				currentPageStock:1,
				countStock:0,
				authCode:"",
				dialogFormVisible:false,
				dialogFormVisibleStock:false,
				loading:false,
				stockMoney:0,//库存金额
				stockNum:0,//库存数量
				params:{
					productCommonName:"",
					contactId:"",
					product_type:['高打'],
					product_medical_type:"",
					product_code:"",
					business:"",
					product_distribution_flag:"0"
				}
			}
		},
		activated(){
			this.getDrugsList();
			this.getProductBusiness();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			deleteBatchStockRow(scope){//删除
				this.$confirm('是否删除?', '提示', {
          	confirmButtonText: '确定',
          	cancelButtonText: '取消',
          	type: 'warning'
        }).then(() => {
						this.deleteBatchStock(scope);
        }).catch(() => {
        });
			},
			deleteBatchStock(scope){//删除批次库存
				var _self = this;
				this.jquery('/iae/stock/deleteBatchStock',scope.row,function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getBatchStock();
					_self.getDrugsList();
				});
			},
			editBatchStock(scope){//修改批次库存
				var _self = this;
				this.jquery('/iae/stock/editBatchStock',scope.row,function(res){
					_self.getDrugsList();
				});
			},
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
			editStockShow(scope){
				this.dialogFormVisibleStock = true;
				this.drug = scope.row;
				this.getBatchStock();//获取批次库存列表
			},
			editStock(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.loading =  true;
						_self.jquery('/iae/stock/editStock',{
							product_id:_self.drug.product_id,
							stock:_self.drug.stock,
						},function(res){
							_self.dialogFormVisibleStock = false;
							_self.loading = false;
							_self.$message({showClose: true,message: '修改成功',type: 'success'});
							_self.getDrugsList();
						});
					} else {
						return false;
					}
				});
			},
			analysis(scope){
				var _self = this;
				this.jquery('/iae/stock/getStockAnalysis',{
					productCode:scope.row.product_code,
					productId:scope.row.product_id
				},function(res){
					_self.dialogFormVisible = true;
					_self.drug = scope.row;
					setTimeout(function(){
						_self.getStockAnalysis(res.message);
					},10);
				});
			},
			getStockAnalysis(arg){
				// 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('stock_analysis_line'));
	      // 指定图表的配置项和数据
				var option = {
					color: ["#8ad163","#b373f4"],
					grid:{
						top:"40px",
					},
					tooltip: {
		        trigger: 'axis'
			    },
			    xAxis: {
		        type: 'category',
						name: '日期',
						boundaryGap: false,
		        data:arg.time.reverse()
			    },
			    yAxis: {
		        type: 'value',
						name: '销售量',
			    },
			    series: [{
            name:'销售量',
            type:'line',
            data:arg.num.reverse()
	        },{
            name:'调货量',
            type:'line',
            data:arg.anum.reverse()
	        }]
				};
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
			},
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
				this.jquery('/iae/stock/getDrugsStock',{
					data:_self.params,
					page:page
				},function(res){
						_self.drugs = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
				});
				this.jquery('/iae/drugs/getStockNum',{
					data:_self.params,
					page:page
				},function(res){
						_self.stockMoney = Math.round(res.message.mpn*100)/100;
						_self.stockNum = res.message.sn;
				});
			},
			getBatchStock(){
				var _self = this;
				if(!_self.currentPageStock){
					_self.currentPageStock = 1;
				}
				if(!_self.pageNumStock){
					_self.pageNumStock = 10;
				}
				var page = {
					start:(_self.currentPageStock-1)*_self.pageNumStock,
					limit:_self.pageNumStock
				}
				this.jquery('/iae/stock/getDrugsStockList',{
					data:{
						drug_id:this.drug.product_id
					},
					page:page
				},function(res){
						_self.drugsStock = res.message.data;
						_self.pageNumStock=parseInt(res.message.limit);
						_self.countStock=res.message.totalCount;
				});
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getDrugsList();
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
			handleSizeChangeStock(val) {
        this.pageNum = val;
    		this.currentPage = 1;
    		this.params.limit = this.pageNum;
        this.getDrugsList();
    	},
    	handleCurrentChangeStock(val) {
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
