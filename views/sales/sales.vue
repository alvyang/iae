<template>
	<div style="box-sizing: border-box;padding: 0px 10px;" class="sale_list">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>销售管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="销售日期" prop="salesTime">
 			 <el-date-picker v-model="params.salesTime" type="daterange" size="mini" align="right" unlink-panels
 				 range-separator="至"
 				 start-placeholder="开始日期"
 				 end-placeholder="结束日期"
 				 :picker-options="pickerOptions2">
 			 </el-date-picker>
 		 </el-form-item>
			<el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="生产厂家" prop="product_makesmakers">
		    <el-input v-model="params.product_makesmakers" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="生产厂家"></el-input>
		  </el-form-item>
			<el-form-item label="　联系人" prop="contactId">
        <el-select v-model="params.contactId" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts"
            :key="item.contacts_id"
            :label="item.contacts_name"
            :value="item.contacts_id">
          </el-option>
        </el-select>
      </el-form-item>
			<el-form-item label="品种类型" prop="productType">
				 <el-select v-model="params.productType" style="width:210px;" size="mini" multiple placeholder="请选择">
					 <el-option key="佣金" label="佣金" value="佣金"></el-option>
					 <el-option key="高打" label="高打" value="高打"></el-option>
					 <el-option key="其它" label="其它" value="其它"></el-option>
				 </el-select>
			 </el-form-item>
			<el-form-item label="销往单位" prop="hospitalsId">
			 <el-select v-model="params.hospitalsId" style="width:210px;" filterable size="mini" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option v-for="item in hospitals"
					 :key="item.hospital_id"
					 :label="item.hospital_name"
					 :value="item.hospital_id">
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
		 <el-form-item label="销售类型" prop="sale_type">
			 <el-select v-model="params.sale_type" style="width:210px;" size="mini" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option key="1" label="销售出库" value="1"></el-option>
				 <el-option key="2" label="销售退回" value="2"></el-option>
				 <el-option key="3" label="销售退补价" value="3"></el-option>
			 </el-select>
		 </el-form-item>
		 <el-form-item label="　　标签" prop="tag_type">
		  <el-cascader v-model="params.tag_type" style="width:210px;" size="mini" placeholder="搜索标签" :options="tags" filterable></el-cascader>
		</el-form-item>
		<el-form-item label="真实毛利率" prop="rate_gap">
			<el-select v-model="params.rate_formula" style="width:85px;" size="mini" placeholder="请选择">
				<el-option key="<" label="<" value="<"></el-option>
				<el-option key="<=" label="≤" value="<="></el-option>
				<el-option key=">" label=">" value=">"></el-option>
				<el-option key=">=" label="≥" value=">="></el-option>
			</el-select>
		 	<el-input-number v-model="params.rate_gap" style="width:106px;" :precision="0" :step="1" :max="100"></el-input-number>
	 	</el-form-item>
	   <el-form-item>
	     <el-button type="primary" v-dbClick v-show="authCode.indexOf(',51,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',51,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
	     <el-button type="primary" v-dbClick v-show="authCode.indexOf(',48,') > -1" @click="add" size="mini">新增</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',52,') > -1" @click="exportExcel" size="mini">导出</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',102,') > -1" @click="importShow" size="mini">导入</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',102,') > -1" @click="downloadTemplate" size="mini">导入模板下载</el-button>
	   </el-form-item>
		</el-form>
		<div class="sum_money">销售总额：<a>{{money}}</a> 元；真实毛利：<a>{{realGrossProfit}}</a> 元；毛利：<a>{{grossProfit}}</a> 元</div>
		<el-table :data="sales" style="width: 100%" size="mini" :stripe="true" :border="true">
  			<el-table-column fixed="left" prop="bill_date" label="日期" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
				<el-table-column prop="hospital_area" label="单位区域" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="buyer" label="采购" width="60"></el-table-column>
				<el-table-column prop="sale_type" label="销售类型" width="60" :formatter="formatterType"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
				<el-table-column prop="product_type" label="品种类型" width="60"></el-table-column>
				<el-table-column prop="sale_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="sale_num" label="销售数量" width="70"></el-table-column>
				<el-table-column prop="batch_number" label="批号" width="70"></el-table-column>
				<el-table-column prop="sale_money" label="销售金额" width="70"></el-table-column>
				<el-table-column prop="sale_other_money" label="补点/费用票" width="70" :formatter="formatterOtherMoney"></el-table-column>
				<el-table-column prop="real_gross_profit" label="真实毛利" width="80"></el-table-column>
				<el-table-column label="真实毛利率" width="80" :formatter="formatterRealProfitRate"></el-table-column>
				<el-table-column prop="accounting_cost" label="核算成本" width="80"></el-table-column>
				<el-table-column prop="gross_profit" label="毛利" width="80"></el-table-column>
				<el-table-column prop="cost_univalent" label="成本单价"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
			    <el-button @click.native.prevent="deleteRow(scope)" v-dbClick v-show="authCode.indexOf(',50,') > -1"  icon="el-icon-delete" type="primary" size="mini"></el-button>
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf(',49,') > -1"  icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		</div>
		<el-dialog title="修改销售记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+sale.product_common_name+ '）'" name="1">
			    <div><span>产品编号:</span>{{sale.product_code}}</div>
			    <div><span>产品规格:</span>{{sale.product_specifications}}</div>
					<div><span>中标价:</span>{{sale.sale_price}}</div>
					<div><span>包装:</span>{{sale.product_packing}}</div>
					<div><span>单位:</span>{{sale.product_unit}}</div>
					<div style="display:block;width:100%;"><span>生产厂家:</span>{{sale.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="sale" status-icon :rules="saleRule" style="margin-top:20px;" :inline="true" ref="sale" label-width="100px" class="demo-ruleForm">
				<div>
					<el-form-item label="销售类型" prop="sale_type">
						<el-radio v-model="sale.sale_type" label="1">销售出库</el-radio>
	  				<el-radio v-model="sale.sale_type" label="2">销售退回</el-radio>
						<el-radio v-model="sale.sale_type" label="3">销售退补价</el-radio>
					</el-form-item>
				</div>
				<el-form-item label="销售日期" prop="bill_date">
					<el-date-picker v-model="sale.bill_date" style="width:194px;" type="date" placeholder="请选择销售时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="销往单位" prop="hospital_id">
					<el-select v-model="sale.hospital_id" @change="hospitalChange" style="width:194px;" filterable placeholder="请选择销售机构">
						<el-option v-for="item in hospitals"
							:key="item.hospital_id"
							:label="item.hospital_name"
							:value="item.hospital_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="销售单价" prop="sale_price" :maxlength="10" :required="true" >
					<el-input v-model="sale.sale_price" style="width:194px;" placeholder="请输入销售单价"></el-input>
				</el-form-item>
				<el-form-item label="计划数量" prop="sale_num" :maxlength="10" :required="true" >
					<el-input v-model="sale.sale_num" style="width:194px;" placeholder="请输入计划数量"></el-input>
				</el-form-item>
				<el-form-item label="购入金额" prop="sale_money">
					<el-input v-model="sale.sale_money" style="width:194px;"></el-input>
				</el-form-item>
				<el-form-item label="费用票" prop="sale_other_money" v-show="sale.product_type == '佣金'">
					<el-input v-model="sale.sale_other_money" style="width:194px;" placeholder="补点/费用票"></el-input>
				</el-form-item>
				<el-form-item label="核算成本价" prop="accounting_cost" :maxlength="10">
					<el-input v-model="sale.accounting_cost" style="width:194px;" placeholder="请输入核算成本价"></el-input>
				</el-form-item>
				<el-form-item label="真实毛利" prop="real_gross_profit">
					<el-input v-model="sale.real_gross_profit" style="width:194px;"></el-input>
				</el-form-item>
				<el-form-item label="成本单价" prop="cost_univalent" :maxlength="10">
					<el-input v-model="sale.cost_univalent" style="width:194px;" placeholder="请输入成本单价"></el-input>
				</el-form-item>
				<el-form-item label="毛利" prop="gross_profit">
					<el-input v-model="sale.gross_profit" style="width:194px;"></el-input>
				</el-form-item>
				<el-form-item label="批号" prop="batch_number" v-show="sale.product_type != '高打' " >
					<el-input v-model="sale.batch_number" style="width:194px;" auto-complete="off" placeholder="请输入批号"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editSales('sale')">确 定</el-button>
      </div>
    </el-dialog>
		<el-dialog title="导入销售记录" width="600px" class="import_record" :visible.sync="dialogFormVisibleImport">
			<el-upload
			  class="upload-demo"
				ref="upload"
			  :action="importDrugsUrl"
			  :before-upload="beforeUpload"
				:on-success="importDrugsSuccess"
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
			var validateNum = (rule, value, callback) => {
				var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
				if (value === '') {
					callback(new Error('请输入计划数量'));
				} else if(!regu.test(value)){
					callback(new Error('请输入整数'));
				} else {
					this.sale.sale_money = this.sale.sale_money?this.sale.sale_money:this.mul(this.sale.sale_num,this.sale.sale_price,2);
					if(!this.isEmpty(this.sale.cost_univalent)){
						this.sale.gross_profit = this.sale.gross_profit?this.sale.gross_profit:this.mul(this.sale.sale_num,this.sub(this.sale.sale_price,this.sale.cost_univalent),2);
					}
					if(!this.isEmpty(this.sale.accounting_cost)){
						this.sale.real_gross_profit = this.sale.real_gross_profit?this.sale.real_gross_profit:this.mul(this.sale.sale_num,this.sub(this.sale.sale_price,this.sale.accounting_cost),2);
					}
         	callback();
				}
			};
			var validateMoney = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
        if (value && !reg.test(value)) {
          	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
					if(!this.isEmpty(value)){
						if(!this.isEmpty(this.sale.cost_univalent)){
							this.sale.gross_profit = this.sale.gross_profit?this.sale.gross_profit:this.mul(this.sale.sale_num,this.sub(this.sale.sale_price,this.sale.cost_univalent),2);
						}
						if(!this.isEmpty(this.sale.accounting_cost)){
							this.sale.real_gross_profit = this.sale.real_gross_profit?this.sale.real_gross_profit:this.mul(this.sale.sale_num,this.sub(this.sale.sale_price,this.sale.accounting_cost),2);
						}
					}
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
				sales:[],
				tags:[],//标签
				contacts:[],
				business:[],
				pageNum:10,
				currentPage:1,
				count:0,
				hospitals:[],
				money:0,//销售总额
				realGrossProfit:0,
				grossProfit:0,
				params:{//查询参数
					product_makesmakers:"",
					productCommonName:"",
					salesTime:[],
					hospitalsId:"",
					productType:"",
					sale_type:"",
					business:"",
					contactId:"",
					product_code:"",
					tag:"",
					rate_gap:0,
					rate_formula:"<=",
					tag_type:[],
				},
				sale:{},//修改的销售信息
				saleRule:{
					accounting_cost:[{validator: validateMoney,labelname:"核算成本价",trigger: 'blur' }],
					cost_univalent:[{validator: validateMoney,labelname:"成本单价",trigger: 'blur' }],
					sale_num:[{validator: validateNum,trigger: 'blur' }],
					bill_date:[{ required: true, message: '请选择销售时间', trigger: 'blur,change' }],
					hospital_id:[{ required: true, message: '请选择销售机构', trigger: 'blur,change' }],
				},
				dialogFormVisible:false,
				dialogFormVisibleImport:false,
				loading:false,
				authCode:"",
				importSalesUrl:"",
				loadingImport:false,
				uploadButtom:"导入销售记录",
				errorMessage:"",
			}
		},
		activated(){
			this.getSalesList();
			this.getHospitals();
			this.getContacts();
			this.getProductBusiness();
			this.getTags();
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){
			this.importDrugsUrl = this.$bus.data.host + "/iae/sales/importSales";
		},
		methods:{
			hospitalChange(val){
				var _self = this;
				_self.sale.hospital_policy_return_money = "";
				this.jquery("/iae/hospitalpolicyrecorddrugs/getHospitalPolicyById",{
					hospitalId:val,
					drugId:_self.sale.product_id
				},function(res){//查询商业
					_self.sale.sale_price = res.message?res.message.hospital_policy_price:_self.sale.sale_price;
					_self.sale.product_return_money = res.message?res.message.hospital_policy_return_money:"";
					if(!_self.isEmpty(_self.sale.sale_price) && !_self.isEmpty(_self.sale.sale_num)){
						_self.sale.sale_money = _self.mul(_self.sale.sale_price,_self.sale.sale_num,2);
					}
				});
			},
			downloadTemplate(){
				window.location.href=this.$bus.data.host+"/download/template_sales.xlsx";
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
			importDrugsSuccess(response, file, fileList){
				this.uploadButtom="导入销售记录";
				this.loadingImport = false;
				var downloadErrorMessage = "<a style='color:red;' href='"+this.$bus.data.host+"/iae/sales/downloadErrorSales'>下载错误数据</a>";
				this.errorMessage = response.message+downloadErrorMessage;
			},
			getTags(){
				var _self = this;
				this.jquery("/iae/tag/getAllTags",null,function(res){//查询商业
					_self.tags=res.message.tagAll;
				});
			},
			getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种','佣金品种']},function(res){
	        _self.contacts = res.message;
	      });
	    },
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
			exportExcel(){
				// this.params.tag = this.params.tag_type[1];
				var url = this.$bus.data.host + "/iae/sales/exportSales";
				this.download(url,this.params);
			},
			formatterType(row, column, cellValue){
				return cellValue=='1'?"销售出库":(cellValue=='2'?"销售退回":"销售退补价");
			},
			formatterOtherMoney(row, column, cellValue){
				if(row.product_type != '其它'){
					return cellValue;
				}else{
					return "-";
				}
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
			formatterRealProfitRate(row, column, cellValue){
				if(!this.isEmpty(row.real_gross_profit) && !this.isEmpty(row.sale_money) &&
					 row.real_gross_profit > 0 && row.sale_money > 0){
					return this.mul(this.div(row.real_gross_profit,row.sale_money,4),100)+"%";
				}else{
					return "";
				}

			},
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				var temp = JSON.stringify(scope.row);
				this.sale = JSON.parse(temp);
				this.sale.front_sale = temp;
				this.sale.sale_return_price=this.sale.sale_return_price?this.sale.sale_return_price:this.sale.sale_policy_money;
			  this.sale.sale_contact_id=this.sale.sale_contact_id?this.sale.sale_contact_id:this.sale.sale_policy_contact_id;
				// this.sale.sale_return_money = this.mul(this.sale.sale_return_price,scope.row.sale_num,2);
				this.sale.sale_num_temp = this.sale.sale_num;
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
				this.jquery('/iae/sales/deleteSales',{
					sale_id:scope.row.sale_id,
					delete_flag:"",
					product_type:scope.row.product_type,
					stock:scope.row.stock,
					product_id:scope.row.product_id,
					sale_num:scope.row.sale_num,
					sales_purchase_id:scope.row.sales_purchase_id
				},function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getSalesList();
					_self.dialogFormVisible = false;
				});
			},
			//跳转到编辑页面
			add(){
				sessionStorage["hospitals"] = JSON.stringify(this.hospitals);
				sessionStorage["business"] = JSON.stringify(this.business);
				this.$router.push("/main/salesdrugs");
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getSalesList();
			},
			getHospitals(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'销售单位'},function(res){
						_self.hospitals = res.message;
				});
			},
			getSalesList(){
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
				this.params.tag = this.params.tag_type[1];
        this.jquery('/iae/sales/getSales',{
					data:_self.params,
          page:page
        },function(res){
						_self.money = (res.message.saleMoney+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						_self.realGrossProfit = (res.message.realGrossProfit+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						_self.grossProfit = (res.message.grossProfit+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _self.sales = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			editSales(formName){
				var _self = this;
				this.sale.gross_profit = 0;
				this.sale.real_gross_profit= 0;
				if(!this.isEmpty(this.sale.cost_univalent)){
					this.sale.gross_profit = this.mul(this.sale.sale_num,this.sub(this.sale.sale_price,this.sale.cost_univalent),2);
				}
				if(!this.isEmpty(this.sale.accounting_cost)){
					this.sale.real_gross_profit = this.mul(this.sale.sale_num,this.sub(this.sale.sale_price,this.sale.accounting_cost),2);
				}
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/sales/editSales',_self.sale,function(res){
								_self.dialogFormVisible = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getSalesList();
							});
						} else {
							return false;
						}
				});
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getSalesList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getSalesList();
    	}
		}
	});
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
