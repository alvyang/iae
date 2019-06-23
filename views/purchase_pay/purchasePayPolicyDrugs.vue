<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>预付招商政策管理（下游）</el-breadcrumb-item>
      <el-breadcrumb-item>预付招商政策管理（下游）-选择药品<a style="color:#f24040;">（请先选择业务员）</a></el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="业务员" prop="contactId">
       <el-select v-model="params.contactId" style="width:179px;" filterable placeholder="请选择">
         <el-option key="" label="全部" value=""></el-option>
         <el-option v-for="item in contacts"
           :key="item.contacts_id"
           :label="item.contacts_name"
           :value="item.contacts_id">
         </el-option>
       </el-select>
     </el-form-item>
      <el-form-item label="产品编码" prop="productCode">
		    <el-input v-model="params.productCode" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编码"></el-input>
		  </el-form-item>
      <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',157,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',157,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick @click="$router.push('/main/purchasepaypolicy');" size="mini">返回列表</el-button>
		  </el-form-item>
		</el-form>
    <el-table :data="purchasePayPolicy" style="width: 100%" size="mini" :stripe="true" :border="true">
        <el-table-column fixed prop="product_common_name" label="产品名称" width="150" ></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="200"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
        <el-table-column prop="product_return_money" label="积分"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf(',118,') > -1"  type="primary" size="mini">选择</el-button>
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
      <el-dialog title="新增预付招商政策" width="700px" :visible.sync="dialogFormVisible">
  			<el-collapse v-model="activeNames" style="text-align:left;" >
  			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="1">
            <div><span>规格:</span>{{drug.product_specifications}}</div>
            <div><span>底价:</span>{{drug.product_floor_price}}</div>
            <div><span>高开税率:</span>{{drug.product_high_discount}}%</div>
            <div><span>打款价:</span>{{drug.product_mack_price}}</div>
  					<div><span>积分:</span>{{drug.product_return_money}}</div>
            <div style="display:block"><span>生产厂家:</span>{{drug.product_makesmakers}}</div>
  			  </el-collapse-item>
  			</el-collapse>
  			<el-form :model="policyPay" status-icon :rules="policyPayRule" style="margin-top:20px;;text-align:left;" :inline="true" ref="policyPay" label-width="100px" class="demo-ruleForm">
          <el-form-item label="打款价" prop="purchase_pay_policy_make_price" :maxlength="10">
  					<el-input v-model="policyPay.purchase_pay_policy_make_price" style="width:179px;" placeholder="打款价"></el-input>
  				</el-form-item>
          <el-form-item label="招商底价" prop="purchase_pay_policy_floor_price" :maxlength="10">
  					<el-input v-model="policyPay.purchase_pay_policy_floor_price" style="width:179px;" placeholder="招商底价"></el-input>
  				</el-form-item>
          <el-form-item label="高开税率" prop="purchase_pay_policy_tax">
            <el-input v-model="policyPay.purchase_pay_policy_tax" style="width:179px;" placeholder="高开税率"></el-input>
          </el-form-item>
          <el-form-item label="招商积分" prop="purchase_pay_policy_price" :maxlength="10">
  					<el-input v-model="policyPay.purchase_pay_policy_price" style="width:179px;" placeholder="招商积分"></el-input>
  				</el-form-item>
          <el-form-item label="积分备注" prop="purchase_pay_policy_remark">
            <el-input v-model="policyPay.purchase_pay_policy_remark" style="width:179px;" placeholder="积分备注"></el-input>
          </el-form-item>
  			</el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editPurchasePayPolicy('policyPay')">确 定</el-button>
        </div>
      </el-dialog>
		</div>
  </div>
