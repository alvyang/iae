<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:178px;" @keyup.13.native="reSearch(false)" size="small" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:178px;" @keyup.13.native="reSearch(false)" size="small" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="联系人" prop="contactId">
				<el-select v-model="params.contactId" style="width:178px;" size="small" filterable placeholder="请选择联系人">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts" :key="item.contacts_id" :label="item.contacts_name" :value="item.contacts_id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="商业" prop="business">
				<el-select v-model="params.business" style="width:178px;" size="small" filterable placeholder="请选择商业">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in business" :key="item.product_business" :label="item.product_business" :value="item.product_business"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="品种类型" prop="product_type">
				<el-select v-model="params.product_type" style="width:178px;" size="small" multiple placeholder="请选择">
					<el-option key="普药" label="普药" value="普药"></el-option>
					<el-option key="佣金" label="佣金" value="佣金"></el-option>
					<el-option key="高打" label="高打" value="高打"></el-option>
					<el-option key="高打(底价)" label="高打(底价)" value="高打(底价)"></el-option>
					<el-option key="其它" label="其它" value="其它"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="医保类型" prop="product_medical_type">
				<el-select v-model="params.product_medical_type" style="width:178px;" size="small" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="甲类" label="甲类" value="甲类"></el-option>
					<el-option key="乙类" label="乙类" value="乙类"></el-option>
					<el-option key="丙类" label="丙类" value="丙类"></el-option>
					<el-option key="省医保" label="省医保" value="省医保"></el-option>
				</el-select>
			</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('65') > -1" @click="reSearch(false)" size="small">查询</el-button>
			  <el-button type="primary" v-dbClick v-show="authCode.indexOf('65') > -1" @click="reSearch(true)" size="small">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('62') > -1" @click="add" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="150"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="120"></el-table-column>
  			<el-table-column prop="product_makesmakers" label="生产产家" width="180"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="120"></el-table-column>
  			<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
				<el-table-column prop="product_business" label="商业" width="80"></el-table-column>
				<el-table-column prop="buyer" label="采购员" width="80"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
				<el-table-column prop="product_discount" label="扣率" width="80" :formatter="formatPercent"></el-table-column>
				<el-table-column prop="product_mack_price" label="打款价" width="80"></el-table-column>
				<el-table-column prop="gross_interest_rate" label="毛利率" width="80" :formatter="formatPercent"></el-table-column>
				<el-table-column prop="accounting_cost" label="核算成本" width="80"></el-table-column>
				<el-table-column prop="product_type" label="返费类型" width="100"></el-table-column>
				<el-table-column prop="product_return_money" label="返费金额" width="80" :formatter="formatNull"></el-table-column>
				<el-table-column prop="product_return_discount" label="返费率" width="80" :formatter="formatPercent"></el-table-column>
				<el-table-column prop="product_return_explain" label="返费说明" width="200" :formatter="formatNull"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="80"></el-table-column>
				<el-table-column prop="product_medical_type" label="医保类型" width="80"></el-table-column>
				<el-table-column prop="remark" label="备注" width="200"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="200">
			    <template slot-scope="scope">
				    <el-button v-dbClick v-show="authCode.indexOf('64') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="small"></el-button>
		        <el-button v-dbClick v-show="authCode.indexOf('63') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
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
					product_type:"",
					product_medical_type:"",
					product_code:"",
					business:""
				}
			}
		},
		activated(){
			this.getDrugsList();
			this.getContacts();
			this.getProductBusiness();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
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
				this.jquery('/iae/contacts/getAllContacts',{group_id:0},function(res){
					_self.contacts = res.message;
				});
			},
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/drugs/getProductBusiness",null,function(res){//查询商业
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
