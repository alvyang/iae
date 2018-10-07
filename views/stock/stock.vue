<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>药品管理</el-breadcrumb-item>
			<el-breadcrumb-item>库存管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品通用名"></el-input>
		  </el-form-item>
			<el-form-item label="　　商业" prop="business">
	 			 <el-select v-model="params.business" style="width:178px;" size="mini" filterable placeholder="请选择商业">
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
		<div class="sum_money">库存总额：<a>{{stockMoney}}</a> 元；库存量：<a>{{stockNum}}</a> 元</div>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="180"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="130"></el-table-column>
  			<el-table-column prop="product_makesmakers" label="生产产家" width="200"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="130"></el-table-column>
  			<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="stock" label="库存" width="60"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="80"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="180">
			    <template slot-scope="scope">
		        <el-button v-dbClick @click.native.prevent="analysis(scope)" type="primary" size="mini">销售分析</el-button>
						<el-button v-dbClick @click.native.prevent="editStockShow(scope)" type="primary" size="mini">修改库存</el-button>
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
		<el-dialog title="修改库存" width="500px" :visible.sync="dialogFormVisibleStock">
			<div><span>产品名称:</span>{{drug.product_common_name}}</div>
			<div>
				<span>产品编号:</span>{{drug.product_code}}
				<span style="padding-left:30px;">产品规格:</span>{{drug.product_specifications}}
				<span style="padding-left:30px;">库存:</span>{{drug.stock}}
			</div>
			<div><span>生产产家:</span>{{drug.product_makesmakers}}</div>
			<el-form :model="drug" ref="drug" status-icon :rules="drugRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="库存" prop="stock" :required="true">
					<el-input v-model="drug.stock" :maxlength="10" placeholder="请输入购入数量"></el-input>
			 	</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" v-dbClick @click="dialogFormVisibleStock = false">取 消</el-button>
				<el-button type="primary" v-dbClick size="small" :loading="loading" @click="editStock('drug')">确 定</el-button>
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
				drug:{},
				drugRule:{
					stock:[{validator:validateNum,trigger: 'blur' }]
				},
				contacts:[],
				business:[],
				pageNum:10,
				currentPage:1,
				count:0,
				authCode:"",
				dialogFormVisible:false,
				dialogFormVisibleStock:false,
				loading:false,
				stockMoney:0,//库存金额
				stockNum:0,//库存数量
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
			this.getProductBusiness();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
			editStockShow(scope){
				this.dialogFormVisibleStock = true;
				this.drug = scope.row;
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
				this.jquery('/iae/drugs/getDrugs',{
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
						_self.stockMoney = res.message.mpn;
						_self.stockNum = res.message.sn;
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
