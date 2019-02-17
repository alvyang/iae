<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售政策管理<a style="color:#f24040;">（请选择销售单位）</a></el-breadcrumb-item>
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
		    <el-input v-model="params.productCode" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编码"></el-input>
		  </el-form-item>
      <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
      <el-form-item label="　业务员" prop="sale_contact_id">
        <el-select v-model="params.sale_contact_id" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts"
            :key="item.contacts_id"
            :label="item.contacts_name"
            :value="item.contacts_id">
          </el-option>
        </el-select>
      </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('83ff2470-d43d-11e8-984b-5b9b376cac6a,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('83ff2470-d43d-11e8-984b-5b9b376cac6a,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf('c250c860-d81f-11e8-a52f-4f446572c8cf,') > -1" @click="exportSalePolicy" size="mini">导出</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf('860afa00-d43d-11e8-984b-5b9b376cac6a,') > -1" @click="dialogFormVisiblePolicy = true" size="mini">政策复制</el-button>
		  </el-form-item>
		</el-form>
    <el-table :data="drugPolicy" style="width: 100%" size="mini" :stripe="true" :border="true">
        <el-table-column fixed prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
        <el-table-column prop="product_return_money" label="积分" width="80"></el-table-column>
        <el-table-column prop="sale_policy_money" label="销售积分" width="80"></el-table-column>
        <el-table-column prop="business_name" label="积分比例" width="80" :formatter="formatterPercent"></el-table-column>
        <el-table-column prop="sale_policy_remark" label="积分备注" width="80"></el-table-column>
        <el-table-column prop="contacts_name" label="业务员" ></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf('860afa00-d43d-11e8-984b-5b9b376cac6a,') > -1"  icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
      <el-dialog title="政策复制" width="700px" class="copy_form" :visible.sync="dialogFormVisiblePolicy">
        <el-form :inline="true" :model="copyPolicyParams" :rules="copyPolicyParamsRule" ref="copyPolicyParams" size="mini" class="demo-form-inline search">
          <el-form-item label="将" prop="hospital_id">
      			 <el-select v-model="copyPolicyParams.hospital_id" style="width:210px;" filterable size="mini" placeholder="请选择">
      				 <el-option v-for="item in hospitals"
      					 :key="item.hospital_id"
      					 :label="item.hospital_name"
      					 :value="item.hospital_id">
      				 </el-option>
      		 	</el-select>
      		</el-form-item>
          <el-form-item label="的政策复制到" prop="hospital_id_copy">
      			 <el-select v-model="copyPolicyParams.hospital_id_copy" style="width:210px;" filterable size="mini" placeholder="请选择">
      				 <el-option v-for="item in hospitals"
      					 :key="item.hospital_id"
      					 :label="item.hospital_name"
      					 :value="item.hospital_id">
      				 </el-option>
      		 	</el-select>
      		</el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" v-dbClick @click="dialogFormVisiblePolicy = false">取 消</el-button>
          <el-button type="primary" size="small" v-dbClick :loading="loading" @click="copyPolicy('copyPolicyParams')">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="修改销售政策" width="700px" :visible.sync="dialogFormVisible">
  			<el-collapse v-model="activeNames" style="text-align:left;" >
  			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="1">
            <div><span>规格:</span>{{drug.product_specifications}}</div>
  					<div><span>积分:</span>{{drug.product_return_money}}</div>
            <div style="display:block;width:100%;"><span>生产产家:</span>{{drug.product_makesmakers}}</div>
  			  </el-collapse-item>
  			</el-collapse>
  			<el-form :model="policy" status-icon :rules="policyRule" style="margin-top:20px;" :inline="true" ref="sale" label-width="100px" class="demo-ruleForm">
  				<el-form-item label="销售积分" prop="sale_policy_money" :maxlength="10">
  					<el-input v-model="policy.sale_policy_money" style="width:179px;" placeholder="销售积分"></el-input>
  				</el-form-item>
          <el-form-item label="业务员" prop="sale_policy_contact_id">
           <el-select v-model="policy.sale_policy_contact_id" style="width:179px;" filterable placeholder="请选择">
             <el-option key="" label="" value=""></el-option>
             <el-option v-for="item in contacts"
               :key="item.contacts_id"
               :label="item.contacts_name"
               :value="item.contacts_id">
             </el-option>
           </el-select>
         </el-form-item>
          <el-form-item label="积分备注" prop="sale_policy_remark">
            <el-input v-model="policy.sale_policy_remark" style="width:179px;" placeholder="积分备注"></el-input>
          </el-form-item>
  			</el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editSales('sale')">确 定</el-button>
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
        contacts:[],
        drug:{},
        params:{
          hospitalId:"",
          productCommonName:"",
          sale_contact_id:"",
          productCode:""
        },
        policy:{
          sale_policy_money:"",
          sale_policy_contact_id:"",
          sale_policy_remark:""
        },
        copyPolicyParams:{
          hospital_id:"",
          hospital_id_copy:"",
        },
        copyPolicyParamsRule:{
  				hospital_id:[{ required: true, message: '请选择被复制销往单位', trigger: 'change' }],
  				hospital_id_copy:[{ required: true, message: '请选择复制的销住单位', trigger: 'change' }],
        },
        authCode:"",
        pageNum:10,
				currentPage:1,
				count:0,
        dialogFormVisible:false,
        dialogFormVisiblePolicy:false,
        loading:false,
      }
    },
    activated(){
      this.getHospitals();
      this.getContacts();
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      copyPolicy(formName){//政策复制
        var _self = this;
        this.$refs[formName].validate((valid) => {
            if (valid) {
              _self.loading = true;
              _self.jquery('/iae/salesPolicy/copySalesPolicy',_self.copyPolicyParams,function(res){
                // _self.dialogFormVisiblePolicy = false;
                _self.loading = false;
                _self.$message({showClose: true,message: '复制成功',type: 'success'});
              });
            } else {
              return false;
            }
        });
      },
      exportSalePolicy(){
        var url = this.$bus.data.host + "/iae/salesPolicy/exportSalesPolicy";
        this.download(url,this.params);
      },
      formatterPercent(row, column, cellValue, index){
        if(row.sale_policy_money && row.product_return_money){
          return  Math.round(row.sale_policy_money*100/row.product_return_money) +"%";
        }else{
          return "";
        }
      },
      editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				this.drug = scope.row;
        this.policy.sale_policy_money = scope.row.sale_policy_money;
        this.policy.sale_policy_contact_id = scope.row.sale_policy_contact_id;
        this.policy.sale_policy_remark = scope.row.sale_policy_remark;
			},
      getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['业务员']},function(res){
	        _self.contacts = res.message;
	      });
	    },
      getSalesPolicy(){
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
        this.jquery('/iae/salesPolicy/getSalesPolicy',{
          data:_self.params,
          page:page
        },function(res){
          _self.drugPolicy = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
        });
      },
      editSales(formName){
				var _self = this;
        _self.policy.sale_hospital_id = this.params.hospitalId;
        _self.policy.sale_drug_id = this.drug.product_id;
        _self.policy.product_code = this.drug.product_code;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/salesPolicy/editSalesPolicy',_self.policy,function(res){
								_self.dialogFormVisible = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getSalesPolicy();
							});
						} else {
							return false;
						}
				});
			},
      getHospitals(){
        var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'销售医院'},function(res){
						_self.hospitals = res.message;
				});
      },
      reSearch(arg){
        if(arg || !this.params.hospitalId){
					this.$refs["params"].resetFields();
          this.drugPolicy = [];
				}else{
          this.currentPage = 1;
  				this.getSalesPolicy();
        }
			},
      handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getSalesPolicy();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getSalesPolicy();
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
