<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品通用名" prop="productCommonName">
		    <el-input v-model="params.productCommonName" @keyup.13.native="reSearch(false)" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
			<el-form-item label="联系人" prop="contactId">
				<el-select v-model="params.contactId" filterable placeholder="请选择联系人">
					<el-option v-for="item in contacts" :key="item.contacts_id" :label="item.contacts_name" :value="item.contacts_id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="医保类型" prop="product_medical_type">
				<el-select v-model="params.product_medical_type" placeholder="请选择">
					<el-option key="甲类" label="甲类" value="甲类"></el-option>
					<el-option key="乙类" label="乙类" value="乙类"></el-option>
					<el-option key="丙类" label="丙类" value="丙类"></el-option>
					<el-option key="省医保" label="省医保" value="省医保"></el-option>
				</el-select>
			</el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="reSearch(false)" size="small">查询</el-button>
			  <el-button type="primary" @click="reSearch(true)" size="small">重置</el-button>
		    <el-button type="primary" v-show="authCode.indexOf('59') > -1" @click="add" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="150"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="150"></el-table-column>
  			<el-table-column prop="product_makesmakers" :title="product_makesmakers" label="生产产家" width="120"></el-table-column>
  			<el-table-column prop="product_specifications" label="产品规格" width="180"></el-table-column>
  			<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
  			<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
				<el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
				<el-table-column prop="product_discount" label="扣率" width="80"></el-table-column>
				<el-table-column prop="product_mack_price" label="打款价" width="80"></el-table-column>
				<el-table-column prop="product_type" label="返费类型" width="100"></el-table-column>
				<el-table-column prop="product_return_money" label="返费金额" width="80"></el-table-column>
				<el-table-column prop="product_return_discount" label="返费率" width="80"></el-table-column>
				<el-table-column prop="product_return_explain" label="返费说明" width="200"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="80"></el-table-column>
				<el-table-column prop="product_medical_type" label="医保类型" width="80"></el-table-column>
				<el-table-column prop="remark" label="备注" width="200"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="200">
			    <template slot-scope="scope">
				    <el-button v-show="authCode.indexOf('58') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="small"></el-button>
		        <el-button v-show="authCode.indexOf('57') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
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
				drugs:[],
				contacts:[],
				pageNum:10,
				currentPage:1,
				count:0,
				authCode:"",
				params:{
					productCommonName:"",
					contactId:""
				}
			}
		},
		activated(){
			this.getDrugsList();
			this.getContacts();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0},function(res){
					_self.contacts = res.message;
				});
			},
			formatterPer(row, column, cellValue){
				var per = row.product_commission/row.product_price*100;
				return per.toFixed(2)+"%";
			},
			editRow(scope){//编辑药品信息
				sessionStorage["drugs_edit"] = JSON.stringify(this.drugs[scope.$index]);
				sessionStorage["contacts"] = JSON.stringify(this.contacts);
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
				console.log(scope);
				var _self = this;
        this.jquery('/iae/drugs/deleteDrugs',{
          product_id:scope.row.product_id
        },function(res){
          _self.$message({message: '删除成功',type: 'success'});
          _self.getDrugsList();
          _self.dialogFormVisible = false;
        });
			},
			//跳转到编辑页面
			add(){
				sessionStorage["contacts"] = JSON.stringify(this.contacts);
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
