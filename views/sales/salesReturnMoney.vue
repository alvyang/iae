<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售应付管理</el-breadcrumb-item>
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
		 <el-form-item label="付积分日期" prop="salesReturnTime">
			<el-date-picker v-model="params.salesReturnTime" type="daterange" style="width:196px !important;" size="mini" align="right" unlink-panels
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
		 <el-form-item label="积分状态" prop="sale_return_flag">
			 <el-select v-model="params.sale_return_flag" style="width:210px;" size="mini" filterable placeholder="请选择积分状态">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option key="未付" label="未付" value="未付"></el-option>
				 <el-option key="已付" label="已付" value="已付"></el-option>
			 </el-select>
		 </el-form-item>
		 <el-form-item label="是否设置政策" prop="salesReturnFlag">
			 <el-select v-model="params.salesReturnFlag" style="width:182px;" size="mini" filterable placeholder="请选择是否设置政策">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option key="flag" label="已设置" value="flag"></el-option>
			 </el-select>
		 </el-form-item>
	   <el-form-item>
	     <el-button type="primary" v-dbClick v-show="authCode.indexOf(',127,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',127,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf(',136,') > -1" @click="exportSaleReturn" size="mini">导出</el-button>
	   </el-form-item>
		</el-form>
		<div class="sum_money">应付积分：<a>{{saleReturnMoney}}</a> 已付积分：<a>{{saleReturnMoney1}}</a> 未付积分：<a>{{saleReturnMoney2}}</a></div>
		<el-table :data="sales" style="width: 100%" size="mini" :height="tableHeight" :stripe="true" :border="true">
  			<el-table-column fixed prop="bill_date" label="日期" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="contacts_name" label="业务员" width="60"></el-table-column>
				<el-table-column prop="sale_type" label="销售类型" width="60" :formatter="formatterType"></el-table-column>
				<el-table-column prop="product_type" label="品种类型" width="60"></el-table-column>
				<el-table-column prop="sale_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="sale_num" label="销售数量" width="70"></el-table-column>
				<el-table-column prop="sale_money" label="购入金额" width="70"></el-table-column>
				<el-table-column prop="batch_number" label="批号" width="70"></el-table-column>
				<el-table-column prop="refunds_real_time" label="实收上游时间" width="70" :formatter="formatterDate"></el-table-column>
				<el-table-column label="实收上游积分(单价)" width="70" :formatter="formatterReturnMoney"></el-table-column>
				<el-table-column prop="sale_return_price" label="政策积分" width="70" ></el-table-column>
				<el-table-column prop="sale_other_money" label="补点/费用票" width="80"></el-table-column>
				<el-table-column prop="sale_return_money" label="应付积分" width="70"></el-table-column>
				<!-- <el-table-column prop="sale_return_money" label="应付积分-费用票" width="70" :formatter="formatterShouldMoney"></el-table-column> -->
				<el-table-column prop="sale_return_real_return_money" label="实付积分" width="70"></el-table-column>
				<el-table-column prop="sale_return_real_return_money" label="未付积分" width="70" :formatter="formatterNoPay"></el-table-column>
				<el-table-column prop="sale_return_time" label="付积分时间" width="70" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="sale_account_name" label="收积分账户名" width="80" ></el-table-column>
				<el-table-column prop="sale_account_number" label="收积分账户" width="80" ></el-table-column>
				<el-table-column prop="sale_account_address" label="收积分账户地址" width="80"></el-table-column>
				<el-table-column prop="sale_remark" label="备注" width="70"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="60">
		    <template slot-scope="scope">
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf(',128,') > -1"  icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog title="修改销售积分记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+sale.product_common_name+ '）'" name="1">
			    <div><span>产品编号:</span>{{sale.product_code}}</div>
			    <div><span>产品规格:</span>{{sale.product_specifications}}</div>
					<div><span>中标价:</span>{{sale.sale_price}}</div>
					<div><span>包装:</span>{{sale.product_packing}}</div>
					<div><span>单位:</span>{{sale.product_unit}}</div>
					<div><span>积分:</span>{{sale.product_return_money}}</div>
					<div style="display:block;width:100%;"><span>生产厂家:</span>{{sale.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="sale" status-icon :rules="saleRule" style="margin-top:20px;" :inline="true" ref="sale" label-width="100px" class="demo-ruleForm">
				<el-form-item label="政策公式" prop="sale_should_pay_formula">
					<el-select v-model="sale.sale_should_pay_formula" style="width:472px;" @change="formulaChange"  placeholder="请选择">
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
				<el-form-item label="政策点数" prop="sale_should_pay_percent" :maxlength="10" v-show="sale.sale_should_pay_formula != '8'">
					<el-input v-model="sale.sale_should_pay_percent" style="width:179px;" @blur='formulaChange'  placeholder="政策点数（如：60）"></el-input>
				</el-form-item>
				<el-form-item label="政策积分" prop="sale_return_price">
					<el-input v-model="sale.sale_return_price" style="width:179px;" placeholder="政策积分" @blur='formulaChange'></el-input>
				</el-form-item>
				<el-form-item label="补点/费用票" prop="sale_other_money">
					<el-input v-model="sale.sale_other_money" placeholder="补点/费用票" :readonly="true" style="width:179px;"></el-input>
				</el-form-item>
				<el-form-item label="应付积分" prop="sale_return_money">
					<el-input v-model="sale.sale_return_money" placeholder="应付积分" :readonly="true"  style="width:179px;"></el-input>
				</el-form-item>
				<el-form-item label="实付积分" prop="sale_return_real_return_money">
					<el-input v-model="sale.sale_return_real_return_money" placeholder="实付积分" style="width:179px;"></el-input>
				</el-form-item>
				<el-form-item label="付积分账号" prop="sale_account_id">
					<el-select v-model="sale.sale_account_id" style="width:179px;" filterable placeholder="请选择">
						<el-option v-for="item in accounts"
							:key="item.account_id"
							:label="item.account_number"
							:value="item.account_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="付积分时间" prop="sale_return_time">
					<el-date-picker v-model="sale.sale_return_time" style="width:179px;" type="date" placeholder="请选择付积分时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="业务员" prop="sale_contact_id">
				 <el-select v-model="sale.sale_contact_id" style="width:179px;" @change="selectSalesContact"  filterable placeholder="请选择">
					 <el-option key="" label="" value=""></el-option>
					 <el-option v-for="item in contacts"
						 :key="item.contacts_id"
						 :label="item.contacts_name"
						 :value="item.contacts_id">
					 </el-option>
				 </el-select>
			 </el-form-item>
			 <el-form-item label="收积分账号名" prop="sale_account_name">
				 <el-input v-model="sale.sale_account_name" style="width:179px;" placeholder="收积分账号名"></el-input>
			 </el-form-item>
			 <el-form-item label="收积分账号" prop="sale_account_number">
				 <el-input v-model="sale.sale_account_number" style="width:179px;" placeholder="收积分账号"></el-input>
			 </el-form-item>
			 <el-form-item label="收积分地址" prop="sale_account_address">
				 <el-input v-model="sale.sale_account_address" style="width:179px;" placeholder="收积分地址"></el-input>
			 </el-form-item>
				<el-form-item label="备注" prop="sale_remark">
					<el-input v-model="sale.sale_remark" style="width:179px;" placeholder="备注"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
				<div style='color:#f24040;font-size:12px;padding-bottom:5px;' v-show="remindFlag">
					温馨提示：应付积分大于实收上游积分（{{remindMoney}}）
				</div>
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editSales('sale')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
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
				contacts:[],
				business:[],
				accounts:[],
				pageNum:20,
				currentPage:1,
				count:0,
				hospitals:[],
				saleReturnMoney:0,//总总额
				saleReturnMoney1:0,//已付金额
				saleReturnMoney2:0,//未付金额
				params:{//查询参数
					productCommonName:"",
					salesTime:[],
					salesReturnTime:[],
					hospitalsId:"",
					sale_type:"",
					business:"",
					sale_contact_id:"",
					product_code:"",
					salesReturnFlag:"",
					sale_return_flag:"",
					productType:['佣金','高打'],
				},
				sale:{},//修改的销售信息
				saleRule:{

				},
				dialogFormVisible:false,
				loading:false,
				authCode:"",
				selectContact:{},
				remindFlag:false,//应付积分是否大于实收上游积分
				remindMoney:0,//实收上游积分
				tableHeight:0
			}
		},
		updated(){
			this.tableHeight = $(window).height() - 200 - $(".search").height();
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 200 - $(".search").height();
			});
    },
		activated(){
			this.getSalesList();
			this.getHospitals();
			this.getContacts();
			this.getProductBusiness();
			this.getBankAccount();
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			formulaChange(){
				var shouldPay = 0;
				var formula = this.sale.sale_should_pay_formula;
        // if(this.sale.sale_should_pay_percent){
					var realReturnMoney = "",t=0;
					if(this.sale.product_type == '佣金'){
						realReturnMoney = this.sale.refunds_real_money/this.sale.sale_num;
						t = this.sale.sale_other_money/this.sale.sale_num;
					}else if(this.sale.product_type == '高打'){
						realReturnMoney = this.sale.refunds_real_money1/this.sale.purchase_number;
						t	= this.sale.purchase_other_money?this.sale.purchase_other_money/this.sale.purchase_number:0;
						this.sale.sale_other_money = Math.round(t*this.sale.sale_num*100)/100;
					}
					realReturnMoney = realReturnMoney?realReturnMoney:this.sale.product_return_money;

					this.sale.sale_return_price = this.getShouldPayMoney(formula,this.sale.sale_price,realReturnMoney,this.sale.sale_should_pay_percent,0,this.sale.sale_return_price);
					this.sale.sale_return_price = Math.round(this.sale.sale_return_price*100)/100;
					shouldPay = this.getShouldPayMoney(formula,this.sale.sale_price,realReturnMoney,this.sale.sale_should_pay_percent,t,this.sale.sale_return_price);
				// }
				this.sale.sale_return_money = this.mul(shouldPay,this.sale.sale_num,2);
      },
			selectSalesContact(val){
				this.selectContact={};
				for(var i = 0 ; i < this.contacts.length;i++){
					if(this.contacts[i].contacts_id == val){
						this.selectContact = this.contacts[i];
					}
				}
			},
			getBankAccount(){
				var _self = this;
				this.jquery("/iae/bankaccount/getAllAccounts",null,function(res){//查询账号
					_self.accounts=res.message;
				});
			},
			getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['业务员']},function(res){
	        _self.contacts = res.message;
	      });
	    },
			getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
			formatterNoPay(row, column, cellValue){
				var t = row.sale_return_money - row.sale_return_real_return_money;
				if(!this.isEmpty(t)){
					return Math.round(t*100)/100;
				}else{
					return 0;
				}
			},
			formatterShouldPay(row, column, cellValue){
				if(row.product_type == '佣金' && !this.isEmpty(row.sale_other_money)){
					row.other_money_temp = row.sale_other_money;
				}else if(row.product_type == '高打' && !this.isEmpty(row.purchase_other_money)){
					var temp = (row.purchase_other_money/row.purchase_number)*row.sale_num;
					row.other_money_temp = Math.round(temp*100)/100;
				}else{
					row.other_money_temp = 0;
				}
				var t = row.sale_return_price*row.sale_num - row.other_money_temp;
				t = Math.round(t*100)/100;
				if(cellValue != t){
					row.sale_return_money = t;
					return t;
				}else{
					return cellValue;
				}
			},
			formatterOtherMoney(row, column, cellValue){
				if(row.product_type == '佣金' && !this.isEmpty(row.sale_other_money)){
					row.other_money_temp = row.sale_other_money;
					return	row.sale_other_money;
				}else if(row.product_type == '高打' && !this.isEmpty(row.purchase_other_money)){
					var temp = (row.purchase_other_money/row.purchase_number)*row.sale_num;
					row.other_money_temp = Math.round(temp*100)/100;
					return Math.round(temp*100)/100;
				}else{
					return 0;
				}
			},
			formatterShouldMoney(row, column, cellValue){
				if(row.product_type == '佣金' && !this.isEmpty(row.sale_other_money)){
					return	row.sale_return_money - row.sale_other_money;
				}else if(row.product_type == '高打' && !this.isEmpty(row.purchase_other_money)){
					var temp = (row.purchase_other_money/row.purchase_number)*row.sale_num;
					return row.sale_return_money - Math.round(temp*100)/100;
				}else{
					return cellValue;
				}
			},
			formatterReturnMoney(row, column, cellValue){
				if(row.product_type == '佣金' && row.refunds_real_time && !this.isEmpty(row.refunds_real_money)){
					return	this.div(row.refunds_real_money+"",row.sale_num+"",2);
				}else if(row.product_type == '高打' && row.refunds_real_time && !this.isEmpty(row.refunds_real_money)){
					return this.div(row.refunds_real_money+"",row.purchase_number+"",2);
				}else{
					return 0;
				}
			},
			formatterType(row, column, cellValue){
				return cellValue=='1'?"销售出库":(cellValue=='2'?"销售退回":"销售退补价");
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
				var temp = JSON.stringify(scope.row);
				this.sale = JSON.parse(temp);
				this.sale.front_sale_pay = temp;
				this.sale.sale_contact_id = this.sale.sale_contact_id?this.sale.sale_contact_id:this.sale.sale_policy_contact_id;
				this.sale.sale_return_price = this.sale.sale_return_price?this.sale.sale_return_price:this.sale.sale_policy_money;
				this.sale.sale_return_money = this.sale.sale_return_money?this.sale.sale_return_money:this.mul(this.sale.sale_return_price,this.sale.sale_num,2);
				this.sale.sale_num_temp = this.sale.sale_num;
				this.selectContact.account_name="";
				this.selectContact.account_number="";
				this.selectContact.account_address="";
				for(var i = 0 ; i < this.contacts.length;i++){
					if(this.contacts[i].contacts_id == this.sale.sale_contact_id){
						var temp = JSON.stringify(this.contacts[i]);
						this.selectContact = JSON.parse(temp);
					}
				}
				this.sale.sale_account_name = this.sale.sale_account_name?this.sale.sale_account_name:this.selectContact.account_name;
				this.sale.sale_account_number = this.sale.sale_account_number?this.sale.sale_account_number:this.selectContact.account_number;
				this.sale.sale_account_address = this.sale.sale_account_address?this.sale.sale_account_address:this.selectContact.account_address;

				this.remindFlag = false;
				if(this.sale.product_type == '佣金' && this.sale.refunds_real_time && !this.isEmpty(this.sale.refunds_real_money)){
					this.remindFlag = this.sale.sale_return_price > this.div(this.sale.refunds_real_money,this.sale.sale_num,2);
					this.remindMoney = this.div(this.sale.refunds_real_money,this.sale.sale_num,2);
				}else if(this.sale.product_type == '高打' && this.sale.refunds_real_time && !this.isEmpty(this.sale.refunds_real_money)){
					this.remindFlag = this.sale.sale_return_price > this.div(this.sale.refunds_real_money,this.sale.purchase_number,2);
					this.remindMoney = this.div(this.sale.refunds_real_money,this.sale.sale_num,2);
				}else{
					this.remindMoney = 0;
					this.remindFlag = true;
				}
				this.dialogFormVisible = true;
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
			exportSaleReturn(){
				var url = this.$bus.data.host + "/iae/salesPolicy/exportSalesRefund";
				this.download(url,this.params);
			},
			getSalesList(){
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
        this.jquery('/iae/salesPolicy/getSalesReturnMoney',{
					data:_self.params,
          page:page
        },function(res){
						_self.saleReturnMoney = (res.message.saleReturnMoney+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						_self.saleReturnMoney1 = (res.message.saleReturnMoney1+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						_self.saleReturnMoney2 = _self.sub(res.message.saleReturnMoney+"",res.message.saleReturnMoney1+"",2);
						_self.saleReturnMoney2 = (_self.saleReturnMoney2+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
							_self.jquery('/iae/salesPolicy/editSalesPay',_self.sale,function(res){
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
	.sum_money{
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		line-height: 30px;
		padding-left: 10px;
		font-size: 14px;
		color:#606266;
	}
	.sum_money a{
		color: #f24040;
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
