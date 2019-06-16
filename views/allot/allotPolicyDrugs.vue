<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>调货政策管理</el-breadcrumb-item>
      <el-breadcrumb-item>调货政策-选择药品<a style="color:#f24040;">（请先选择调货单位）</a></el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="调货单位" prop="hospitalId">
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
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',119,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',119,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick @click="$router.push('/main/allotpolicy');" size="mini">返回列表</el-button>
		  </el-form-item>
		</el-form>
    <div class="allot_policy">
      <el-button @click.native.prevent="editBatchRow()" v-dbClick v-show="authCode.indexOf(',119,') > -1" type="primary" size="mini">批量选择</el-button>
    </div>
    <el-table :data="drugPolicy" style="width: 100%" size="mini" :stripe="true" :border="true"
        @selection-change="selectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column fixed prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="140"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="200"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
        <el-table-column prop="product_return_money" label="积分"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf(',119,') > -1" type="primary" size="mini">选择</el-button>
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
      <el-dialog title="新增调货政策" width="700px" :visible.sync="dialogFormVisible">
  			<el-collapse v-model="activeNames" style="text-align:left;" >
  			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="1">
            <div><span>规格:</span>{{drug.product_specifications}}</div>
            <div><span>中标价:</span>{{drug.product_price}}</div>
  					<div><span>积分:</span>{{drug.product_return_money}}</div>
            <div style="display:block;width:100%;"><span>生产厂家:</span>{{drug.product_makesmakers}}</div>
  			  </el-collapse-item>
  			</el-collapse>
  			<el-form :model="policy" status-icon :rules="policyBatchRule" style="margin-top:20px;;text-align:left;" :inline="true" ref="policy" label-width="100px" class="demo-ruleForm">
          <el-form-item label="政策公式" prop="allot_policy_formula">
            <el-select v-model="policy.allot_policy_formula" style="width:472px;"  @change="formulaChange"  placeholder="请选择">
              <el-option key="1" label="中标价*政策点数" value="1"></el-option>
              <el-option key="2" label="中标价*政策点数-补点/费用票" value="2"></el-option>
              <el-option key="3" label="实收上游积分或上游政策积分*政策点数" value="3"></el-option>
              <el-option key="4" label="实收上游积分或上游政策积分*政策点数-补点/费用票" value="4"></el-option>
              <el-option key="5" label="实收上游积分或上游政策积分-中标价*政策点数" value="5"></el-option>
              <el-option key="6" label="实收上游积分或上游政策积分-中标价*政策点数-补点/费用票" value="6"></el-option>
              <el-option key="7" label="实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分" value="7"></el-option>
              <el-option key="8" label="固定政策（上游政策修改后，需手动调整下游政策）" value="8"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="政策点数" prop="allot_policy_percent" :maxlength="10" v-show="policy.allot_policy_formula != '8'">
            <el-input v-model="policy.allot_policy_percent" style="width:179px;" placeholder="政策点数（如：60）"></el-input>
          </el-form-item>
          <el-form-item label="调货积分" prop="allot_policy_money" :maxlength="10">
  					<el-input v-model="policy.allot_policy_money" style="width:179px;" placeholder="调货积分"></el-input>
  				</el-form-item>
          <el-form-item label="调货联系人" prop="allot_policy_contact_id">
     			 <el-select v-model="policy.allot_policy_contact_id" style="width:179px;" filterable placeholder="请选择">
     				 <el-option key="" label="全部" value=""></el-option>
     				 <el-option v-for="item in contacts"
     					 :key="item.contacts_id"
     					 :label="item.contacts_name"
     					 :value="item.contacts_id">
     				 </el-option>
     			 </el-select>
     		  </el-form-item>
          <el-form-item label="积分备注" prop="allot_policy_remark">
            <el-input v-model="policy.allot_policy_remark" style="width:179px;" placeholder="积分备注"></el-input>
          </el-form-item>
  			</el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editSales('policy')">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="批量新增调货政策" width="700px" :visible.sync="dialogFormVisibleBatch">
  			<el-form :model="policyBatch" status-icon :rules="policyBatchRule" style="margin-top:20px;;text-align:left;" :inline="true" ref="policyBatch" label-width="100px" class="demo-ruleForm">
          <el-form-item label="政策公式" prop="allot_policy_formula">
            <el-select v-model="policyBatch.allot_policy_formula" style="width:472px;"  placeholder="请选择">
              <el-option key="1" label="中标价*政策点数" value="1"></el-option>
              <el-option key="2" label="中标价*政策点数-补点/费用票" value="2"></el-option>
              <el-option key="3" label="实收上游积分或上游政策积分*政策点数" value="3"></el-option>
              <el-option key="4" label="实收上游积分或上游政策积分*政策点数-补点/费用票" value="4"></el-option>
              <el-option key="5" label="实收上游积分或上游政策积分-中标价*政策点数" value="5"></el-option>
              <el-option key="6" label="实收上游积分或上游政策积分-中标价*政策点数-补点/费用票" value="6"></el-option>
              <el-option key="7" label="实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分" value="7"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="政策点数" prop="allot_policy_percent" :maxlength="10" >
            <el-input v-model="policyBatch.allot_policy_percent" style="width:179px;" placeholder="政策点数（如：60）"></el-input>
          </el-form-item>
          <el-form-item label="调货联系人" prop="allot_policy_contact_id">
     			 <el-select v-model="policyBatch.allot_policy_contact_id" style="width:179px;" filterable placeholder="请选择">
     				 <el-option key="" label="全部" value=""></el-option>
     				 <el-option v-for="item in contacts"
     					 :key="item.contacts_id"
     					 :label="item.contacts_name"
     					 :value="item.contacts_id">
     				 </el-option>
     			 </el-select>
     		  </el-form-item>
          <el-form-item label="积分备注" prop="allot_policy_remark">
            <el-input v-model="policyBatch.allot_policy_remark" style="width:179px;" placeholder="积分备注"></el-input>
          </el-form-item>
  			</el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" v-dbClick @click="dialogFormVisibleBatch = false">取 消</el-button>
          <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editSalesBatch('policyBatch')">确 定</el-button>
        </div>
      </el-dialog>
		</div>
  </div>
