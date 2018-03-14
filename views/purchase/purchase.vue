<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品通用名" prop="productCommonName">
		    <el-input v-model="params.productCommonName" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
		  <el-form-item label="联系人" prop="contactId">
		    <el-select v-model="params.contactId" filterable size="small" placeholder="请选择">
	    		<el-option key="" label="全部" value=""></el-option>
			    <el-option v-for="item in contacts"
			      :key="item.contacts_id"
			      :label="item.contacts_name"
			      :value="item.contacts_id">
			    </el-option>
			</el-select>
		  </el-form-item>
			<el-form-item label="入库时间" prop="storageTime">
				<el-date-picker v-model="params.storageTime" type="daterange" size="small" align="right" unlink-panels
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
				<!-- <el-button type="primary" @click="exportExcel" size="small">导出</el-button> -->
		  </el-form-item>
		</el-form>
		<div class="sum_money">
			<a>采购总额：</a>{{money.pm?money.pm:"0"}} 元 <a>应返金额：</a>{{money.sm?money.sm:"0"}} 元 <a>实返金额：</a>{{money.rm?money.rm:"0"}} 元 <a>未返金额：</a>{{money.sm - money.rm}} 元
			<router-link :to="{path:'returnmoney'}" class="more_detail">查看详情</router-link>
		</div>
		<el-table :data="purchase" style="width: 100%">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="180"></el-table-column>
				<el-table-column prop="puchase_number" label="购入数量" width="120"></el-table-column>
				<el-table-column prop="puchase_money" label="购入金额" width="120"></el-table-column>
				<el-table-column prop="storage_time" label="入库时间" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="shoule_return_money" label="应返金额" width="120"></el-table-column>
				<el-table-column prop="should_return_time" label="应返时间" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="real_return_money" label="实返金额" width="120"></el-table-column>
				<el-table-column prop="real_return_time" label="返费时间" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="own_money" label="外欠佣金" width="120"></el-table-column>
				<el-table-column prop="regenerator" label="返款人" width="120"></el-table-column>
				<el-table-column prop="payee" label="收款人" width="120"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="120"></el-table-column>
  			<el-table-column prop="product_price" label="中标价" width="120"></el-table-column>
  			<el-table-column prop="contacts_name" label="联系人" width="120"></el-table-column>
  			<el-table-column prop="product_business" label="商业" width="120"></el-table-column>
  			<el-table-column prop="product_commission" label="佣金" width="120"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="160">
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
				purchase:[],
				contacts:[],
				money:{},//总额统计
				ipc:null,
				pageNum:10,
				deleteId:"",
				currentPage:1,
				count:0,
				params:{
					productCommonName:"",
					contactId:"",
					storageTime:[],
					start:0,
					limit:10
				}
			}
		},
		activated(){
			this.params.start = 0;
			this.getPurchasesList();
		},
		mounted(){
			var that = this;
			if (window.require) {
				//获取药品信息
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('return-purchase-data', (event, arg) => {
				  	that.purchase = arg.data;
						that.money = arg.money;
				  	that.count = arg.count;
				});
				this.getPurchasesList();
				this.ipc.on('return-contacts-all-data', (event, arg) => {
				  	that.contacts = arg.data;
				});
				this.ipc.send('get-contacts-list-all');
			}
		},
		methods:{
			formatterDate(row, column, cellValue){
				return cellValue.substring(0,10);
			},
			editRow(scope){//编辑药品信息
				sessionStorage["purchase_edit"] = JSON.stringify(this.purchase[scope.$index]);
				this.$router.push("/main/purchaseedit");
			},
			deleteRow(scope){//删除
				this.deleteId = scope.row.purchase_id;
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
				this.ipc.send('delete-purchase',this.deleteId);
				this.ipc.on('delete-purchase-return', (event, arg) => {
			  	this.$message({
	          	message: '删除成功',
	          	type: 'success'
	        });
	        this.getPurchasesList();
				});
			},
			//跳转到编辑页面
			add(){
				this.$router.push("/main/purchasedrugs");
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.params.start = 0;
				this.getPurchasesList();
			},
			reSearch(){
				this.$refs["params"].resetFields();
				this.getPurchasesList();
			},
			getPurchasesList(){
				this.ipc.send('get-purchases-list',this.params);
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
    		this.params.limit = this.pageNum;
        this.getPurchasesList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
    		this.params.start = (val-1)*this.pageNum;
    		this.params.limit = this.pageNum;
				this.getPurchasesList();
    	}
		}
	});
</script>
<style scoped="scoped">
	.sum_money > a{
		padding-left: 20px;
	}
	.sum_money .more_detail{
		position: absolute;
		right: 10px;
		height: 30px;
		line-height: 30px;
		color: #409EFF;
		text-decoration: none;
	}
	.sum_money{
		position: relative;
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		line-height: 30px;
		color: #f24040;
		font-size: 14px;
	}
	.el-date-editor--daterange{
		width: 310px !important;
	}
</style>
