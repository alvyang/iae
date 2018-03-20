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
			 <el-date-picker v-model="params.salesTime" type="daterange" size="small" align="right" unlink-panels
				 range-separator="至"
				 start-placeholder="开始日期"
				 end-placeholder="结束日期"
				 :picker-options="pickerOptions2">
			 </el-date-picker>
		 </el-form-item>
	   <el-form-item>
	     <el-button type="primary" style="margin-left: 14px;" @click="searchDrugsList" size="small">查询</el-button>
			 <el-button type="primary" @click="reSearch" size="small">重置</el-button>
	     <el-button type="primary" @click="add" size="small">新增</el-button>
			 <el-button type="primary" @click="exportExcel" size="small">导出</el-button>
	   </el-form-item>
		</el-form>
		<div class="sum_money">销售总额：<a>{{money?money:"0"}}</a> 元</div>
		<el-table :data="sales" style="width: 100%" :stripe="true">
  			<el-table-column fixed prop="sales_time" label="日期" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="hospital_name" label="销售机构" width="180"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="140"></el-table-column>
				<el-table-column prop="product_common_name" label="产品名称" width="160" ></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="120"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="120"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="120"></el-table-column>
				<el-table-column prop="sales_number" label="计划数量" width="120"></el-table-column>
				<el-table-column prop="sales_money" label="购入金额" width="120"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="130">
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
	import XLSX from 'xlsx';
	export default({
		data(){
			const defaultEnd = new Date();
			const defaultStart = new Date(defaultEnd.getFullYear()+"-01"+"-01");
			return {
				pickerOptions2: {
					shortcuts: [{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				sales:[],
				contacts:[],
				ipc:null,
				pageNum:10,
				deleteId:"",
				currentPage:1,
				count:0,
				hospitals:[],
				money:'',//销售总额
				params:{//查询参数
					productCommonName:"",
					salesTime:[defaultStart,defaultEnd],
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
				  	that.sales = arg.data;
						this.money = arg.money;
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
			exportExcel(){
				//定义excel页签名字
				var sm = "";
				if(this.params.salesTime.length > 0){
					var s = new Date(this.params.salesTime[0]).format("yyyy-MM-dd");
					var e = new Date(this.params.salesTime[1]).format("yyyy-MM-dd");
					if(s == e){
						sm =  s;
					}else{
						sm = s+"至"+e;
					}
				}else{
					sm = "全部";
				}
				this.ipc.on('return-export-sales-data', (event, arg) => {
					var _headers = ['st', 'hospital_name', 'product_code', 'product_common_name', 'product_specifications','product_unit','product_price','sales_number','sales_money'];
					var _headersCha = ['日期', '销售机构', '产品编码', '产品名称', '产品规格','单位','中标价','计划数量','购入金额']
					var _data = arg.data;
					var headers = _headers.map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 1 })).reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});
					var headersCha = _headersCha.map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 1 })).reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});
					var data = _data.map((v, i) => _headers.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65+j) + (i+2) })))
												.reduce((prev, next) => prev.concat(next))
												.reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});
					// 合并 headers 和 data
					var output = Object.assign({}, headersCha, data);
					// 获取所有单元格的位置
					var outputPos = Object.keys(output);
					// 计算出范围
					var ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
					// 构建 workbook 对象
					var wb = {
						SheetNames: [sm],
				    Sheets: {}
					};
					wb.Sheets[sm] = Object.assign({}, output, { '!ref': ref });
					// 导出 Excel
					XLSX.writeFile(wb, sm+'.xlsx');
				});
				this.ipc.send('export-sales-list',this.params);
			},
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
				// this.params.salesTime=[];
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
	.sum_money{
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		line-height: 30px;
		padding-left: 10px;
		font-size: 14px;
		color:#606266;
	}
	.sum_money a{
		color: #f24040;
	}
	.main_content .el-date-editor--daterange{
		width: 310px !important;
	}
	.main_content .el-date-editor--daterange > input{
		width: 37% !important;
	}
</style>
