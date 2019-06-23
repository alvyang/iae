<template>
	<div class="drug_list">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>药品管理</el-breadcrumb-item>
			<el-breadcrumb-item>药品政策管理（下游）</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini"  class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="生产厂家" prop="product_makesmakers">
		    <el-input v-model="params.product_makesmakers" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="生产厂家"></el-input>
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
			<el-form-item label="　　标签" prop="tag_type">
				<el-cascader v-model="params.tag_type" style="width:210px;" size="mini" placeholder="搜索标签" :options="tags" filterable></el-cascader>
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
			<el-form-item label="是否配送" prop="product_distribution_flag">
				<el-select v-model="params.product_distribution_flag" style="width:210px;" size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="0" label="配送" value="0"></el-option>
					<el-option key="1" label="不配送" value="1"></el-option>
				</el-select>
			</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',65,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
			  <el-button type="primary" v-dbClick v-show="authCode.indexOf(',65,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
			<el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
			<el-table-column prop="product_code" label="产品编号" width="100"></el-table-column>
			<el-table-column prop="product_makesmakers" label="生产厂家" width="180"></el-table-column>
			<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
			<el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
			<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
			<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
			<el-table-column prop="business_name" label="商业" width="120"></el-table-column>
			<el-table-column prop="buyer" label="采购员" width="60"></el-table-column>
			<el-table-column prop="product_type" label="品种类型" width="70"></el-table-column>
			<el-table-column prop="contacts_name" label="联系人" ></el-table-column>
			<el-table-column fixed="right" label="操作" width="260">
		    <template slot-scope="scope">
					<el-button v-dbClick @click.native.prevent="toPolicy(scope,'2')" type="primary" size="mini">销售政策</el-button>
					<el-button v-show="scope.row.product_type == '高打'" v-dbClick @click.native.prevent="toPolicy(scope,'1')" type="primary" size="mini">调货政策</el-button>
					<el-button v-show="scope.row.product_type == '高打'" v-dbClick @click.native.prevent="toPolicy(scope,'3')" type="primary" size="mini">招商政策</el-button>
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
					product_makesmakers:"",
					contactId:"",
					product_type:['高打','佣金'],
					product_medical_type:"",
					product_code:"",
					business:"",
					tag:"",
					rate_gap:0,
					rate_formula:"<=",
					product_distribution_flag:"0",
					tag_type:[],
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
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
			this.importDrugsUrl = this.$bus.data.host + "/iae/drugs/importDrugs";
		},
		methods:{
			toPolicy(scope,arg){
				var path = "";
				switch (arg) {
					case "1":
						path = "/main/drugsAllotPolicy";
						break;
					case "2":
						path = "/main/drugsSalesPolicy";
						break;
					case "3":
						path = "/main/drugsPurchasePayPolicy";
						break;
				}
				this.$router.push({path:path,query:{productCode:scope.row.product_code}});
			},
			getTags(){
				var _self = this;
				this.jquery("/iae/tag/getAllTags",null,function(res){//查询商业
					_self.tags=res.message.tagAll;
				});
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
				this.params.tag = this.params.tag_type[1];
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
</style>
