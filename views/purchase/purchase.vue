<template>
	<div style="box-sizing: border-box;padding: 0px 10px;" class="sale_list">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>采购管理</el-breadcrumb-item>
			<el-breadcrumb-item>采进管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="备货时间" prop="time">
				<el-date-picker v-model="params.time" type="daterange" size="mini" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
 		 	</el-form-item>
			<el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" size="mini" @keyup.13.native="reSearch(false)" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="生产厂家" prop="product_makesmakers">
		    <el-input v-model="params.product_makesmakers" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="生产厂家"></el-input>
		  </el-form-item>
		  <el-form-item label="　联系人" prop="contactId">
		    <el-select v-model="params.contactId" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts"
			      :key="item.contacts_id"
			      :label="item.contacts_name"
			      :value="item.contacts_id">
			    </el-option>
				</el-select>
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
		 <el-form-item label="　　批号" prop="batch_number">
			 <el-input v-model="params.batch_number" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="批号"></el-input>
		 </el-form-item>
		 <el-form-item label="备货状态" prop="status">
		 	<el-select v-model="params.status" style="width:210px;" size="mini" placeholder="请选择">
		 		<el-option key="" label="全部" value=""></el-option>
		 		<el-option key="1" label="未打款" value="1"></el-option>
		 		<el-option key="2" label="打款,未发货" value="2"></el-option>
		 		<el-option key="3" label="发货,未入库" value="3"></el-option>
		 		<el-option key="4" label="已入库" value="4"></el-option>
		 	</el-select>
		 </el-form-item>
		 <el-form-item label="　费用票" prop="otherMoneyFlag">
		 	<el-select v-model="params.otherMoneyFlag" style="width:210px;" size="mini" placeholder="请选择">
		 		<el-option key="" label="全部" value=""></el-option>
		 		<el-option key="3" label="已开" value="3"></el-option>
		 		<el-option key="2" label="未开" value="2"></el-option>
		 	</el-select>
		 </el-form-item>
			<el-form-item label="　　备注" prop="remark">
				<el-select v-model="params.remark" filterable size="mini" style="width:210px;" placeholder="请选择">
				 <el-option v-for="item in remarks"
					 :key="item.remark" :label="item.remark" :value="item.remark">
				 </el-option>
			  </el-select>
		 	</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',56,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',56,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',53,') > -1"  @click="add" size="mini">新增</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',57,') > -1"  @click="exportExcel" size="mini">导出</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',143,') > -1" @click="importShow" size="mini">导入</el-button>
 			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',143,') > -1" @click="downloadTemplate" size="mini">导入模板下载</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money_purchase">
			<a>采购总额：</a>{{money}} <span>元</span>
		</div>
		<el-table :data="purchases" style="width: 100%" size="mini" :height="tableHeight" :stripe="true" :border="true">
				<el-table-column fixed prop="time" label="备货时间" width="80" :formatter="formatterDate"></el-table-column>
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="purchase_number" label="购入数量" width="70"></el-table-column>
				<el-table-column prop="purchase_money" label="购入金额" width="70"></el-table-column>
				<el-table-column prop="purchase_other_money" label="补点/费用票" width="80"></el-table-column>
				<el-table-column prop="purchase_mack_price" label="打款价" width="60"></el-table-column>
				<el-table-column prop="purchase_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="puchase_gross_rate" label="毛利率" width="60" :formatter="formatPercent"></el-table-column>
				<el-table-column prop="batch_number" label="批号" width="60"></el-table-column>
				<el-table-column prop="ticket_number" label="税票号" width="60"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="make_money_time" label="打款时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="send_out_time" label="发货时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="storage_time" label="入库时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="remark" label="备注" width="200"></el-table-column>
				<el-table-column fixed="right" prop="remark" label="备货状态" width="80">
					<template slot-scope="scope">
						<el-tag type="success" size="mini" v-show="scope.row.storage_time">已入库</el-tag>
						<el-tag type="info" size="mini" v-show="scope.row.make_money_time && !scope.row.send_out_time">未发货</el-tag>
						<el-tag type="warning" size="mini" v-show="scope.row.send_out_time && !scope.row.storage_time">未入库</el-tag>
						<el-tag type="danger" size="mini" v-show="!scope.row.make_money_time">未打款</el-tag>
					</template>
				</el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
			    <template slot-scope="scope">
				    <el-button v-show="authCode.indexOf(',55,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
		        <el-button v-show="authCode.indexOf(',54,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
			    </template>
  			</el-table-column>
		</el-table>
		<div class="page_div">
			<el-pagination
				background
	      @size-change="handleSizeChange"
	      @current-change="handleCurrentChange"
	      :current-page="currentPage"
	      :page-sizes="[10,20, 50, 100]"
	      :page-size="pageNum"
	      layout="total, sizes, prev, pager, next, jumper"
	      :total="count">
	    </el-pagination>
		</div>
		<el-dialog title="修改备货记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+purchase.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{purchase.product_code}}</div>
			    <div><span>产品规格:</span>{{purchase.product_specifications}}</div>
					<div><span>中标价:</span>{{purchase.purchase_price}}</div>
					<div><span>包装:</span>{{purchase.product_packing}}</div>
					<div><span>单位:</span>{{purchase.product_unit}}</div>
					<div><span>打款价:</span>{{purchase.purchase_mack_price}}</div>
					<div style="display:block;width:100%;"><span>生产厂家:</span>{{purchase.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="purchase" ref="purchase" status-icon :rules="purchaseRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="购入数量" prop="purchase_number" :required="true">
					<el-input v-model="purchase.purchase_number" style="width:179px;" :maxlength="10" placeholder="请输入购入数量"></el-input>
				</el-form-item>
				<el-form-item label="购入金额" prop="purchase_money">
					<el-input v-model="purchase.purchase_money" style="width:179px;"></el-input>
				</el-form-item>
				<el-form-item label="备货时间" prop="time">
					<el-date-picker v-model="purchase.time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="补点/费用票" prop="purchase_other_money">
					<el-input v-model="purchase.purchase_other_money" style="width:179px;" placeholder="补点/费用票"></el-input>
				</el-form-item>
				<el-form-item label="打款时间" prop="make_money_time">
					<el-date-picker v-model="purchase.make_money_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="发货时间" prop="send_out_time">
					<el-date-picker v-model="purchase.send_out_time" style="width:179px;" type="date" placeholder="请选择发货时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="入库时间" prop="storage_time">
					<el-date-picker v-model="purchase.storage_time" style="width:179px;" type="date" :clearable="false" placeholder="请选择入库时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="批号" prop="batch_number">
 				 <el-input v-model="purchase.batch_number" style="width:179px;"></el-input>
 			 	</el-form-item>
				<el-form-item label="税票号" prop="ticket_number">
 					<el-input v-model="purchase.ticket_number" style="width:179px;"></el-input>
 				</el-form-item>
				<el-form-item label="备注" prop="remark">
				<el-autocomplete popper-class="my-autocomplete" style="width:179px;"
					 v-model="purchase.remark"
					 :fetch-suggestions="querySearch"
					 placeholder="备注" @select="handleSelect">
					 <template slot-scope="{ item }">
						 <div class="name">{{ item.remark }}</div>
					 </template>
				</el-autocomplete>
			 </el-form-item>

			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="editPurchases('purchase')">确 定</el-button>
      </div>
    </el-dialog>
		<el-dialog title="导入采进记录" width="600px" class="import_record" :visible.sync="dialogFormVisibleImport">
			<el-upload
			  class="upload-demo"
				ref="upload"
			  :action="importDrugsUrl"
			  :before-upload="beforeUpload"
				:on-success="importDrugsSuccess"
			  :file-list="fileList">
			  <el-button size="small" type="primary" v-dbClick :loading="loadingImport">{{uploadButtom}}</el-button>
			  <div slot="tip" class="el-upload__tip" style="display:inline-block">　只能上传xls/xlsx文件</div>
			</el-upload>
			<div v-show="errorMessage" style="margin-top: 15px;" v-html="errorMessage"></div>
		</el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validateNum = (rule, value, callback) => {
				var regu = /^\+?[1-9][0-9]*$/;
				if (value === '') {
					callback(new Error('请输入购入数量'));
				} else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
					this.purchase.purchase_money = this.purchase.purchase_money?this.purchase.purchase_money:this.purchase.purchase_number * this.purchase.purchase_mack_price;
					this.purchase.purchase_money = Math.round(this.purchase.purchase_money*100)/100;
					callback();
				}
			};
			var validateBatchNumber = (rule, value, callback) => {
				var regu = /^\+?[1-9][0-9]*$/;
				if (this.purchase.storage_time && this.isEmpty(value)) {
					callback(new Error('请输入批号'));
				} else {
					callback();
				}
			};
			const nowDate = new Date();
			const beforeDate = new Date();
			beforeDate.setFullYear(nowDate.getFullYear()-1);
			return {
				pickerOptions2: {
					shortcuts: [{
						text: '本月',
						onClick(picker) {
							const end = new Date();
							const start = new Date(end.getFullYear()+"-"+(end.getMonth()+1)+"-01");
							picker.$emit('pick', [start, end]);
						}
					},{
						text: nowDate.getFullYear()+'年',
						onClick(picker) {
							const end = new Date();
							const start = new Date(end.getFullYear()+"-01"+"-01");
							picker.$emit('pick', [start, end]);
						}
					},{
						text: beforeDate.getFullYear()+'年',
						onClick(picker) {
							const start = new Date(beforeDate.getFullYear()+"-01"+"-01");
							const end = new Date(beforeDate.getFullYear()+"-12"+"-31");
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				purchases:[],
				purchase:{},
				contacts:[],
				money:0,//总额统计
				pageNum:20,
				currentPage:1,
				count:0,
				remarks:[],
				dialogFormVisible:false,
				loading:false,
				params:{
					otherMoneyFlag:"",
					product_makesmakers:"",
					productCommonName:"",
					contactId:"",
					time:[],
					product_code:"",
					status:"",
					remark:"",
					business:"",
					batch_number:""
				},
				purchaseRule:{
					purchase_number:[{validator:validateNum,trigger: 'blur' }],
					batch_number:[{validator:validateBatchNumber,trigger: 'blur' }],
					time:[{ required: true, message: '请选择备货时间', trigger: 'blur,change' }]
				},
				authCode:"",
				business:[],
				errorMessage:"",
				importPurchasesUrl:"",
				loadingImport:false,
				uploadButtom:"导入采进记录",
				dialogFormVisibleImport:false,
				tableHeight:0,
			}
		},
		updated(){
			this.tableHeight = $(window).height() - 200 - $(".search").height();
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 200 - $(".search").height();
			});
    },
		activated(){
			this.getContacts();
			this.getPurchaseRemarks();
			this.getPurchasesList();
			this.getProductBusiness();
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
			this.importDrugsUrl = this.$bus.data.host + "/iae/purchase/importPurchases";
		},
		methods:{
			beforeUpload(file){
				this.errorMessage="";
				this.uploadButtom="上传成功，正在导入...";
				this.loadingImport = true;
			},
			importDrugsSuccess(response, file, fileList){
				this.uploadButtom="导入采进记录";
				this.loadingImport = false;
				var downloadErrorMessage = "<a style='color:red;' href='"+this.$bus.data.host+"/iae/purchase/downloadErrorPurchases'>下载错误数据</a>";
				this.errorMessage = response.message+downloadErrorMessage;
			},
			importShow(){
				this.dialogFormVisibleImport = true;
				this.errorMessage="";
				if(this.$refs.upload){
					this.$refs.upload.clearFiles();
				}
			},
			downloadTemplate(){
				window.location.href=this.$bus.data.host+"/download/template_purchases.xlsx";
			},
			formatPercent(row, column, cellValue, index){
				if(!this.isEmpty(cellValue)){
					return cellValue+" %";
				}else{
					return "-";
				}
			},
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
					sessionStorage["productbusiness"] = JSON.stringify(_self.business);
				});
			},
			exportExcel(){
				var url = this.$bus.data.host + "/iae/purchase/exportPurchases";
				this.download(url,this.params);
			},
			handleSelect(item) {
				this.purchase.remark = item.remark;
      },
			querySearch(queryString, cb) {
        var remarks = this.remarks;
        var results = queryString ? remarks.filter(this.createFilter(queryString)) : remarks;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
			createFilter(queryString) {
				var _self = this;
        return (remarks) => {
					if(!_self.isEmpty(remarks.remark)){
						return (remarks.remark.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
					}else{
						return ;
					}

        };
      },
			editPurchases(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/purchase/editPurchase',_self.purchase,function(res){
								_self.dialogFormVisible = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getPurchasesList();
							});
						} else {
							return false;
						}
				});
			},
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种']},function(res){
					_self.contacts = res.message;
				});
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
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				var temp = JSON.stringify(scope.row);
				this.purchase = JSON.parse(temp);
				this.purchase.front_purchase = temp;
				this.purchase.purchase_number_temp = this.purchase.purchase_number;
				this.purchase.storage_time_temp = this.purchase.storage_time;
			},
			deleteRow(scope){//删除
				this.$confirm('是否删除?', '提示', {
          	confirmButtonText: '确定',
          	cancelButtonText: '取消',
          	type: 'warning'
        }).then(() => {
						this.deleteItem(scope);
        }).catch(() => {
        });
			},
			deleteItem(scope){
				var _self = this;
				this.jquery('/iae/purchase/deletePurchases',{
					purchase_id:scope.row.purchase_id,
					delete_flag:"",
					storage_time:scope.row.storage_time,
					product_id:scope.row.product_id,
					stock:scope.row.stock,
					purchase_number:scope.row.purchase_number
				},function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getPurchasesList();
					_self.dialogFormVisible = false;
				});
			},
			//跳转到编辑页面
			add(){
				sessionStorage["remarks"] = JSON.stringify(this.remarks);
				this.$router.push("/main/purchasedrugs");
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getPurchasesList();
			},
			getPurchaseRemarks(){
				var _self = this;
				this.jquery('/iae/purchase/getPurchaseRemarks',null,function(res){
						_self.remarks = res.message;
				});
			},
			getPurchasesList(){
				var _self = this;
				if(!_self.currentPage){
					_self.currentPage = 1;
				}
				if(!_self.pageNum){
					_self.pageNum = 20;
				}
				var page = {
					start:(_self.currentPage-1)*_self.pageNum,
					limit:_self.pageNum
				}
				this.jquery('/iae/purchase/getPurchases',{
					data:_self.params,
					page:page
				},function(res){
						_self.purchases = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
						_self.money = (res.message.purchaseMoney+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				});
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getPurchasesList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getPurchasesList();
    	}
		}
	});
</script>
<style>
	.sum_money_purchase > a{
		padding-left: 20px;
		color: #606266;
	}
	.sum_money_purchase > span{
		color:#606266;
	}
	.sum_money_purchase .more_detail{
		position: absolute;
		right: 10px;
		height: 30px;
		line-height: 30px;
		color: #409EFF;
		text-decoration: none;
	}
	.sum_money_purchase{
		position: relative;
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		color:#f24040;
		line-height: 30px;
		font-size: 14px;
	}
</style>
