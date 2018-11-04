<template>
	<div class="drug_list">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>药品管理</el-breadcrumb-item>
			<el-breadcrumb-item>药品管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini"  class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="　联系人" prop="contactId">
				<el-select v-model="params.contactId" style="width:210px;" size="mini" filterable placeholder="请选择联系人">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts" :key="item.contacts_id" :label="item.contacts_name" :value="item.contacts_id"></el-option>
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
			<el-form-item label="品种类型" prop="product_type">
				<el-select v-model="params.product_type" style="width:210px;" size="mini" multiple placeholder="请选择">
					<el-option key="佣金" label="佣金" value="佣金"></el-option>
					<el-option key="高打" label="高打" value="高打"></el-option>
					<el-option key="其它" label="其它" value="其它"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="　　标签" prop="tag">
				<el-select v-model="params.tag" style="width:210px;" size="mini" placeholder="请选择">
					<el-option v-for="t in tags" :key="t.tag_id" :label="t.tag_name" :value="t.tag_id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="医保类型" prop="product_medical_type">
				<el-select v-model="params.product_medical_type" style="width:210px;" size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="甲类" label="甲类" value="甲类"></el-option>
					<el-option key="乙类" label="乙类" value="乙类"></el-option>
					<el-option key="丙类" label="丙类" value="丙类"></el-option>
					<el-option key="省医保" label="省医保" value="省医保"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="真实毛利率" prop="rate_gap">
				<el-select v-model="params.rate_formula" style="width:85px;" size="mini" placeholder="请选择">
					<el-option key="<" label="<" value="<"></el-option>
					<el-option key="<=" label="≤" value="<="></el-option>
					<el-option key=">" label=">" value=">"></el-option>
					<el-option key=">=" label="≥" value=">="></el-option>
				</el-select>
			 	<el-input-number v-model="params.rate_gap" style="width:106px;" :precision="0" :step="1" :max="100"></el-input-number>
		 	</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('65') > -1" @click="reSearch(false)" size="mini">查询</el-button>
			  <el-button type="primary" v-dbClick v-show="authCode.indexOf('65') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('62') > -1" @click="add" size="mini">新增</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('0f32a940-d803-11e8-a19c-cf0f6be47d2e') > -1" @click="exportDrugs" size="mini">导出</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('100') > -1" @click="importShow" size="mini">导入</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('100') > -1" @click="downloadTemplate" size="mini">导入模板下载</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="100"></el-table-column>
  			<el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
  			<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="buyer" label="采购员" width="60"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="product_discount" label="扣率" width="70" :formatter="formatPercent"></el-table-column>
				<el-table-column prop="product_mack_price" label="打款价" width="60"></el-table-column>
				<el-table-column prop="gross_interest_rate" label="毛利率" width="70" :formatter="formatPercent"></el-table-column>
				<el-table-column prop="accounting_cost" label="核算成本" width="70"></el-table-column>
				<el-table-column prop="product_type" label="品种类型" width="70"></el-table-column>
				<el-table-column prop="product_return_money" label="返费金额" width="70" :formatter="formatNull"></el-table-column>
				<el-table-column prop="product_return_discount" label="返费率" width="70" :formatter="formatPercent"></el-table-column>
				<el-table-column prop="product_return_explain" label="返费说明" width="200" :formatter="formatNull"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
				<el-table-column prop="product_medical_type" label="医保类型" width="70"></el-table-column>
				<el-table-column prop="product_purchase_mode" label="采购方式" width="70"></el-table-column>
				<el-table-column prop="product_basic_medicine" label="是否基药" width="70"></el-table-column>
				<el-table-column prop="tag_names" label="标签" width="100"></el-table-column>
				<el-table-column prop="remark" label="备注" width="200"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
			    <template slot-scope="scope">
				    <el-button v-dbClick v-show="authCode.indexOf('64') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
		        <el-button v-dbClick v-show="authCode.indexOf('63') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog title="导入药品" width="600px" :visible.sync="dialogFormVisible">
			<el-upload
			  class="upload-demo"
				ref="upload"
			  :action="importDrugsUrl"
			  :before-upload="beforeUpload"
				:on-success="importDrugsSuccess"
			  :file-list="fileList">
			  <el-button size="small" type="primary" v-dbClick :loading="loading">{{uploadButtom}}</el-button>
			  <div slot="tip" class="el-upload__tip" style="display:inline-block">　只能上传xls/xlsx文件</div>
			</el-upload>
			<div v-show="errorMessage" style="margin-top: 15px;" v-html="errorMessage"></div>
		</el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				drugs:[],
				contacts:[],
				business:[],
				tags:[],//标签
				pageNum:10,
				currentPage:1,
				count:0,
				authCode:"",
				dialogFormVisible:false,
				params:{
					productCommonName:"",
					contactId:"",
					product_type:"",
					product_medical_type:"",
					product_code:"",
					business:"",
					tag:"",
					rate_gap:0,
					rate_formula:"<="
				},
				fileList:[],//上传文件列表
				importDrugsUrl:"",
				loading:false,
				uploadButtom:"导入药品",
				errorMessage:"",
			}
		},
		activated(){
			this.getDrugsList();
			this.getContacts();
			this.getProductBusiness();
			this.getTags();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
			this.importDrugsUrl = this.$bus.data.host + "/iae/drugs/importDrugs";
		},
		methods:{
			downloadTemplate(){
				window.location.href=this.$bus.data.host+"/download/template_drugs.xlsx";
			},
			importShow(){
				this.dialogFormVisible = true;
				this.errorMessage="";
				this.$refs.upload.clearFiles();
			},
			beforeUpload(file){
				this.errorMessage="";
				this.uploadButtom="上传成功，正在导入...";
				this.loading = true;
			},
			importDrugsSuccess(response, file, fileList){
				this.uploadButtom="导入药品";
				this.loading = false;
				var downloadErrorMessage = "<a style='color:red;' href='"+this.$bus.data.host+"/iae/drugs/downloadErrorData'>下载错误数据</a>";
				this.errorMessage = response.message+downloadErrorMessage;
			},
			getTags(){
				var _self = this;
				this.jquery("/iae/tag/getAllTags",null,function(res){//查询商业
					_self.tags=res.message.tagAll;
				});
			},
			formatPercent(row, column, cellValue, index){
				if(cellValue){
					return cellValue+" %";
				}else{
					return "-";
				}
			},
			formatNull(row, column, cellValue, index){
				if(row.product_type == "基药" || row.product_type == "其它"){
					return "-";
				}else{
					return cellValue;
				}
			},
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['佣金品种','高打品种']},function(res){
					_self.contacts = res.message;
				});
			},
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
			formatterPer(row, column, cellValue){
				var per = row.product_commission/row.product_price*100;
				return per.toFixed(2)+"%";
			},
			editRow(scope){//编辑药品信息
				sessionStorage["drugs_edit"] = JSON.stringify(this.drugs[scope.$index]);
				sessionStorage["contacts"] = JSON.stringify(this.contacts);
				sessionStorage["business"] = JSON.stringify(this.business);
				this.$router.push({path:`/main/drugsedit`});
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
        this.jquery('/iae/drugs/deleteDrugs',{
          product_id:scope.row.product_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.getDrugsList();
          _self.dialogFormVisible = false;
        });
			},
			//跳转到编辑页面
			add(){
				sessionStorage["contacts"] = JSON.stringify(this.contacts);
				sessionStorage["business"] = JSON.stringify(this.business);
				this.$router.push({path:`/main/drugsedit`});
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.getDrugsList();
			},
			exportDrugs(){
				var url = this.$bus.data.host + "/iae/drugs/exportDrugs";
				this.download(url,this.params);
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
<style >
	.main_content .drug_list .el-dialog__wrapper .el-dialog .el-dialog__body{
		padding-bottom:30px !important;
	}
	.el-table .cell{
		white-space: nowrap;
	}
</style>
