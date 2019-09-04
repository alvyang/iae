<template>
	<div style="box-sizing: border-box;padding: 0px 10px;" class="allot_list">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>销售管理</el-breadcrumb-item>
			<el-breadcrumb-item>商业调拨</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="调拨时间" prop="allocation_time">
				<el-date-picker v-model="params.allocation_time" type="daterange" size="mini" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" size="mini" @keyup.13.native="reSearch(false)" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="调拨前商业" prop="businessFront">
 			 <el-select v-model="params.businessFront" style="width:210px;" size="mini" filterable placeholder="请选择调拨前商业">
 				 <el-option key="" label="全部" value=""></el-option>
 				 <el-option v-for="item in business"
 					 :key="item.business_id"
 					 :label="item.business_name"
 					 :value="item.business_id"></el-option>
 			 </el-select>
 		 </el-form-item>
		 <el-form-item label="调拨后商业" prop="businessAfter">
			<el-select v-model="params.businessAfter" style="width:210px;" size="mini" filterable placeholder="请选择调拨后商业">
				<el-option key="" label="全部" value=""></el-option>
				<el-option v-for="item in business"
					:key="item.business_id"
					:label="item.business_name"
					:value="item.business_id"></el-option>
			</el-select>
		</el-form-item>
		 <el-form-item>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',175,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',175,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',172,') > -1" @click="add" size="mini">新增</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',176,') > -1" @click="exportAllocation" size="mini">导出</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',177,') > -1" @click="importShow" size="mini">导入</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',177,') > -1" @click="downloadTemplate" size="mini">导入模板下载</el-button>
		 </el-form-item>
	 </el-form>
		<el-table :data="allocation" style="width: 100%" size="mini" :height="tableHeight" :stripe="true" :border="true">
			<el-table-column fixed prop="allocation_time" label="调拨时间" width="80" :formatter="formatterDate"></el-table-column>
			<el-table-column prop="product_common_name" label="产品通用名" width="120"></el-table-column>
			<el-table-column prop="product_specifications" label="产品规格" width="80"></el-table-column>
			<el-table-column prop="product_makesmakers" label="生产厂家" width="120"></el-table-column>
			<el-table-column prop="allocation_front_business_name" label="调拨前商业名称" ></el-table-column>
			<el-table-column prop="allocation_front_product_code" label="调拨前产品编码"></el-table-column>
			<el-table-column prop="allocation_after_business_name" label="调拨后商业名称" ></el-table-column>
			<el-table-column prop="allocation_after_product_code" label="调拨后产品编码"></el-table-column>
			<el-table-column prop="allocation_batch_number" label="批号"></el-table-column>
			<el-table-column prop="allocation_number" label="调拨数量"></el-table-column>
			<el-table-column prop="allocation_remark" label="备注"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
				<template slot-scope="scope">
					<el-button v-show="authCode.indexOf(',174,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
					<el-button v-show="authCode.indexOf(',173,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog title="新增调拨记录" width="800px" :visible.sync="dialogFormVisible">
			<div style="width:600px;margin: 0 auto;">
				<el-steps :active="active" :align-center="true" >
				  <el-step title="步骤 1" description="选择调拨前药品"></el-step>
				  <el-step title="步骤 2" description="选择调拨后药品"></el-step>
				  <el-step title="步骤 3" description="填写调拨数量"></el-step>
				</el-steps>
			</div>
			<div v-show="active == 1"  class="step_class">
				<el-form :inline="true" :model="paramsFront" ref="paramsFront" size="mini"  class="demo-form-inline search">
					<el-form-item label="产品名称" prop="productCommonName">
						<el-input v-model="paramsFront.productCommonName" style="width:150px;" size="mini" placeholder="产品名称/助记码"></el-input>
					</el-form-item>
					<el-form-item label="产品编号" prop="product_code">
						<el-input v-model="paramsFront.product_code" style="width:150px;" size="mini" placeholder="产品编号"></el-input>
					</el-form-item>
					<el-form-item label="商业" prop="business">
					 <el-select v-model="paramsFront.business" style="width:150px;" size="mini" filterable placeholder="请选择商业">
						 <el-option key="" label="全部" value=""></el-option>
						 <el-option v-for="item in business"
							 :key="item.business_id"
							 :label="item.business_name"
							 :value="item.business_id"></el-option>
					 </el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" v-dbClick @click="getDrugsFrontList()" size="mini">查询</el-button>
					</el-form-item>
				</el-form>
				<el-table :data="drugsFront" style="width: 100%" size="mini" :stripe="true" :border="true"
					highlight-current-row
					@current-change="handleCurrentChangeRow"
					>
					<el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
					<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
					<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
					<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
					<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
					<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
					<el-table-column prop="business_name" label="商业"></el-table-column>
					<el-table-column prop="batch_number" label="批号"></el-table-column>
					<el-table-column prop="batch_stock_number" label="库存"></el-table-column>
				</el-table>
				<div class="page_div">
					<el-pagination
						background
						@size-change="handleSizeChangeFront"
						@current-change="handleCurrentChangeFront"
						:current-page="currentPageFront"
						:page-sizes="[5, 10, 50, 100]"
						:page-size="pageNumFront"
						layout="total, sizes, prev, pager, next, jumper"
						:total="countFront">
					</el-pagination>
				</div>
			</div>
			<div v-show="active == 2" class="step_class">
				<el-form :inline="true" :model="params" ref="params" size="mini"  class="demo-form-inline search">
					<el-form-item label="产品编号" prop="product_code">
						<el-input v-model="paramsAfter.product_code" style="width:150px;" size="mini" placeholder="产品编号"></el-input>
					</el-form-item>
					<el-form-item label="商业" prop="business">
					 <el-select v-model="paramsAfter.business" style="width:150px;" size="mini" filterable placeholder="请选择商业">
						 <el-option key="" label="全部" value=""></el-option>
						 <el-option v-for="item in business"
							 :key="item.business_id"
							 :label="item.business_name"
							 :value="item.business_id"></el-option>
					 </el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" v-dbClick @click="getDrugsAfterList()" size="mini">查询</el-button>
					</el-form-item>
				</el-form>
				<el-table :data="drugsAfter" style="width: 100%" size="mini" :stripe="true" :border="true"
					highlight-current-row
					@current-change="handleCurrentChangeAfterRow"
					>
					<el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
					<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
					<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
					<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
					<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
					<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
					<el-table-column prop="business_name" label="商业"></el-table-column>
				</el-table>
				<div class="page_div">
					<el-pagination
						background
						@size-change="handleSizeChangeAfter"
						@current-change="handleCurrentChangeAfter"
						:current-page="currentPageAfter"
						:page-sizes="[5, 10, 50, 100]"
						:page-size="pageNumAfter"
						layout="total, sizes, prev, pager, next, jumper"
						:total="countAfter">
					</el-pagination>
				</div>
			</div>
			<div  v-show="active == 3"  class="step_class">
				<el-form :model="allocationData" ref="allocationData" status-icon :rules="allocationDataRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
					<el-form-item label="调拨时间" prop="allocation_time">
						<el-date-picker v-model="allocationData.allocation_time" style="width:210px;" type="date" placeholder="请选择调拨时间"></el-date-picker>
					</el-form-item>
					<el-form-item label="调拨数量" prop="allocation_number">
						<el-input v-model="allocationData.allocation_number" style="width:210px;" :maxlength="10" placeholder="请输入调拨数量"></el-input>
					</el-form-item>
					<el-form-item label="备注" prop="allocation_remark">
						<el-input v-model="allocationData.allocation_remark" style="width:210px;" placeholder="请输入备注"></el-input>
					</el-form-item>
				</el-form>
			</div>
			<div style="text-align:right;padding-bottom:20px;">
				<el-button style="margin-top: 12px;" v-show="active > 1" @click="previous">上一步</el-button>
				<el-button style="margin-top: 12px;" v-show="active < 3" @click="next">下一步</el-button>
				<el-button style="margin-top: 12px;" v-show="active == 3" @click="save('allocationData')">保存</el-button>
			</div>
		</el-dialog>

		<el-dialog title="修改调拨记录" width="700px" :visible.sync="dialogFormVisibleEdit">
			<el-form :model="editAllocationData" ref="editAllocationData" status-icon :rules="allocationDataRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="调拨时间" prop="allocation_time">
					<el-date-picker v-model="editAllocationData.allocation_time" style="width:179px;" type="date" placeholder="请选择调拨时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="调拨数量" prop="allocation_number">
					<el-input v-model="editAllocationData.allocation_number" style="width:179px;" :maxlength="10" placeholder="请输入调拨数量"></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="allocation_remark">
					<el-input v-model="editAllocationData.allocation_remark" style="width:179px;" placeholder="请输入备注"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="editallots('editAllocationData')">确 定</el-button>
      </div>
		</el-dialog>
		<el-dialog title="导入调拨记录" width="600px" class="import_record" :visible.sync="dialogFormVisibleImport">
			<el-upload
			  class="upload-demo"
				ref="upload"
			  :action="importAllocationUrl"
			  :before-upload="beforeUpload"
				:on-success="importAllotsSuccess"
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
				var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
				if (value === '') {
					callback(new Error('请输入调拨数量'));
				} else if(!regu.test(value)){
					callback(new Error('请输入整数'));
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
				params:{
					allocation_time:[],
					businessFront:"",
					businessAfter:"",
					productCommonName:""
				},
				paramsFront:{
					productCommonName:"",
					product_code:"",
					business:"",
					product_type:['高打'],
				},
				paramsAfter:{
					productCommonName:"",
					product_code:"",
					business:"",
					product_makesmakers:"",
					product_specifications:"",
					product_type:['高打'],
				},
				loading:false,
				pageNum:20,
				currentPage:1,
				count:0,
				pageNumFront:5,
				currentPageFront:1,
				countFront:0,
				pageNumAfter:5,
				currentPageAfter:1,
				countAfter:0,
				dialogFormVisible:false,
				dialogFormVisibleEdit:false,
				authCode:"",
				allocation:[],
				active: 1,
				business:[],
				drugsFront:[],
				drugsAfter:[],
				currentRowFront:null,
				currentRowAfter:null,
				allocationData:{
					allocation_front_drug_id:"",
					allocation_front_business_id:"",
					allocation_front_product_code:"",
					allocation_front_business_name:"",
					allocation_after_drug_id:"",
					allocation_after_business_id:"",
					allocation_after_product_code:"",
					allocation_after_business_name:"",
					allocation_number:"",
					allocation_remark:"",
					allocation_time:nowDate,
					allocation_purchase_id:""
				},
				editAllocationData:{

				},
				allocationDataRule:{
					allocation_time:[{ required: true, message: '请选择调拨时间', trigger: 'change' }],
					allocation_number:[{validator:validateNum,trigger: 'blur' }]
				},
				dialogFormVisibleImport:false,
				errorMessage:"",
				importAllocationUrl:"",
				uploadButtom:"导入调拨记录",
			}
		},
		updated(){
			this.tableHeight = $(window).height() - 170 - $(".search").height();
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 170 - $(".search").height();
			});
    },
		activated(){
			this.getAllocationList();
			this.getProductBusiness();
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
			this.importAllocationUrl = this.$bus.data.host + "/iae/allocation/importAllocation";
		},
		methods:{
			importShow(){
				this.dialogFormVisibleImport = true;
				this.errorMessage="";
				if(this.$refs.upload){
					this.$refs.upload.clearFiles();
				}
			},
			beforeUpload(file){
				this.errorMessage="";
				this.uploadButtom="上传成功，正在导入...";
				this.loadingImport = true;
			},
			importAllotsSuccess(response, file, fileList){
				this.uploadButtom="导入调拨记录";
				this.loadingImport = false;
				var downloadErrorMessage = "<a style='color:red;' href='"+this.$bus.data.host+"/iae/allocation/downloadErrorAllocation'>下载错误数据</a>";
				this.errorMessage = response.message+downloadErrorMessage;
			},
			downloadTemplate(){
				window.location.href=this.$bus.data.host+"/download/template_allocation.xlsx";
			},
			exportAllocation(){
				var url = this.$bus.data.host + "/iae/allocation/exportAllocation";
				this.download(url,this.params);
			},
			editallots(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							_self.loading=true;
							_self.jquery('/iae/allocation/editAllocation',_self.editAllocationData,function(res){
								_self.dialogFormVisibleEdit = false;
								_self.loading=false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getAllocationList();
							});
						} else {
							return false;
						}
				});
			},
			editRow(scope){//编辑药品信息
				this.dialogFormVisibleEdit = true;
				var temp = JSON.stringify(scope.row);
				this.editAllocationData = JSON.parse(temp);
				this.editAllocationData.front_allocation_message = temp;
				this.editAllocationData.allocation_number_temp = this.editAllocationData.allocation_number;
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
				this.jquery('/iae/allocation/deleteAllocation',{
					allocation_id:scope.row.allocation_id,
					allocation_number:-scope.row.allocation_number,
					allocation_front_drug_id:scope.row.allocation_front_drug_id,
					allocation_after_drug_id:scope.row.allocation_after_drug_id,
					allocation_purchase_id:scope.row.allocation_purchase_id
				},function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getAllocationList();
					_self.dialogFormVisible = false;
				});
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getAllocationList();
			},
			getAllocationList(){
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
				this.jquery('/iae/allocation/getAllocationList',{
					data:_self.params,
					page:page
				},function(res){
						_self.allocation = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
				});
			},
			save(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							_self.loading = true;
							this.jquery('/iae/allocation/saveAllocation',_self.allocationData,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getAllocationList();
              });
						} else {
							return false;
						}
				});
			},
			previous(){
				if (this.active-- < 2) this.active = 1;
			},
			next() {
				if(this.active == "1" && !this.currentRowFront){
					this.$message({message: '请先选择调拨前药品',type: 'warning'});
					return;
				}else if(this.active == "1"){
					this.allocationData.allocation_purchase_id = this.currentRowFront.batch_stock_purchase_id;
					this.allocationData.allocation_front_drug_id = this.currentRowFront.product_id;
					this.allocationData.allocation_front_business_id= this.currentRowFront.product_business;
					this.allocationData.allocation_front_product_code= this.currentRowFront.product_code;
					this.allocationData.allocation_front_business_name= this.currentRowFront.business_name;
					this.allocationData.allocation_batch_number= this.currentRowFront.batch_number;
					this.paramsAfter.productCommonName = this.currentRowFront.product_common_name;
					this.paramsAfter.product_makesmakers = this.currentRowFront.product_makesmakers;
					this.paramsAfter.product_specifications = this.currentRowFront.product_specifications;
					this.currentRowAfter = null;
					this.getDrugsAfterList();
				}
				if(this.active == "2" && !this.currentRowAfter){
					this.$message({message: '请先选择调拨后药品',type: 'warning'});
					return;
				}else if(this.active == "2" && this.currentRowFront.product_id == this.currentRowAfter.product_id){
					this.$message({message: '编码相同不可调货',type: 'warning'});
					return;
				}else if(this.active == "2"){
					this.allocationData.allocation_after_drug_id = this.currentRowAfter.product_id;
					this.allocationData.allocation_after_business_id= this.currentRowAfter.product_business;
					this.allocationData.allocation_after_product_code= this.currentRowAfter.product_code;
					this.allocationData.allocation_after_business_name= this.currentRowAfter.business_name;
					this.allocationData.allocation_remark = "";
					this.allocationData.allocation_time = new Date();
					this.allocationData.allocation_number = "";
				}
        if (this.active++ > 2) this.active = 2;
      },
			getDrugsAfterList(){
				var _self = this;
				if(!_self.currentPageAfter){
					_self.currentPageAfter = 1;
				}
				if(!_self.pageNumAfter){
					_self.pageNumAfter = 10;
				}
				var page = {
					start:(_self.currentPageAfter-1)*_self.pageNumAfter,
					limit:_self.pageNumAfter
				}
				this.jquery('/iae/drugs/getDrugs',{
					data:_self.paramsAfter,
					page:page
				},function(res){
						_self.drugsAfter = res.message.data;
						_self.pageNumAfter=parseInt(res.message.limit);
						_self.countAfter=res.message.totalCount;
				});
			},
			getDrugsFrontList(){
				var _self = this;
				if(!_self.currentPageFront){
					_self.currentPageFront = 1;
				}
				if(!_self.pageNumFront){
					_self.pageNumFront = 10;
				}
				var page = {
					start:(_self.currentPageFront-1)*_self.pageNumFront,
					limit:_self.pageNumFront
				}
				this.jquery('/iae/allocation/getAllocationDrugs',{
					data:_self.paramsFront,
					page:page
				},function(res){
						_self.drugsFront = res.message.data;
						_self.pageNumFront=parseInt(res.message.limit);
						_self.countFront=res.message.totalCount;
				});
			},
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
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
			add(){
				this.active = 1;
				this.currentRowFront=null;
				this.currentRowAfter=null;
				this.getDrugsFrontList();
				this.dialogFormVisible = true;
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getAllocationList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getAllocationList();
    	},
			handleSizeChangeFront(val) {
        this.pageNumFront = val;
    		this.currentPageFront = 1;
        this.getDrugsFrontList();
    	},
    	handleCurrentChangeFront(val) {
    		this.currentPageFront = val;
				this.getDrugsFrontList();
    	},
			handleSizeChangeAfter(val) {
        this.pageNumAfter = val;
    		this.currentPageAfter = 1;
        this.getDrugsAfterList();
    	},
    	handleCurrentChangeAfter(val) {
    		this.currentPageAfter = val;
				this.getDrugsAfterList();
    	},
			handleCurrentChangeRow(val) {
        this.currentRowFront = val;
      },
			handleCurrentChangeAfterRow(val) {
        this.currentRowAfter = val;
      }
		}
	});
</script>
<style scope="scope">
	.search .el-form-item__label{
		padding-left: 0 !important;
	}
	.el-table tr.current-row > td{
		 color: #f24040 !important;
  }
	.el-step__title{
		font-size: 14px !important;
		line-height: 24px;
	}
	.el-step__description{
		font-size: 12px !important;
		line-height: 24px;
	}
	.step_class{
		width:760px;
		margin-left: -10px;
    padding: 10px;
    background: #f4f4f4;
		margin-top: 20px;
	}
</style>
