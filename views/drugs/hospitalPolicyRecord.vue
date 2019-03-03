<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>药品管理</el-breadcrumb-item>
			<el-breadcrumb-item>特殊政策备案</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="销往单位" prop="hospitalId">
  			 <el-select v-model="params.hospitalId" style="width:210px;" filterable size="mini" placeholder="请选择">
  				 <el-option v-for="item in hospitals"
  					 :key="item.hospital_id"
  					 :label="item.hospital_name"
  					 :value="item.hospital_id">
  				 </el-option>
  		 	</el-select>
  		</el-form-item>
      <el-form-item label="产品编码" prop="productCode">
		    <el-input v-model="params.productCode" style="width:210px;" @keyup.13.native="getHospitalPolicy()" size="mini" placeholder="产品编码"></el-input>
		  </el-form-item>
      <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="getHospitalPolicy()" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('142,') > -1" @click="getHospitalPolicy()" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('142,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf('139,') > -1" @click="$router.push('/main/hospitalpolicyrecorddrugs');" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
    <el-table :data="drugPolicy" style="width: 100%" size="mini" :stripe="true" :border="true">
        <el-table-column fixed prop="hospital_name" label="销往单位" width="120" ></el-table-column>
        <el-table-column fixed prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
        <el-table-column prop="hospital_policy_price" label="特殊销售价" width="100"></el-table-column>
        <el-table-column prop="hospital_policy_return_money" label="特殊政策积分"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
          <el-button v-dbClick v-show="authCode.indexOf('141,') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf('140,') > -1"  icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
	      layout="total, sizes, prev, pager, next"
	      :total="count">
	    </el-pagination>
      <el-dialog title="修改特殊政策" width="700px" :visible.sync="dialogFormVisible">
  			<el-collapse v-model="activeNames" style="text-align:left;" >
  			  <el-collapse-item :title="'药品信息（药品名：'+policy.product_common_name+ '）'" name="1">
            <div><span>规格:</span>{{policy.product_specifications}}</div>
            <div><span>积分:</span>{{policy.product_return_money}}</div>
            <div><span>中标价:</span>{{policy.product_price}}</div>
            <div style="display:block;width:100%;"><span>生产产家:</span>{{policy.product_makesmakers}}</div>
  			  </el-collapse-item>
  			</el-collapse>
  			<el-form :model="policy" status-icon :rules="policyRule" style="margin-top:20px;" :inline="true" ref="policy" label-width="100px" class="demo-ruleForm">
          <el-form-item label="特殊销售价" prop="hospital_policy_price" :maxlength="10">
            <el-input v-model="policy.hospital_policy_price" style="width:194px;" placeholder="特殊销售价"></el-input>
          </el-form-item>
         </el-form-item>
          <el-form-item label="特殊积分" prop="hospital_policy_return_money">
            <el-input v-model="policy.hospital_policy_return_money" style="width:194px;" placeholder="特殊积分"></el-input>
          </el-form-item>
  			</el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editHospitalPolicy('policy')">确 定</el-button>
        </div>
      </el-dialog>
		</div>
  </div>
</template>
<script>
  export default({
    data(){
      return {
        drugPolicy:[],
        hospitals:[],
        drug:{},
        params:{
          hospitalId:"",
          productCommonName:"",
          productCode:""
        },
        policy:{
          hospital_policy_price:"",
          hospital_policy_return_money:""
        },
        authCode:"",
        pageNum:10,
				currentPage:1,
				count:0,
        dialogFormVisible:false,
        loading:false,
      }
    },
    activated(){
      this.getHospitals();
      this.getHospitalPolicy();
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      formatterPercent(row, column, cellValue, index){
        if(row.sale_policy_money && row.product_return_money){
          return  Math.round(row.sale_policy_money*100/row.product_return_money) +"%";
        }else{
          return "";
        }
      },
      editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				this.policy = scope.row;
			},
      getHospitalPolicy(){
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
        this.jquery('/iae/hospitalpolicyrecorddrugs/getHospitalsPolicy',{
          data:_self.params,
          page:page
        },function(res){
          _self.drugPolicy = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
        });
      },
      editHospitalPolicy(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/hospitalpolicyrecorddrugs/editHospitalPolicy',_self.policy,function(res){
								_self.dialogFormVisible = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getHospitalPolicy();
							});
						} else {
							return false;
						}
				});
			},
      getHospitals(){
        var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'销售单位'},function(res){
						_self.hospitals = res.message;
				});
      },
      deleteRow(scope){//删除
				this.$confirm('是否删除?', '提示', {
          	confirmButtonText: '确定',
          	cancelButtonText: '取消',
          	type: 'warning'
        }).then(() => {
						this.deleteItem(scope);
        });
			},
			deleteItem(scope){
				var _self = this;
        this.jquery('/iae/hospitalpolicyrecorddrugs/deleteHospitalsPolicy',{
          product_id:scope.row.product_id,
          hospital_id:scope.row.hospital_policy_hospital_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.getHospitalPolicy();
          _self.dialogFormVisible = false;
        });
			},
      reSearch(arg){
				this.$refs["params"].resetFields();
        this.currentPage = 1;
				this.getHospitalPolicy();
			},
      handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getHospitalPolicy();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getHospitalPolicy();
    	}
    }
  })
</script>
<style>
  .copy_form .search .el-form-item__label {
    padding-left: 0px !important;
  }
  .copy_form .el-form--inline .el-form-item{
    margin-right: 4px !important;
  }
  .copy_form  .el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before{
    display: none;
  }
  .el-collapse-item__content > div{
    display: inline-block;
    width: 30%;
  }
  .el-collapse-item__content > div > span{
    display: inline-block;
    width: 56px;
    text-align: right;
    padding-right: 10px;
  }
</style>