</template>
<script>
  export default({
    data(){
      var validateBatchPercent = (rule, value, callback) => {
        if(!value && this.policy.allot_policy_formula != '8'){
          callback(new Error('请再输入政策点数'));
        }else if (value && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
          callback(new Error('请再输入正确的政策点数'));
        } else {
          this.policy.allot_policy_money = this.getShouldPayMoney(this.policy.allot_policy_formula,this.drug.product_price,this.drug.product_return_money,this.policy.allot_policy_percent,0,this.policy.allot_policy_money);
          this.policy.allot_policy_money = Math.round(this.policy.allot_policy_money*100)/100;
          callback();
        }
    	};
      return {
        drugPolicy:[],
        hospitals:[],
        contacts:[],
        drug:{},
        drugId:[],
        params:{
          hospitalId:"",
          productCommonName:"",
          productCode:""
        },
        policy:{
          contactId:"",
          hospitalId:"",
          allot_policy_formula:"1",
          allot_policy_percent:"",
          allot_policy_money:"",
          allot_policy_contact_id:"",
          allot_policy_remark:""
        },
        policyBatch:{
          allot_policy_formula:"1",
          allot_policy_percent:"",
          allot_policy_contact_id:"",
          allot_policy_remark:""
        },
        policyBatchRule:{
          allot_policy_percent:[{validator:validateBatchPercent,trigger: 'blur' }],
					allot_policy_contact_id:[{required: true, message: '请选择联系人',trigger: 'change' }]
        },
        authCode:"",
        pageNum:10,
				currentPage:1,
				count:0,
        dialogFormVisible:false,
        dialogFormVisibleBatch:false,
        loading:false,
      }
    },
    activated(){
      this.getHospitals();
      this.getContacts();
      var _self = this;
      setTimeout(function(){
        _self.$refs["params"].resetFields();
        _self.drugPolicy = [];
      });
      this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      formulaChange(){
        if(this.policy.allot_policy_percent){
          this.policy.allot_policy_money = this.getShouldPayMoney(this.policy.allot_policy_formula,this.drug.product_price,this.drug.product_return_money,this.policy.allot_policy_percent,0,this.policy.allot_policy_money);
          this.policy.allot_policy_money = Math.round(this.policy.allot_policy_money*100)/100;
        }
      },
      editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        var temp = JSON.stringify(scope.row);
				this.drug = JSON.parse(temp);
        this.policy.allot_policy_money = "";
        this.policy.allot_policy_contact_id = "";
        this.policy.allot_policy_remark = "";
        this.policy.allot_policy_formula="1";
        this.policy.allot_policy_percent="";
        var _self = this;
				setTimeout(function(){
					_self.$refs["policy"].clearValidate();
				},10);
			},
      editBatchRow(){
        if(this.drugId.length > 0){
            this.dialogFormVisibleBatch = true;
        }
      },
      getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['调货']},function(res){
	        _self.contacts = res.message;
	      });
	    },
      getAllotPolicy(){
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
        this.jquery('/iae/allotPolicy/getAllotPolicyDrugs',{
          data:_self.params,
          page:page
        },function(res){
          _self.drugPolicy = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
        });
      },
      selectionChange(val){
        this.drugId = [];
        for(var i = 0 ; i < val.length ;i++){
          this.drugId.push({
            id:val[i].product_id,
            price:val[i].product_price,
            product_code:val[i].product_code,
            returnMoney:val[i].product_return_money
          });
        }
      },
      editSalesBatch(formName){
        var _self = this;
        _self.policyBatch.allot_hospital_id = this.params.hospitalId;
        _self.policyBatch.allotDrugs = this.drugId;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/allotPolicy/editAllotPolicyBatch',_self.policyBatch,function(res){
                _self.$confirm('新增成功', '提示', {
  									confirmButtonText:'继续添加',
  									cancelButtonText:'返回调货列表',
  									type: 'success'
  							}).then(() => {
  									_self.$refs["policyBatch"].resetFields();
  									_self.dialogFormVisibleBatch = false;
  									_self.loading = false;
                    _self.getAllotPolicy();
  							}).catch(() => {
  									_self.$refs["policyBatch"].resetFields();
  									_self.dialogFormVisibleBatch = false;
  									_self.loading = false;
  									_self.$router.push({path:`/main/allotPolicy`});
  							});
							});
						} else {
							return false;
						}
				});
      },
      editSales(formName){
				var _self = this;
        _self.policy.allot_hospital_id = this.params.hospitalId;
        _self.policy.allot_drug_id = this.drug.product_id;
        _self.policy.product_code = this.drug.product_code;
        _self.policy.product_price = this.drug.product_price;
        _self.policy.product_return_money = this.drug.product_return_money;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/allotPolicy/editAllotPolicy',_self.policy,function(res){
                _self.$confirm('新增成功', '提示', {
  									confirmButtonText:'继续添加',
  									cancelButtonText:'返回销售列表',
  									type: 'success'
  							}).then(() => {
  									_self.$refs["policy"].resetFields();
  									_self.dialogFormVisible = false;
  									_self.loading = false;
                    _self.getAllotPolicy();
  							}).catch(() => {
  									_self.$refs["policy"].resetFields();
  									_self.dialogFormVisible = false;
  									_self.loading = false;
  									_self.$router.push({path:`/main/allotPolicy`});
  							});
							});
						} else {
							return false;
						}
				});
			},
      getHospitals(){
        var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'调货单位'},function(res){
						_self.hospitals = res.message;
				});
      },
      reSearch(arg){
        if(arg || !this.params.hospitalId){
          this.$refs["params"].resetFields();
          this.drugPolicy = [];
        }else{
          this.currentPage = 1;
  				this.getAllotPolicy();
        }
			},
      handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getAllotPolicy();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getAllotPolicy();
    	}
    }
  })
</script>
<style>

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