</template>
<script>
  export default({
    data(){
      var validatePercent = (rule, value, callback) => {
        if (value && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
          	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
          var temp = "";
          if(!this.isEmpty(this.policyPay.purchase_pay_policy_floor_price) && !this.isEmpty(this.policyPay.purchase_pay_policy_tax) && !this.isEmpty(this.policyPay.purchase_pay_policy_make_price)){
            temp = (this.policyPay.purchase_pay_policy_make_price - this.policyPay.purchase_pay_policy_floor_price)*(1-this.policyPay.purchase_pay_policy_tax/100);
          }
          this.policyPay.purchase_pay_policy_price = this.policyPay.purchase_pay_policy_price?this.policyPay.purchase_pay_policy_price:temp;
          this.policyPay.purchase_pay_policy_price = this.policyPay.purchase_pay_policy_price?Math.round(this.policyPay.purchase_pay_policy_price*100)/100:"";
          callback();
        }
    	};
      var validateMoney = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
        if (value && !reg.test(value)) {
        	callback(new Error('请输入正确的'+rule.labelname));
        } else {
          var temp = "";
          if(!this.isEmpty(this.policyPay.purchase_pay_policy_floor_price) && !this.isEmpty(this.policyPay.purchase_pay_policy_tax) && !this.isEmpty(this.policyPay.purchase_pay_policy_make_price)){
            temp = (this.policyPay.purchase_pay_policy_make_price - this.policyPay.purchase_pay_policy_floor_price)*(1-this.policyPay.purchase_pay_policy_tax/100);
          }
          this.policyPay.purchase_pay_policy_price = this.policyPay.purchase_pay_policy_price?this.policyPay.purchase_pay_policy_price:temp;
          this.policyPay.purchase_pay_policy_price = this.policyPay.purchase_pay_policy_price?Math.round(this.policyPay.purchase_pay_policy_price*100)/100:"";
          callback();
        }
    	};
      return {
        purchasePayPolicy:[],
        hospitals:[],
        contacts:[],
        drug:{},
        drugId:[],
        params:{
          contactId:"",
          productCommonName:"",
          productCode:""
        },
        policyPay:{
          purchase_pay_policy_floor_price:"",
          purchase_pay_policy_tax:"",
          purchase_pay_policy_price:"",
          purchase_pay_policy_remark:"",
          purchase_pay_policy_make_price:""
        },
        policyPayRule:{
          purchase_pay_policy_tax:[{ validator: validatePercent,labelname:'高开税率', trigger: 'blur' }],
          purchase_pay_policy_floor_price:[{ validator: validateMoney,labelname:'招商底价', trigger: 'blur' }],
          purchase_pay_policy_price:[{ validator: validateMoney,labelname:'招商积分', trigger: 'blur' }],
          purchase_pay_policy_make_price:[{ validator: validateMoney,labelname:'打款价', trigger: 'blur' }],
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
      this.getContacts();
      var _self = this;
      setTimeout(function(){
        _self.$refs["params"].resetFields();
        _self.purchasePayPolicy = [];
      });
      this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        var temp = JSON.stringify(scope.row);
				this.drug = JSON.parse(temp);
        this.policyPay.purchase_pay_policy_make_price = this.drug.product_mack_price;
			},
      getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['业务员']},function(res){
	        _self.contacts = res.message;
	      });
	    },
      getPurchasePolicy(){
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
        this.jquery('/iae/purchasePayPolicy/getPurchasePolicyDrugs',{
          data:_self.params,
          page:page
        },function(res){
          _self.purchasePayPolicy = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
        });
      },
      editPurchasePayPolicy(formName){
				var _self = this;
        _self.policyPay.purchase_pay_policy_drug_id = this.drug.product_id;
        _self.policyPay.purchase_pay_contact_id = this.params.contactId;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/purchasePayPolicy/editPurchasePayPolicy',_self.policyPay,function(res){
                _self.$confirm('新增成功', '提示', {
  									confirmButtonText:'继续添加',
  									cancelButtonText:'返回销售列表',
  									type: 'success'
  							}).then(() => {
  									_self.$refs["policyPay"].resetFields();
                    _self.dialogFormVisible = false;
    								_self.loading = false;
                    _self.getPurchasePolicy();
  							}).catch(() => {
  									_self.$refs["policyPay"].resetFields();
                    _self.dialogFormVisible = false;
    								_self.loading = false;
  									_self.$router.push({path:`/main/purchasepaypolicy`});
  							});
							});
						} else {
							return false;
						}
				});
			},
      reSearch(arg){
        if(arg || !this.params.contactId){
          this.$refs["params"].resetFields();
          this.purchasePayPolicy = [];
        }else{
          this.currentPage = 1;
  				this.getPurchasePolicy();
        }
			},
      handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getPurchasePolicy();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getPurchasePolicy();
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
