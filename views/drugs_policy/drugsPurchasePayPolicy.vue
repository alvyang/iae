<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>药品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/main/drugspolicy' }">药品政策管理（下游）</el-breadcrumb-item>
			<el-breadcrumb-item>预付招商政策管理</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="联系人" prop="contactId">
        <el-select v-model="params.contactId" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts"
            :key="item.contacts_id"
            :label="item.contacts_name"
            :value="item.contacts_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否设置" prop="purchase_pay_query_type">
        <el-select v-model="params.purchase_pay_query_type" style="width:210px;" filterable size="mini" placeholder="请选择">
          <el-option key="" label="全部" value=""></el-option>
          <el-option key="已设置" label="已设置" value="已设置"></el-option>
          <el-option key="未设置" label="未设置" value="未设置"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',159,') > -1" @click="getPurchasePayPolicy()" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',159,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick @click="$router.push('/main/drugspolicy');" size="mini">返回</el-button>
		  </el-form-item>
		</el-form>
    <div class="allot_policy">
      <el-button @click.native.prevent="editBatchRow()" v-dbClick v-show="authCode.indexOf(',160,') > -1" type="primary" size="mini">批量修改</el-button>
    </div>
    <el-table :data="purchasePayPolicy" style="width: 100%" :height="tableHeight" size="mini" :stripe="true" :border="true"
        @selection-change="selectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column fixed prop="contacts_name" label="业务员" width="80" ></el-table-column>
        <el-table-column fixed prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
        <el-table-column prop="purchase_pay_policy_make_price" label="打款价" width="80"></el-table-column>
        <el-table-column prop="product_return_money" label="积分" width="80"></el-table-column>
        <el-table-column prop="purchase_pay_policy_price" label="预付政策积分" width="100"></el-table-column>
        <el-table-column prop="purchase_pay_policy_remark" label="积分备注"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf(',160,') > -1"  icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
	      layout="total, sizes, prev, pager, next"
	      :total="count">
	    </el-pagination>
    </div>
    <el-dialog title="修改销售政策" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames" style="text-align:left;" >
			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="1">
          <div><span>规格:</span>{{drug.product_specifications}}</div>
          <div><span>底价:</span>{{drug.product_floor_price}}</div>
          <div><span>高开税率:</span>{{drug.product_high_discount}}%</div>
          <div><span>打款价:</span>{{drug.product_mack_price}}</div>
					<div><span>积分:</span>{{drug.product_return_money}}</div>
          <div style="display:block;width:100%;"><span>生产厂家:</span>{{drug.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="policyPay" status-icon :rules="policyPayRule" style="margin-top:20px;" :inline="true" ref="policyPay" label-width="100px" class="demo-ruleForm">
        <el-form-item label="联系人" prop="purchase_pay_contact_id">
          <el-select v-model="policyPay.purchase_pay_contact_id" style="width:179px;" filterable placeholder="请选择">
  					<el-option v-for="item in contacts"
              :key="item.contacts_id"
              :label="item.contacts_name"
              :value="item.contacts_id">
            </el-option>
          </el-select>
        </el-form-item>
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
    <el-dialog title="批量修改调货政策" width="700px" :visible.sync="dialogFormVisibleBatch">
			<el-form :model="policyPay" status-icon :rules="policyPayRule" style="margin-top:20px;" :inline="true" ref="policyBatch" label-width="100px" class="demo-ruleForm">
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
        <el-button size="small" v-dbClick @click="dialogFormVisibleBatch = false">取 消</el-button>
        <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editPurchasePayBatchPolicy('policyBatch')">确 定</el-button>
      </div>
    </el-dialog>
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
          this.policyPay.purchase_pay_policy_price = this.policyPay.purchase_pay_policy_price?this.policyPay.purchase_pay_policy_price:Math.round(temp*100)/100;
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
          this.policyPay.purchase_pay_policy_price = this.policyPay.purchase_pay_policy_price?this.policyPay.purchase_pay_policy_price:Math.round(temp*100)/100;
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
          productCode:"",
          purchase_pay_query_type:"",
          requestFrom:"drugsPurchasePayPolicy",
        },
        policyPay:{
          purchase_pay_policy_floor_price:"",
          purchase_pay_policy_tax:"",
          purchase_pay_policy_price:"",
          purchase_pay_policy_remark:"",
          purchase_pay_contact_id:"",
          purchase_pay_policy_make_price:""
        },
        policyPayRule:{
          purchase_pay_policy_tax:[{ validator: validatePercent,labelname:'高开税率', trigger: 'blur' }],
          purchase_pay_policy_floor_price:[{ validator: validateMoney,labelname:'招商底价', trigger: 'blur' }],
          purchase_pay_policy_make_price:[{ validator: validateMoney,labelname:'打款价', trigger: 'blur' }],
          purchase_pay_policy_price:[{ validator: validateMoney,labelname:'招商积分', trigger: 'blur' }],
          purchase_pay_contact_id:[{ required: true, message: '请选择联系人', trigger: 'change' }],
        },
        authCode:"",
        pageNum:20,
				currentPage:1,
				count:0,
        dialogFormVisible:false,
        dialogFormVisiblePolicy:false,
        dialogFormVisibleBatch:false,
        loading:false,
        tableHeight:0,
      }
    },
    updated(){
			this.tableHeight = $(window).height() - 220 - $(".search").height();
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 220 - $(".search").height();
			});
    },
    activated(){
      this.params.productCode = this.$route.query.productCode;
      this.getContacts();
      this.getPurchasePayPolicy();
      this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      editBatchRow(){
        if(this.drugId.length > 0){
          this.policyPay={
            purchase_pay_policy_floor_price:"",
            purchase_pay_policy_tax:"",
            purchase_pay_policy_price:"",
            purchase_pay_policy_remark:"",
            purchase_pay_contact_id:"",
            purchase_pay_policy_make_price:""
          }
          this.dialogFormVisibleBatch = true;
        }
      },
      selectionChange(val){
        this.drugId = [];
        for(var i = 0 ; i < val.length ;i++){
          this.drugId.push({
            id:val[i].product_id,
            contacts_id:val[i].contacts_id1
          });
        }
      },
      exportPurchasePayPolicy(){
        var url = this.$bus.data.host + "/iae/purchasePayPolicy/exportPurchasePayPolicy";
        this.download(url,this.params);
      },
      editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        var temp = JSON.stringify(scope.row);
				this.drug = JSON.parse(temp);
        this.policyPay.front_message = JSON.stringify({
          purchase_pay_policy_floor_price:this.drug.purchase_pay_policy_floor_price,
          purchase_pay_policy_tax:this.drug.purchase_pay_policy_tax,
          purchase_pay_policy_remark:this.drug.purchase_pay_policy_remark,
          purchase_pay_policy_price:this.drug.purchase_pay_policy_price,
          purchase_pay_contact_id:this.drug.contacts_id1
        });
        this.policyPay.purchase_pay_policy_floor_price = this.drug.purchase_pay_policy_floor_price;
        this.policyPay.purchase_pay_policy_tax = this.drug.purchase_pay_policy_tax;
        this.policyPay.purchase_pay_policy_remark = this.drug.purchase_pay_policy_remark;
        this.policyPay.purchase_pay_policy_price = this.drug.purchase_pay_policy_price;
        this.policyPay.purchase_pay_contact_id = this.drug.contacts_id1;
        this.policyPay.purchase_pay_policy_drug_id = this.drug.product_id;
        this.policyPay.purchase_pay_policy_make_price = this.drug.product_mack_price;
			},
      getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['业务员']},function(res){
	        _self.contacts = res.message;
	      });
	    },
      getPurchasePayPolicy(){
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
        this.jquery('/iae/purchasePayPolicy/getPurchasePayPolicy',{
          data:_self.params,
          page:page
        },function(res){
          _self.purchasePayPolicy = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
        });
      },
      editPurchasePayBatchPolicy(formName){
        var _self = this;
        _self.policyPay.purchasePayDrugs = this.drugId;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/purchasePayPolicy/editPurchasePayBatchPolicy',_self.policyPay,function(res){
								_self.dialogFormVisibleBatch = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getPurchasePayPolicy();
							});
						} else {
							return false;
						}
				});
      },
      editPurchasePayPolicy(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/purchasePayPolicy/editPurchasePayPolicy',_self.policyPay,function(res){
								_self.dialogFormVisible = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getPurchasePayPolicy();
							});
						} else {
							return false;
						}
				});
			},
      reSearch(arg){
				this.$refs["params"].resetFields();
        this.currentPage = 1;
				this.getPurchasePayPolicy();
			},
      handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getPurchasePayPolicy();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getPurchasePayPolicy();
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
