<template>
	<div style="box-sizing: border-box;padding: 0px 10px;" class="allot_list">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>销售管理</el-breadcrumb-item>
			<el-breadcrumb-item>调货管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="调货时间" prop="allot_time">
				<el-date-picker v-model="params.allot_time" type="daterange" size="mini" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" size="mini" @keyup.13.native="reSearch(false)" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品通用名"></el-input>
		  </el-form-item>
			<el-form-item label="生产厂家" prop="product_makesmakers">
		    <el-input v-model="params.product_makesmakers" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="生产厂家"></el-input>
		  </el-form-item>
			<el-form-item label="调货单位" prop="allot_hospital">
				<el-select v-model="params.allot_hospital" style="width:210px;" size="mini" filterable placeholder="请选择供货单位">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in hospitals" :key="item.hospital_id" :label="item.hospital_name" :value="item.hospital_id"></el-option>
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
		 <el-form-item label="　　批号" prop="batch_number">
 			<el-input v-model="params.batch_number" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="批号"></el-input>
 	  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',61,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',61,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',58,') > -1" @click="add" size="mini">新增</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',129,') > -1" @click="exportAllot" size="mini">导出</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',101,') > -1" @click="importShow" size="mini">导入</el-button>
 			 	<el-button type="primary" v-dbClick v-show="authCode.indexOf(',101,') > -1" @click="downloadTemplate" size="mini">导入模板下载</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money_allot">
			<a>调货总额：</a>{{money}} <span>元</span>
		</div>
		<el-table :data="allots" style="width: 100%" size="mini" :stripe="true" :border="true">
				<el-table-column fixed prop="allot_time" label="调货时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="hospital_name" label="调货单位" width="120"></el-table-column>
				<el-table-column prop="hospital_area" label="单位区域" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
  			<el-table-column prop="product_common_name" label="产品通用名" width="120"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="allot_type" label="调货类型" width="80" :formatter="formatterType"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="contacts_name" label="调货联系人" width="80"></el-table-column>
				<el-table-column prop="allot_number" label="数量" width="50"></el-table-column>
				<el-table-column prop="allot_mack_price" label="打款价" width="60"></el-table-column>
				<el-table-column prop="allot_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="allot_money" label="金额" ></el-table-column>
				<el-table-column prop="batch_number" label="批号" ></el-table-column>
				<!-- <el-table-column prop="allot_return_price" label="返款单价" width="70"></el-table-column>
				<el-table-column prop="allot_return_money" label="返款金额" width="70"></el-table-column>
				<el-table-column prop="allot_return_time" label="返款时间" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column fixed="right" prop="allot_return_flag" label="是否返款" width="80"></el-table-column> -->
				<el-table-column fixed="right" label="操作" width="100">
			    <template slot-scope="scope">
				    <el-button v-show="authCode.indexOf(',60,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
		        <el-button v-show="authCode.indexOf(',59,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog title="修改调货记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+allot.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{allot.product_code}}</div>
			    <div><span>产品规格:</span>{{allot.product_specifications}}</div>
					<div><span>中标价:</span>{{allot.product_price}}</div>
					<div><span>包装:</span>{{allot.product_packing}}</div>
					<div><span>单位:</span>{{allot.product_unit}}</div>
					<div><span>打款价:</span>{{allot.product_mack_price}}</div>
					<!-- <div><span>返款金额:</span>{{allot.product_return_money}}</div> -->
					<div style="display:block;width:100%;"><span>生产厂家:</span>{{allot.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="allot" ref="allot" status-icon :rules="allotRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<div>
					<el-form-item label="调货类型" prop="sale_type">
						<el-radio v-model="allot.allot_type" label="1">调货出库</el-radio>
						<el-radio v-model="allot.allot_type" label="2">调货退回</el-radio>
					</el-form-item>
				</div>
				<el-form-item label="调货时间" prop="allot_time">
					<el-date-picker v-model="allot.allot_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="调货单位" prop="allot_hospital">
					<el-select v-model="allot.allot_hospital" @change="hospitalChange" style="width:179px;" filterable placeholder="请选择调货单位">
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
					<el-input v-model="allot.allot_money" style="width:179px;"></el-input>
				</el-form-item>
				<!-- <el-form-item label="调货联系人" prop="allot_policy_contact_id">
	 			 <el-select v-model="allot.allot_policy_contact_id" style="width:179px;" filterable placeholder="请选择">
	 				 <el-option key="" label="" value=""></el-option>
	 				 <el-option v-for="item in contacts"
	 					 :key="item.contacts_id"
	 					 :label="item.contacts_name"
	 					 :value="item.contacts_id">
	 				 </el-option>
	 			 </el-select>
	 		 </el-form-item> -->
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="editallots('allot')">确 定</el-button>
      </div>
    </el-dialog>
		<el-dialog title="导入调货记录" width="600px" class="import_record" :visible.sync="dialogFormVisibleImport">
			<el-upload
			  class="upload-demo"
				ref="upload"
			  :action="importAllotsUrl"
			  :before-upload="beforeUpload"
				:on-success="importAllotsSuccess"
			  :file-list="fileList">
			  <el-button size="small" type="primary" v-dbClick :loading="loadingImport">{{uploadButtom}}</el-button>
			  <div slot="tip" class="el-upload__tip" style="display:inline-block">　只能上传xls/xlsx文件</div>
			</el-upload>
			<div v-show="errorMessage" style="margin-top: 15px;" v-html="errorMessage"></div>
		</el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			var validateNum = (rule, value, callback) => {
				var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
        if (value === '') {
          callback(new Error('请输入调货数量'));
        } else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
					this.allot.allot_money = this.allot.allot_money?this.allot.allot_money:this.mul(this.allot.allot_number,this.allot.allot_price,2);
					if(!this.isEmpty(this.allot.allot_return_price)&& reg.test(this.allot.allot_return_price)){
						this.allot.allot_return_money = this.allot.allot_return_money?this.allot.allot_return_money:this.mul(this.allot.allot_return_price,this.allot.allot_number,2);
					}
          callback();
        }
      };
			var validateNull = (rule, value, callback) =>{
				if(!this.isEmpty(this.allot.allot_return_fla) && this.isEmpty(value)){
					callback(new Error('请选择'+rule.labelname));
				}else{
					callback();
				}
			}
			var validateRealReturnMoney = (rule, value, callback) => {
				if(!this.isEmpty(this.allot.allot_return_flag) && this.isEmpty(value)){
					callback(new Error('请输入返款单价'));
				}else if(!this.isEmpty(this.allot.allot_return_flag) && !this.isEmpty(value) && !reg.test(value)){
					callback(new Error('请输入正确的返款单价'));
				} else {
					this.allot.allot_return_money = this.allot.allot_return_money?this.allot.allot_return_money:this.mul(value,this.allot.allot_number);
          callback();
        }
      };
			var validateAllotPrice = (rule, value, callback) => {
				if(this.isEmpty(value)){
					callback(new Error('请输入调货价'));
				}else if(!reg.test(value)){
					callback(new Error('请输入正确的调货价'));
				} else {
					this.allot.allot_money = this.allot.allot_money?this.allot.allot_money:this.mul(this.allot.allot_number,value,2);
          callback();
        }
      };
			const nowDate = new Date();
			const beforeDate = new Date();
			beforeDate.setFullYear(nowDate.getFullYear()-1);
			return {
				pickerOptions2: {
					shortcuts: [{
						text: '本月',
						onClick(picker) {
							const end = new Date();
							const start = new Date(end.getFullYear()+"-"+(end.getMonth()+1)+"-01");
							picker.$emit('pick', [start, end]);
						}
					},{
						text: nowDate.getFullYear()+'年',
						onClick(picker) {
							const end = new Date();
							const start = new Date(end.getFullYear()+"-01"+"-01");
							picker.$emit('pick', [start, end]);
						}
					},{
						text: beforeDate.getFullYear()+'年',
						onClick(picker) {
							const start = new Date(beforeDate.getFullYear()+"-01"+"-01");
							const end = new Date(beforeDate.getFullYear()+"-12"+"-31");
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				allots:[],
				allot:{},
				hospitals:[],
				business:[],
				loading:false,
				money:0,//总额统计
				pageNum:10,
				currentPage:1,
				count:0,
				dialogFormVisible:false,
				params:{
					product_makesmakers:"",
					productCommonName:"",
					allot_hospital:"",
					allot_time:[],
					product_code:"",
					allot_return_flag:"",
					business:"",
					contactId:"",
					batch_number:""
				},
				allotRule:{
					allot_price:[{validator:validateAllotPrice,trigger: 'blur' }],
					allot_account_id:[{validator:validateNull,labelname:'返款账号',trigger: 'change' }],
					allot_return_time:[{validator:validateNull,labelname:'返款时间',trigger: 'change' }],
					allot_number:[{validator:validateNum,trigger: 'blur' }],
					allot_return_price:[{validator:validateRealReturnMoney,trigger: 'blur' }],
					allot_time:[{ required: true, message: '请选择调货时间', trigger: 'blur,change' }],
					allot_hospital:[{ required: true, message: '请输入调货单位', trigger: 'blur,change' }]
				},
				authCode:"",
				importAllotsUrl:"",
				dialogFormVisibleImport:false,
				uploadButtom:"导入调货记录",
				errorMessage:"",
			}
		},
		activated(){
			this.getAllotsList();
			this.getAllotHospitalList();
			this.getBankAccount();
			this.getProductBusiness();
			this.getContacts();
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
				this.importAllotsUrl = this.$bus.data.host + "/iae/allot/importAllots";
		},
		methods:{
			formatterType(row, column, cellValue){
				return cellValue=='1'?"调货出库":"调货退回";
			},
			downloadTemplate(){
				window.location.href=this.$bus.data.host+"/download/template_allots.xlsx";
			},
			importShow(){
				this.dialogFormVisibleImport = true;
				this.errorMessage="";
				if(this.$refs.upload){
					this.$refs.upload.clearFiles();
				}
			},
			beforeUpload(file){
				this.errorMessage="";
				this.uploadButtom="上传成功，正在导入...";
				this.loadingImport = true;
			},
			importAllotsSuccess(response, file, fileList){
				this.uploadButtom="导入销售记录";
				this.loadingImport = false;
				var downloadErrorMessage = "<a style='color:red;' href='"+this.$bus.data.host+"/iae/allot/downloadErrorAllots'>下载错误数据</a>";
				this.errorMessage = response.message+downloadErrorMessage;
			},
			exportAllot(){
				var url = this.$bus.data.host + "/iae/allot/exportAllot";
				this.download(url,this.params);
			},
			hospitalChange(){
				var _self = this;
				this.jquery('/iae/allot/getAllotPolicy',{
					drugId:this.allot.product_id,
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
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['调货']},function(res){
					_self.contacts = res.message;
				});
			},
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
					sessionStorage["productbusiness"] = JSON.stringify(_self.business);
				});
			},
			getBankAccount(){
				var _self = this;
				this.jquery("/iae/bankaccount/getAllAccounts",null,function(res){//查询账号
					_self.accounts=res.message;
				});
			},
			getAllotHospitalList(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'调货单位'},function(res){
						_self.hospitals = res.message;
				});
			},
			formatPercent(row, column, cellValue, index){
				if(cellValue){
					return cellValue+" %";
				}else{
					return "-";
				}
			},
			editallots(formName){
				var _self = this;
				this.allot.account_detail = this.formatterDate(null,null,this.allot.allot_time)+this.allot.allot_hospital+"调货（"+this.allot.allot_number+"）"+this.allot.product_common_name+"返款";
				this.$refs[formName].validate((valid) => {
						if (valid) {
							_self.loading=true;
							_self.jquery('/iae/allot/editAllot',_self.allot,function(res){
								_self.dialogFormVisible = false;
								_self.loading=false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getAllotsList();
							});
						} else {
							return false;
						}
				});
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
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				var temp = JSON.stringify(scope.row);
				this.allot = JSON.parse(temp);
				this.allot.front_allot_message = temp;
				this.allot.allot_number_temp = this.allot.allot_number;
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
				this.jquery('/iae/allot/deleteAllot',{
					allot_id:scope.row.allot_id,
					stock:scope.row.stock,
					product_id:scope.row.product_id,
					allot_number:scope.row.allot_number,
					allot_purchase_id:scope.row.allot_purchase_id
				},function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getAllotsList();
					_self.dialogFormVisible = false;
				});
			},
			//跳转到编辑页面
			add(){
				sessionStorage["allotcontacts"]=JSON.stringify(this.contacts);
				sessionStorage["allot_hospital"]=JSON.stringify(this.hospitals);
				this.$router.push("/main/allotdrugs");
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getAllotsList();
			},
			getAllotsList(){
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
				this.jquery('/iae/allot/getAllot',{
					data:_self.params,
					page:page
				},function(res){
						_self.allots = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
						_self.money = res.message.allotMoney.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				});
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getAllotsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getAllotsList();
    	}
		}
	});
</script>
<style>

	.sum_money_allot > a{
		padding-left: 20px;
		color: #606266;
	}
	.sum_money_allot > span{
		color:#606266;
	}
	.sum_money_allot .more_detail{
		position: absolute;
		right: 10px;
		height: 30px;
		line-height: 30px;
		color: #409EFF;
		text-decoration: none;
	}
	.sum_money_allot{
		position: relative;
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		color:#f24040;
		line-height: 30px;
		font-size: 14px;
	}
</style>
