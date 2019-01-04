<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="searchDrugsList" size="mini" placeholder="产品名称"></el-input>
		  </el-form-item>
			<el-form-item label="产品编码" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="searchDrugsList" size="mini" placeholder="产品编码"></el-input>
		  </el-form-item>
		  <el-form-item label="联系人" prop="contactId">
		    <el-select v-model="params.contactId" style="width:210px;" size="mini" filterable placeholder="请选择">
		    	<el-option key="" label="全部" value=""></el-option>
			    <el-option v-for="item in contacts"
			      :key="item.contacts_id"
			      :label="item.contacts_name"
			      :value="item.contacts_id">
			    </el-option>
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
		  <el-form-item>
		    <el-button type="primary" v-dbClick @click="searchDrugsList" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick @click="reSearch" size="mini">重置</el-button>
				<el-button type="primary" v-dbClick @click="returnallot" size="mini">返回列表</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" size="mini" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品名称" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="100"></el-table-column>
				<!-- <el-table-column prop="product_supplier" label="供货单位" width="150"></el-table-column> -->
				<el-table-column prop="product_specifications" label="产品规格" width="120"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生厂企业" width="150"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
  			<el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
				<el-table-column prop="product_mack_price" label="打款价" width="80"></el-table-column>
				<el-table-column prop="product_discount" label="毛利率(百分比)" :formatter="formatPercent" width="120"></el-table-column>
				<!-- <el-table-column prop="product_specifications" label="产品规格" width="120"></el-table-column> -->
				<el-table-column prop="contacts_name" label="联系人"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="70">
			    <template slot-scope="scope">
						<el-button v-dbClick @click.native.prevent="selectRow(scope)" type="primary" size="mini">选择</el-button>
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
		<el-dialog title="新增调货记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{drug.product_code}}</div>
			    <div><span>产品规格:</span>{{drug.product_specifications}}</div>
					<div><span>中标价:</span>{{drug.product_price}}</div>
					<div><span>包装:</span>{{drug.product_packing}}</div>
					<div><span>单位:</span>{{drug.product_unit}}</div>
					<div><span>打款价:</span>{{drug.product_mack_price}}</div>
					<!-- <div><span>返款金额:</span>{{drug.product_return_money}}</div> -->
					<div style="display:block;width:100%;"><span>生产产家:</span>{{drug.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="allot" ref="allot" status-icon :rules="allotRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="调货时间" prop="allot_time">
					<el-date-picker v-model="allot.allot_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="调货单位" prop="allot_hospital">
					<el-select v-model="allot.allot_hospital" style="width:179px;" @change="hospitalChange" filterable placeholder="请选择供货单位">
						<el-option v-for="item in hospitals" :key="item.hospital_id" :label="item.hospital_name" :value="item.hospital_id"></el-option>
					</el-select>
			  </el-form-item>
				<el-form-item label="调货价" prop="allot_price" :required="true">
					<el-input v-model="allot.allot_price" style="width:179px;" :maxlength="10" placeholder="请输入调货价"></el-input>
				</el-form-item>
				<el-form-item label="调货数量" prop="allot_number" :required="true">
					<el-input v-model="allot.allot_number" style="width:179px;" :maxlength="10" placeholder="请输入购入数量"></el-input>
				</el-form-item>
				<el-form-item label="调货金额" prop="allot_money">
					<el-input v-model="allot.allot_money" style="width:179px;" :readonly="true"></el-input>
				</el-form-item>
				<el-form-item label="调货联系人" prop="allot_policy_contact_id">
	 			 <el-select v-model="allot.allot_policy_contact_id" style="width:179px;" filterable placeholder="请选择">
	 				 <el-option key="" label="" value=""></el-option>
	 				 <el-option v-for="item in allotContacts"
	 					 :key="item.contacts_id"
	 					 :label="item.contacts_name"
	 					 :value="item.contacts_id">
	 				 </el-option>
	 			 </el-select>
	 		 </el-form-item>
			 <el-form-item label="批号" prop="batch_number" :required="true">
				 <el-select v-model="allot.batch_number" filterable placeholder="请选择" style="width:179px;">
					<el-option
						v-for="item in batchStockList"
						:key="item.batch_number"
						:label="item.batch_number"
						:value="item.batch_number">
						<span style="float: left">{{ item.batch_number }}</span>
						<span style="float: right; color: #8492a6; font-size: 13px">库存：{{ item.batch_stock_number }}</span>
					</el-option>
				</el-select>
			 </el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="addallots('allot')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			var validateNum = (rule, value, callback) => {
				var regu = /^\+?[1-9][0-9]*$/;
        if (value === '') {
          callback(new Error('请输入调货数量'));
        } else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
					this.allot.allot_money = this.mul(this.allot.allot_number,this.allot.allot_price,2);
          callback();
        }
      };
			var validateNull = (rule, value, callback) =>{
				if(this.allot.allot_return_flag && !value){
					callback(new Error('请选择'+rule.labelname));
				}else{
					callback();
				}
			}
			var validateRealReturnMoney = (rule, value, callback) => {
				if(this.allot.allot_return_flag && !value){
					callback(new Error('请输入返款单价'));
				}else if(this.allot.allot_return_flag && value && !reg.test(value)){
					callback(new Error('请输入正确的返款单价'));
				} else {
					this.allot.allot_return_money = this.mul(this.allot.allot_number,value,2);
          callback();
        }
      };
			var validateAllotPrice = (rule, value, callback) => {
				if(!value){
					callback(new Error('请输入调货价'));
				}else if(!reg.test(value)){
					callback(new Error('请输入正确的调货价'));
				} else {
					this.allot.allot_money = this.mul(this.allot.allot_number,value,2);
          callback();
        }
      };
			var validateBatchNumber = (rule, value, callback) => {
				var regu = /^\+?[1-9][0-9]*$/;
				if (!value) {
					callback(new Error('请选择批号'));
				}else {
					callback();
				}
			};
			return {
				dialogFormVisible:false,
				loading:false,
				drugs:[],
				drug:{},
				hospitals:[],
				business:[],
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					product_type:['高打'],
					productCommonName:"",
					contactId:"",
					product_code:"",
					business:""
				},
				remarks:[],
				contacts:[],
				accounts:[],
				allotContacts:[],
				allot:{
					allot_time:new Date(),
					allot_number:"",
					allot_hospital:"",
					allot_mack_price:"",
					allot_price:"",
					allot_money:"",
					allot_return_money:"",
					allot_return_time:null,//返款时间
					allot_return_price:"",//返款单价
					allot_return_flag:"",//是否返款标识
					allot_drug_id:"",
					allot_policy_contact_id:"",
					allot_account_id:"",//返款账号
					allot_price:"",
					batch_number:""
				},
				allotRule:{
					batch_number:[{validator:validateBatchNumber,trigger: 'blur' }],
					allot_price:[{validator:validateAllotPrice,trigger: 'blur' }],
					allot_return_price:[{validator:validateRealReturnMoney,trigger: 'blur' }],
					allot_account_id:[{validator:validateNull,labelname:'返款账号',trigger: 'change' }],
					allot_return_time:[{validator:validateNull,labelname:'返款时间',trigger: 'change' }],
					allot_number:[{validator:validateNum,trigger: 'blur' }],
					// allot_return_price:[{validator:validateRealReturnMoney,trigger: 'blur' }],
					allot_time:[{ required: true, message: '请选择调货时间', trigger: 'blur,change' }],
					allot_hospital:[{ required: true, message: '请输入调货单位', trigger: 'blur,change' }]
				},
				batchStockList:[]
			}
		},
		activated(){
			this.getContacts();
			this.getDrugsList();
			// this.getBankAccount();
			this.hospitals = JSON.parse(sessionStorage["allot_hospital"]);
			this.business = JSON.parse(sessionStorage["productbusiness"]);
			this.allotContacts = JSON.parse(sessionStorage["allotcontacts"]);
		},
		mounted(){

		},
		methods:{
			hospitalChange(){
				var _self = this;
				this.jquery('/iae/allot/getAllotPolicy',{
					drugId:this.drug.product_id,
					hospitalId:this.allot.allot_hospital
				},function(res){
					if(res.message.length > 0){
						_self.allot.allot_policy_contact_id = res.message[0].allot_policy_contact_id;
						_self.allot.allot_return_price = res.message[0].allot_policy_money;
						_self.allot.allot_policy_remark = res.message[0].allot_policy_remark;
					}else{
						_self.allot.allot_policy_contact_id="";
						_self.allot.allot_return_price="";
						_self.allot.allot_policy_remark="";
					}
				});
			},
			getBankAccount(){
				var _self = this;
				this.jquery("/iae/bankaccount/getAllAccounts",null,function(res){//查询账号
					_self.accounts=res.message;
				});
			},
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种']},function(res){
					_self.contacts = res.message;
				});
			},
			handleSelect(item) {
				this.allot.allot_hospital = item.allot_hospital;
      },
			querySearch(queryString, cb) {
        var hospitals = this.hospitals;
        var results = queryString ? hospitals.filter(this.createFilter(queryString)) : hospitals;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
			createFilter(queryString) {
        return (hospitals) => {
					if(hospitals.allot_hospital){
						return (hospitals.allot_hospital.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
					}else{
						return ;
					}

        };
      },
			//选择要进货的药品
			selectRow(scope){
				this.drug = scope.row;
				if(this.$refs["allot"]){
					this.$refs["allot"].resetFields();
				}
				this.dialogFormVisible = true;
				//查询批次库存
				if(this.drug.product_type == '高打'){//如果是高打品种，则选择批次库存
					var _self = this;
					this.jquery('/iae/stock/getBatchStockByDrugId',{productId:this.drug.product_id},function(res){
						_self.batchStockList = res.message;
					});
				}
				this.allot.allot_price = this.drug.product_price;
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.getDrugsList();
			},
			returnallot(){
				this.$router.push("/main/allot");
			},
			formatterDate(row, column, cellValue){
				if(cellValue && typeof cellValue == "string"){
	        var temp = cellValue.substring(0,10);
	        var d = new Date(temp);
	        d.setDate(d.getDate()+1);
	        return d.format("yyyy-MM-dd");
	      }else if(cellValue && typeof cellValue == "object"){
	        return new Date(cellValue).format("yyyy-MM-dd");
	      }else{
	        return "";
	      }
			},
			addallots(formName){
				var _self = this;
				this.allot.allot_mack_price = this.drug.product_mack_price;
				this.allot.allot_drug_id = this.drug.product_id;
				this.allot.product_type = this.drug.product_type;
				this.allot.stock = this.drug.stock;
				for(var i = 0 ; i < this.batchStockList.length;i++){
					if(this.allot.batch_number == this.batchStockList[i].batch_number){
						this.allot.allot_purchase_id = this.batchStockList[i].batch_stock_purchase_id;
						break;
					}
				}
				this.allot.account_detail = this.formatterDate(null,null,this.allot.allot_time)+this.allot.allot_hospital+"调货（"+this.allot.allot_number+"）"+this.drug.product_common_name+"返款";
				this.$refs[formName].validate((valid) => {
						if(_self.allot.allot_return_price){
							_self.allot.allot_return_money = _self.mul(_self.allot.allot_return_price,_self.allot.allot_number,2);
						}
						if (valid) {
							_self.loading = true;
							_self.jquery('/iae/allot/saveAllot',_self.allot,function(res){
								_self.$confirm('新增成功', '提示', {
										confirmButtonText:'继续添加',
										cancelButtonText:'返回调货列表',
										type: 'success'
								}).then(() => {
									_self.$refs["allot"].resetFields();
									_self.dialogFormVisible = false;
									_self.loading = false;
								}).catch(() => {
									_self.dialogFormVisible = false;
									_self.loading = false;
									_self.$router.push({path:`/main/allot`});
								});
							});
						} else {
							return false;
						}
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
				this.jquery('/iae/drugs/getDrugs',{
					data:_self.params,
					page:page
				},function(res){
						_self.drugs = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
				});
			},
			returnMoney(){
				this.allot.allot_return_money = this.mul(this.allot.allot_return_price,this.allot.allot_number,2);
			},
			reSearch(){
				this.$refs["params"].resetFields();
				this.getDrugsList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getDrugsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getDrugsList();
    	}
		}
	});
</script>
<style scoped="scoped">
	.el-table .cell{
		white-space: nowrap;
	}
</style>
