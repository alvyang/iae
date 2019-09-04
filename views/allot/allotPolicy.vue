<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>调货政策管理</el-breadcrumb-item>
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
		    <el-input v-model="params.productCode" style="width:210px;" @keyup.13.native="getAllotPolicy()" size="mini" placeholder="产品编码"></el-input>
		  </el-form-item>
      <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="getAllotPolicy()" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
      <el-form-item label="调货联系人" prop="contactId">
 			 <el-select v-model="params.contactId" style="width:196px;" filterable size="mini" placeholder="请选择">
 				 <el-option key="" label="全部" value=""></el-option>
 				 <el-option v-for="item in contacts"
 					 :key="item.contacts_id"
 					 :label="item.contacts_name"
 					 :value="item.contacts_id">
 				 </el-option>
 			 </el-select>
 		 </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',132,') > -1" @click="getAllotPolicy()" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',132,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf(',119,') > -1" @click="$router.push('/main/allotpolicydrugs');" size="mini">新增</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf(',135,') > -1" @click="exportAllotPolicy" size="mini">导出</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf(',133,') > -1" @click="dialogFormVisiblePolicy = true" size="mini">政策复制</el-button>
		  </el-form-item>
		</el-form>
    <div class="allot_policy">
      <el-button @click.native.prevent="editBatchRow()" v-dbClick v-show="authCode.indexOf(',119,') > -1" type="primary" size="mini">批量修改</el-button>
    </div>
    <el-table :data="drugPolicy" style="width: 100%" :height="tableHeight"  size="mini" :stripe="true" :border="true"
        @selection-change="selectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column fixed prop="hospital_name" label="销往单位" width="120" ></el-table-column>
        <el-table-column fixed prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
        <el-table-column prop="product_return_money" label="积分" width="80"></el-table-column>
        <el-table-column prop="allot_policy_money" label="调货积分" width="80"></el-table-column>
        <el-table-column prop="allot_policy_percent" label="政策点数" width="80"></el-table-column>
        <el-table-column prop="allot_policy_formula" label="政策公式" width="80" :formatter="formatterFormula"></el-table-column>
        <el-table-column prop="business_name" label="积分比例" :formatter="formatterPercent"></el-table-column>
        <el-table-column prop="allot_policy_remark" label="积分备注" width="80"></el-table-column>
        <el-table-column prop="contacts_name" label="调货联系人" ></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf(',133,') > -1"  icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
    <el-dialog title="修改调货政策" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames" style="text-align:left;" >
			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="1">
          <div><span>规格:</span>{{drug.product_specifications}}</div>
          <div><span>中标价:</span>{{drug.product_price}}</div>
					<div><span>积分:</span>{{drug.product_return_money}}</div>
          <div style="display:block;width:100%;"><span>生产厂家:</span>{{drug.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="policy" status-icon :rules="policyBatchRule" style="margin-top:20px;" :inline="true" ref="sale" label-width="100px" class="demo-ruleForm">
        <el-form-item label="政策公式" prop="allot_policy_formula">
          <el-select v-model="policy.allot_policy_formula" style="width:472px;" @change="formulaChange"  placeholder="请选择">
            <el-option key="1" label="中标价*政策点数" value="1"></el-option>
            <el-option key="2" label="中标价*政策点数-补点/费用票" value="2"></el-option>
            <el-option key="3" label="实收上游积分或上游政策积分*政策点数" value="3"></el-option>
            <el-option key="4" label="实收上游积分或上游政策积分*政策点数-补点/费用票" value="4"></el-option>
            <el-option key="5" label="实收上游积分或上游政策积分-中标价*政策点数" value="5"></el-option>
            <el-option key="6" label="实收上游积分或上游政策积分-中标价*政策点数-补点/费用票" value="6"></el-option>
            <el-option key="7" label="实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分" value="7"></el-option>
            <el-option key="9" label="实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.03-补点/费用票:实收上游积分-补点/费用票" value="9"></el-option>
            <el-option key="10" label="实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.05-补点/费用票:实收上游积分-补点/费用票" value="10"></el-option>
            <el-option key="8" label="固定政策（上游政策修改后，需手动调整下游政策）" value="8"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="政策点数" prop="allot_policy_percent" :maxlength="10" v-show="policy.allot_policy_formula != '8'">
          <el-input v-model="policy.allot_policy_percent" style="width:179px;"  @change="formulaChange"  placeholder="政策点数（如：60）"></el-input>
        </el-form-item>
        <el-form-item label="调货积分" prop="allot_policy_money" :maxlength="10">
					<el-input v-model="policy.allot_policy_money" style="width:179px;" placeholder="调货积分"></el-input>
				</el-form-item>
        <el-form-item label="调货联系人" prop="allot_policy_contact_id">
         <el-select v-model="policy.allot_policy_contact_id" style="width:179px;" filterable placeholder="请选择">
           <el-option key="" label="" value=""></el-option>
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
        <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editSales('sale')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="批量修改调货政策" width="700px" :visible.sync="dialogFormVisibleBatch">
			<el-form :model="policyBatch" status-icon :rules="policyBatchRule" style="margin-top:20px;" :inline="true" ref="policyBatch" label-width="100px" class="demo-ruleForm">
        <el-form-item label="政策公式" prop="allot_policy_formula">
          <el-select v-model="policyBatch.allot_policy_formula" style="width:472px;"  placeholder="请选择">
            <el-option key="1" label="中标价*政策点数" value="1"></el-option>
            <el-option key="2" label="中标价*政策点数-补点/费用票" value="2"></el-option>
            <el-option key="3" label="实收上游积分或上游政策积分*政策点数" value="3"></el-option>
            <el-option key="4" label="实收上游积分或上游政策积分*政策点数-补点/费用票" value="4"></el-option>
            <el-option key="5" label="实收上游积分或上游政策积分-中标价*政策点数" value="5"></el-option>
            <el-option key="6" label="实收上游积分或上游政策积分-中标价*政策点数-补点/费用票" value="6"></el-option>
            <el-option key="7" label="实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分" value="7"></el-option>
            <el-option key="9" label="实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.03-补点/费用票:实收上游积分-补点/费用票" value="9"></el-option>
            <el-option key="10" label="实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.05-补点/费用票:实收上游积分-补点/费用票" value="10"></el-option>
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
</template>
<script>
  export default({
    data(){
      var validateBatchPercent = (rule, value, callback) => {
        if(this.isEmpty(value) && this.policy.allot_policy_formula != '8'){
          callback(new Error('请再输入政策点数'));
        }else if (!this.isEmpty(value) && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
          callback(new Error('请再输入正确的政策点数'));
        } else {
          this.policy.allot_policy_money = this.getShouldPayMoney(this.policy.allot_policy_formula,this.drug.product_price,this.drug.product_return_money,this.policy.allot_policy_percent,0,this.policy.allot_policy_money);
          this.policy.allot_policy_money = Math.round(this.policy.allot_policy_money*100)/100;
          callback();
        }
    	};
      var validateBatchMoney = (rule, value, callback) => {
  			var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
        if(this.isEmpty(value)){
          callback(new Error('请再输入'+rule.labelname));
        }else if( !reg.test(value)) {
					callback(new Error('请再输入正确的'+rule.labelname));
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
        params:{
          hospitalId:"",
          productCommonName:"",
          contactId:"",
          productCode:""
        },
        policy:{
          allot_policy_formula:"",
          allot_policy_percent:"",
          allot_policy_money:"",
          allot_policy_contact_id:"",
          allot_policy_remark:""
        },
        copyPolicyParams:{
          hospital_id:"",
          hospital_id_copy:"",
        },
        copyPolicyParamsRule:{
  				hospital_id:[{ required: true, message: '请选择被复制销往单位', trigger: 'change' }],
  				hospital_id_copy:[{ required: true, message: '请选择复制的销住单位', trigger: 'change' }],
        },
        policyBatch:{
          allot_policy_formula:"1",
          allot_policy_percent:"",
          allot_policy_contact_id:"",
          allot_policy_remark:""
        },
        policyBatchRule:{
          allot_policy_percent:[{validator:validateBatchPercent,trigger: 'blur' }],
          allot_policy_money:[{validator:validateBatchMoney,labelname:"调货积分",trigger: 'blur' }],
					allot_policy_contact_id:[{required: true, message: '请选择联系人',trigger: 'change' }]
        },
        authCode:"",
        pageNum:20,
				currentPage:1,
				count:0,
        dialogFormVisible:false,
        dialogFormVisiblePolicy:false,
        dialogFormVisibleBatch:false,
        loading:false,
        tableHeight:0
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
      this.getHospitals();
      this.getContacts();
      this.getAllotPolicy();
      this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      formulaChange(){
        // if(this.policy.allot_policy_percent){
          this.policy.allot_policy_money = this.getShouldPayMoney(this.policy.allot_policy_formula,this.drug.product_price,this.drug.product_return_money,this.policy.allot_policy_percent,0,this.policy.allot_policy_money);
          this.policy.allot_policy_money = Math.round(this.policy.allot_policy_money*100)/100;
        // }
      },
      copyPolicy(formName){//政策复制
        var _self = this;
        this.$refs[formName].validate((valid) => {
            if (valid) {
              _self.loading = true;
              _self.jquery('/iae/allotPolicy/copyAllotPolicy',_self.copyPolicyParams,function(res){
                _self.loading = false;
                _self.$message({showClose: true,message: '复制成功',type: 'success'});
              });
            } else {
              return false;
            }
        });
      },
      formatterPercent(row, column, cellValue, index){
        if(!this.isEmpty(row.allot_policy_money) && !this.isEmpty(row.product_return_money) && row.product_return_money != '0'){
          return  Math.round(row.allot_policy_money*100/row.product_return_money) +"%";
        }else{
          return "";
        }
      },
      formatterFormula(row, column, cellValue, index){
        var message = "";
        switch (cellValue) {
          case "1":
            message = "中标价*政策点数";
            break;
          case "2":
            message = "中标价*政策点数-补点/费用票";
            break;
          case "3":
            message = "实收上游积分或上游政策积分*政策点数";
            break;
          case "4":
            message = "实收上游积分或上游政策积分*政策点数-补点/费用票";
            break;
          case "5":
            message = "实收上游积分或上游政策积分-中标价*政策点数";
            break;
          case "6":
            message = "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票";
            break;
          case "7":
            message = "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分";
            break;
          case "9":
            message = "实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.03-补点/费用票:实收上游积分-补点/费用票";
            break;
          case "10":
            message = "实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.05-补点/费用票:实收上游积分-补点/费用票";
            break;
          case "8":
            message = "固定政策（上游政策修改后，需几时调整下游政策）";
            break;
          default:
        }
        return message;
      },
      editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        var temp = JSON.stringify(scope.row);
				this.drug = JSON.parse(temp);
        this.policy.front_message = JSON.stringify({
          allot_policy_money:this.drug.allot_policy_money,
          allot_policy_contact_id:this.drug.allot_policy_contact_id,
          allot_policy_remark:this.drug.allot_policy_remark,
          allot_policy_percent:this.drug.allot_policy_percent,
          allot_policy_formula:this.drug.allot_policy_formula
        });
        this.policy.allot_policy_formula = this.drug.allot_policy_formula;
        this.policy.allot_policy_percent = this.drug.allot_policy_percent;
        this.policy.allot_policy_money = this.drug.allot_policy_money;
        this.policy.allot_policy_contact_id = this.drug.allot_policy_contact_id;
        this.policy.allot_policy_remark = this.drug.allot_policy_remark;
        this.policy.product_price = this.drug.product_price;
        this.policy.product_return_money = this.drug.product_return_money;
			},
      editBatchRow(){
        if(this.drugId.length > 0){
            this.dialogFormVisibleBatch = true;
        }
      },
      selectionChange(val){
        this.drugId = [];
        for(var i = 0 ; i < val.length ;i++){
          this.drugId.push({
            id:val[i].product_id,
            price:val[i].product_price,
            product_code:val[i].product_code,
            returnMoney:val[i].product_return_money,
            hospitalId:val[i].allot_hospital_id
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
                _self.$refs["policyBatch"].resetFields();
                _self.dialogFormVisibleBatch = false;
                _self.loading = false;
                _self.getAllotPolicy();
                _self.$message({showClose: true,message: '批量修改成功',type: 'success'});
							});
						} else {
							return false;
						}
				});
      },
      getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['调货']},function(res){
	        _self.contacts = res.message;
	      });
	    },
      exportAllotPolicy(){
        var url = this.$bus.data.host + "/iae/allotPolicy/exportAllotPolicy";
        this.download(url,this.params);
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
        this.jquery('/iae/allotPolicy/getAllotPolicy',{
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
        _self.policy.allot_hospital_id = this.drug.allot_hospital_id;
        _self.policy.allot_drug_id = this.drug.product_id;
        _self.policy.product_code = this.drug.product_code;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/allotPolicy/editAllotPolicy',_self.policy,function(res){
								_self.dialogFormVisible = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getAllotPolicy();
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
				this.$refs["params"].resetFields();
        this.currentPage = 1;
				this.getAllotPolicy();
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
