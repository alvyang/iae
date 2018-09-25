<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:178px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" style="width:178px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编号"></el-input>
		  </el-form-item>
			<el-form-item label="　联系人" prop="contactId">
        <el-select v-model="params.contactId" style="width:178px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts"
            :key="item.contacts_id"
            :label="item.contacts_name"
            :value="item.contacts_id">
          </el-option>
        </el-select>
      </el-form-item>
			<el-form-item label="品种类型" prop="productType">
				 <el-select v-model="params.productType" style="width:178px;" size="mini" multiple placeholder="请选择">
					 <el-option key="普药" label="普药" value="普药"></el-option>
					 <el-option key="佣金" label="佣金" value="佣金"></el-option>
					 <el-option key="高打" label="高打" value="高打"></el-option>
					 <el-option key="高打(底价)" label="高打(底价)" value="高打(底价)"></el-option>
					 <el-option key="其它" label="其它" value="其它"></el-option>
				 </el-select>
			 </el-form-item>
			<el-form-item label="销售机构" prop="hospitalsId">
			 <el-select v-model="params.hospitalsId" style="width:178px;" filterable size="mini" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option v-for="item in hospitals"
					 :key="item.hospital_id"
					 :label="item.hospital_name"
					 :value="item.hospital_id">
				 </el-option>
		 	</el-select>
		 </el-form-item>
		 <el-form-item label="销售类型" prop="sale_type">
			 <el-select v-model="params.sale_type" style="width:178px;" size="mini" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option key="1" label="销售出库" value="1"></el-option>
				 <el-option key="2" label="销售退回" value="2"></el-option>
				 <el-option key="3" label="销售退补价" value="3"></el-option>
			 </el-select>
		 </el-form-item>
		 <el-form-item label="　　日期" prop="salesTime">
			 <el-date-picker v-model="params.salesTime" type="daterange" size="mini" align="right" unlink-panels
				 range-separator="至"
				 start-placeholder="开始日期"
				 end-placeholder="结束日期"
				 :picker-options="pickerOptions2">
			 </el-date-picker>
		 </el-form-item>
		 <el-form-item label="　　商业" prop="business">
			 <el-select v-model="params.business" style="width:178px;" size="mini" filterable placeholder="请选择商业">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option v-for="item in business"
					 :key="item.business_id"
					 :label="item.business_name"
					 :value="item.business_id"></el-option>
			 </el-select>
		 </el-form-item>
	   <el-form-item>
	     <el-button type="primary" v-dbClick v-show="authCode.indexOf('51') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf('51') > -1" @click="reSearch(true)" size="mini">重置</el-button>
	     <el-button type="primary" v-dbClick v-show="authCode.indexOf('48') > -1" @click="add" size="mini">新增</el-button>
			 <el-button type="primary" v-dbClick v-show="authCode.indexOf('52') > -1" @click="exportExcel" size="mini">导出</el-button>
	   </el-form-item>
		</el-form>
		<div class="sum_money">销售总额：<a>{{money}}</a> 元；真实毛利：<a>{{realGrossProfit}}</a> 元；毛利：<a>{{grossProfit}}</a> 元</div>
		<el-table :data="sales" style="width: 100%" size="mini" :stripe="true" :border="true">
  			<el-table-column fixed prop="bill_date" label="日期" width="80" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="hospital_name" label="医院名称" width="140"></el-table-column>
				<el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
				<el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
				<el-table-column prop="business_name" label="商业" width="60"></el-table-column>
				<el-table-column prop="sale_price" label="中标价" width="60"></el-table-column>
				<el-table-column prop="sale_num" label="计划数量" width="70"></el-table-column>
				<el-table-column prop="sale_money" label="购入金额" width="70"></el-table-column>
				<el-table-column prop="real_gross_profit" label="真实毛利" width="80"></el-table-column>
				<el-table-column prop="accounting_cost" label="核算成本" width="80"></el-table-column>
				<el-table-column prop="gross_profit" label="毛利" width="80"></el-table-column>
				<el-table-column prop="cost_univalent" label="成本单价" width="80"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
			    <el-button @click.native.prevent="deleteRow(scope)" v-dbClick v-show="authCode.indexOf('50') > -1"  icon="el-icon-delete" type="primary" size="mini"></el-button>
	        <el-button @click.native.prevent="editRow(scope)" v-dbClick v-show="authCode.indexOf('49') > -1"  icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
					<div style="display:block;width:100%;"><span>生产产家:</span>{{sale.product_makesmakers}}</div>
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
				<el-form-item label="计划数量" prop="sale_num" :maxlength="10" :required="true" >
					<el-input v-model="sale.sale_num" style="width:194px;" placeholder="请输入计划数量"></el-input>
				</el-form-item>
				<el-form-item label="购入金额" prop="sale_money">
					<el-input v-model="sale.sale_money" style="width:194px;"></el-input>
				</el-form-item>
				<el-form-item label="销售机构" prop="hospital_id">
					<el-select v-model="sale.hospital_id" style="width:194px;" filterable placeholder="请选择销售机构">
						<el-option v-for="item in hospitals"
							:key="item.hospital_id"
							:label="item.hospital_name"
							:value="item.hospital_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="销售日期" prop="bill_date">
					<el-date-picker v-model="sale.bill_date" style="width:194px;" type="date" placeholder="请选择销售时间"></el-date-picker>
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
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="small" v-dbClick :loading="loading" @click="editSales('sale')">确 定</el-button>
      </div>
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
					this.sale.sale_money = this.mul(this.sale.sale_num,this.sale.sale_price,2);
					this.sale.gross_profit = this.sub(this.sale.sale_money,this.mul(this.sale.sale_num,this.sale.cost_univalent),2);
					this.sale.real_gross_profit = this.sub(this.sale.sale_money,this.mul(this.sale.sale_num,this.sale.accounting_cost),2);
         	callback();
				}
			};
			var validateMoney = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
        if (value && !reg.test(value)) {
          	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
					if(value){
						this.sale.gross_profit = this.sub(this.sale.sale_money,this.mul(this.sale.sale_num,this.sale.cost_univalent),2);
						this.sale.real_gross_profit = this.sub(this.sale.sale_money,this.mul(this.sale.sale_num,this.sale.accounting_cost),2);
					}
         	callback();
        }
    	};
			const defaultEnd = new Date();
			const defaultStart = new Date(defaultEnd.getFullYear()+"-01"+"-01");
			return {
				pickerOptions2: {
					shortcuts: [{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				sales:[],
				contacts:[],
				business:[],
				pageNum:10,
				currentPage:1,
				count:0,
				hospitals:[],
				money:'',//销售总额
				realGrossProfit:'',
				grossProfit:'',
				params:{//查询参数
					productCommonName:"",
					salesTime:[defaultStart,defaultEnd],
					hospitalsId:"",
					productType:"",
					sale_type:"",
					business:"",
					contactId:"",
					product_code:"",
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
				loading:false,
				authCode:"",
			}
		},
		activated(){
			this.getSalesList();
			this.getHospitals();
			this.getContacts();
			this.getProductBusiness();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0},function(res){
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
				var url = this.$bus.data.host + "/iae/sales/exportSales?1=1";
				if(this.params.productCommonName){
			    url+="&name="+this.params.productCommonName
			  }
			  if(this.params.productType){
			    var type = this.params.productType;
			    var t = "";
			    for(var i = 0 ; i < type.length ; i++){
			      t+="'"+type[i]+"',"
			    }
			    t = t.substring(0,t.length-1);
			    url+="&type="+t;
			  }
			  if(this.params.hospitalsId){
			    url+="&id="+this.params.hospitalsId;
			  }
			  if(this.params.salesTime){
			    var start = new Date(this.params.salesTime[0]).format("yyyy-MM-dd");
			    var end = new Date(this.params.salesTime[1]).format("yyyy-MM-dd");
					url+="&start="+start+"&end="+end;
			  }
				window.location = url;
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
				this.sale = scope.row;
				this.sale.sale_num_temp = scope.row.sale_num;
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
					sale_num:scope.row.sale_num
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
				this.jquery('/iae/hospitals/getAllHospitals',null,function(res){
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
				this.sale.gross_profit = this.sale.cost_univalent*this.sale.sale_num;
				this.sale.gross_profit = this.sale.gross_profit.toFixed(2);
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
	.main_content .el-date-editor--daterange{
		width: 310px !important;
	}
	.main_content .el-date-editor--daterange > input{
		width: 37% !important;
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
