<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" size="small" @keyup.13.native="reSearch(false)" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" @keyup.13.native="reSearch(false)" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
		  <el-form-item label="联系人" prop="contactId">
		    <el-select v-model="params.contactId" filterable size="small" placeholder="请选择">
			    <el-option v-for="item in contacts"
			      :key="item.contacts_id"
			      :label="item.contacts_name"
			      :value="item.contacts_id">
			    </el-option>
				</el-select>
		  </el-form-item>
			<el-form-item label="备货状态" prop="status">
		    <el-select v-model="params.status" size="small" placeholder="请选择">
					<el-option key="1" label="未打款" value="1"></el-option>
					<el-option key="2" label="打款,未发货" value="2"></el-option>
					<el-option key="3" label="发货,未入库" value="3"></el-option>
					<el-option key="4" label="已入库" value="4"></el-option>
				</el-select>
		  </el-form-item>
			<el-form-item label="备货时间" prop="time">
				<el-date-picker v-model="params.time" type="daterange" size="small" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
 		 	</el-form-item>
			<el-form-item label="备注" prop="remark">
				<el-select v-model="params.remark" filterable size="small" style="width:300px;" placeholder="请选择">
				 <el-option v-for="item in remarks"
					 :key="item.remark" :label="item.remark" :value="item.remark">
				 </el-option>
			 </el-select>
		 </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-show="authCode.indexOf('76') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="small">查询</el-button>
				<el-button type="primary" @click="reSearch(true)" size="small">重置</el-button>
		    <el-button type="primary" v-show="authCode.indexOf('73') > -1"  @click="add" size="small">新增</el-button>
				<el-button type="primary" v-show="authCode.indexOf('77') > -1"  @click="exportExcel" size="small">导出</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money_purchase">
			<a>采购总额：</a>{{money}} <span>元</span>
		</div>
		<el-table :data="purchases" style="width: 100%" :stripe="true" :border="true">
				<el-table-column fixed prop="time" label="备货时间" width="90" :formatter="formatterDate"></el-table-column>
  			<el-table-column fixed prop="product_common_name" label="产品通用名" width="150"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生厂企业" width="200"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
				<el-table-column prop="purchase_number" label="购入数量" width="90"></el-table-column>
				<el-table-column prop="purchase_money" label="购入金额" width="90"></el-table-column>
				<el-table-column prop="purchase_mack_price" label="打款价" width="80"></el-table-column>
				<el-table-column prop="purchase_price" label="中标价" width="80"></el-table-column>
				<el-table-column prop="puchase_gross_rate" label="毛利率" width="80" :formatter="formatPercent"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="80"></el-table-column>
				<el-table-column prop="make_money_time" label="打款时间" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="send_out_time" label="发货时间" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="storage_time" label="入库时间" width="120" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="remark" label="备注" width="200"></el-table-column>
				<el-table-column fixed="right" prop="remark" label="备货状态" width="80">
					<template slot-scope="scope">
						<el-tag type="success" v-show="scope.row.storage_time">已入库</el-tag>
						<el-tag type="info" v-show="scope.row.make_money_time && !scope.row.send_out_time">未发货</el-tag>
						<el-tag type="warning" v-show="scope.row.send_out_time && !scope.row.storage_time">未入库</el-tag>
						<el-tag type="danger" v-show="!scope.row.make_money_time">未打款</el-tag>
					</template>
				</el-table-column>
  			<el-table-column fixed="right" label="操作" width="130">
			    <template slot-scope="scope">
				    <el-button v-show="authCode.indexOf('74') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="small"></el-button>
		        <el-button v-show="authCode.indexOf('75') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
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
		<el-dialog title="修改备货记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+purchase.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{purchase.product_code}}</div>
			    <div><span>产品规格:</span>{{purchase.product_specifications}}</div>
					<div><span>中标价:</span>{{purchase.purchase_price}}</div>
					<div><span>包装:</span>{{purchase.product_packing}}</div>
					<div><span>单位:</span>{{purchase.product_unit}}</div>
					<div><span>打款价:</span>{{purchase.purchase_mack_price}}</div>
					<div style="display:block;width:100%;"><span>生产产家:</span>{{purchase.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="purchase" ref="purchase" status-icon :rules="purchaseRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="购入数量" prop="purchase_number" :required="true">
					<el-input v-model="purchase.purchase_number" :maxlength="10" placeholder="请输入购入数量"></el-input>
				</el-form-item>
				<el-form-item label="购入金额" prop="purchase_money">
					<el-input v-model="purchase.purchase_money" :readonly="true"></el-input>
				</el-form-item>
				<el-form-item label="备货时间" prop="time">
					<el-date-picker v-model="purchase.time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="打款时间" prop="make_money_time">
					<el-date-picker v-model="purchase.make_money_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="发货时间" prop="send_out_time">
					<el-date-picker v-model="purchase.send_out_time" style="width:179px;" type="date" placeholder="请选择发货时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="入库时间" prop="storage_time">
					<el-date-picker v-model="purchase.storage_time" style="width:179px;" type="date" placeholder="请选择入库时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
				<el-autocomplete popper-class="my-autocomplete" style="width:300px;"
					 v-model="purchase.remark"
					 :fetch-suggestions="querySearch"
					 placeholder="备注" @select="handleSelect">
					 <template slot-scope="{ item }">
						 <div class="name">{{ item.remark }}</div>
					 </template>
				</el-autocomplete>
			 </el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="editPurchases('purchase')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validateNum = (rule, value, callback) => {
				var regu = /^\+?[1-9][0-9]*$/;
				if (value === '') {
					callback(new Error('请输入购入数量'));
				} else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
					this.purchase.purchase_money = this.purchase.purchase_number * this.purchase.purchase_mack_price;
					this.purchase.purchase_money = this.purchase.purchase_money.toFixed(2);
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
				purchases:[],
				purchase:{},
				contacts:[],
				money:0,//总额统计
				pageNum:10,
				currentPage:1,
				count:0,
				remarks:[],
				dialogFormVisible:false,
				params:{
					productCommonName:"",
					contactId:"",
					time:[defaultStart,defaultEnd],
					product_code:"",
					status:"",
					remark:"",
				},
				purchaseRule:{
					purchase_number:[{validator:validateNum,trigger: 'blur' }],
					time:[{ required: true, message: '请选择备货时间', trigger: 'blur,change' }]
				},
				authCode:"",
			}
		},
		activated(){
			this.getContacts();
			this.getPurchaseRemarks();
			this.getPurchasesList();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			formatPercent(row, column, cellValue, index){
				if(cellValue){
					return cellValue+" %";
				}else{
					return "-";
				}
			},
			exportExcel(){
				var url = this.$bus.data.host + "/iae/purchase/exportPurchases?1=1";
				if(this.params.productCommonName){
			    url+="&name="+this.params.productCommonName
			  }
				if(this.params.time){
			    var start = new Date(this.params.time[0]).format("yyyy-MM-dd");
			    var end = new Date(this.params.time[1]).format("yyyy-MM-dd");
					url+="&start="+start+"&end="+end;
			  }
				if(this.params.contactId){
			    url+="&contactId="+this.params.contactId;
			  }
				if(this.params.product_code){
			    url+="&product_code="+this.params.product_code;
			  }
				if(this.params.contactId){
			    url+="&status="+this.params.status;
			  }
				if(this.params.remark){
			    url+="&remark="+this.params.remark;
			  }
				window.location = url;
			},
			handleSelect(item) {
				this.purchase.remark = item.remark;
      },
			querySearch(queryString, cb) {
        var remarks = this.remarks;
        var results = queryString ? remarks.filter(this.createFilter(queryString)) : remarks;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
			createFilter(queryString) {
        return (remarks) => {
          return (remarks.remark.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
        };
      },
			editPurchases(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							_self.jquery('/iae/purchase/editPurchase',_self.purchase,function(res){
								_self.dialogFormVisible = false;
								_self.$message({message: '修改成功',type: 'success'});
								_self.getPurchasesList();
							});
						} else {
							return false;
						}
				});
			},
			getContacts(){
				var _self = this;
				this.jquery('/iae/contacts/getAllContacts',{group_id:0},function(res){
					_self.contacts = res.message;
				});
			},
			formatterDate(row, column, cellValue){
				if(cellValue){
					var temp = cellValue.substring(0,10);
					var d = new Date(temp);
					d.setDate(d.getDate()+1);
					return d.format("yyyy-MM-dd");
				}else{
					return "";
				}

			},
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				this.purchase = scope.row;
				this.purchase.purchase_number_temp = scope.row.purchase_number;
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
				this.jquery('/iae/purchase/deletePurchases',{
					purchase_id:scope.row.purchase_id,
					delete_flag:"",
					storage_time:scope.row.storage_time,
					product_id:scope.row.product_id,
					stock:scope.row.stock,
					purchase_number:scope.row.purchase_number
				},function(res){
					_self.$message({message: '删除成功',type: 'success'});
					_self.getPurchasesList();
					_self.dialogFormVisible = false;
				});
			},
			//跳转到编辑页面
			add(){
				sessionStorage["remarks"] = JSON.stringify(this.remarks);
				this.$router.push("/main/purchasedrugs");
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getPurchasesList();
			},
			getPurchaseRemarks(){
				var _self = this;
				this.jquery('/iae/purchase/getPurchaseRemarks',null,function(res){
						_self.remarks = res.message;
				});
			},
			getPurchasesList(){
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
				this.jquery('/iae/purchase/getPurchases',{
					data:_self.params,
					page:page
				},function(res){
						_self.purchases = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
						_self.money = res.message.purchaseMoney.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				});
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getPurchasesList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getPurchasesList();
    	}
		}
	});
</script>
<style>
	.sum_money_purchase > a{
		padding-left: 20px;
		color: #606266;
	}
	.sum_money_purchase > span{
		color:#606266;
	}
	.sum_money_purchase .more_detail{
		position: absolute;
		right: 10px;
		height: 30px;
		line-height: 30px;
		color: #409EFF;
		text-decoration: none;
	}
	.sum_money_purchase{
		position: relative;
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		color:#f24040;
		line-height: 30px;
		font-size: 14px;
	}
	.main_content .el-date-editor--daterange{
		width: 310px !important;
	}
	.main_content .el-date-editor--daterange > input{
		width: 37% !important;
	}
</style>
