<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" size="small" @keyup.13.native="reSearch(false)" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
			<el-form-item label="产品编号" prop="product_code">
		    <el-input v-model="params.product_code" @keyup.13.native="reSearch(false)" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
			<el-form-item label="调货单位" prop="allot_hospital">
				<el-select v-model="params.allot_hospital" style="width:178px;" size="small" filterable placeholder="请选择供货单位">
					<el-option v-for="item in hospitals" :key="item.allot_hospital" :label="item.allot_hospital" :value="item.allot_hospital"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="是否返款" prop="allot_return_flag">
				<el-select v-model="params.allot_return_flag" style="width:178px;" size="small" filterable placeholder="请选择供货单位">
					<el-option key="是" label="是" value="是"></el-option>
					<el-option key="否" label="否" value="否"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="调货时间" prop="allot_time">
				<el-date-picker v-model="params.allot_time" type="daterange" size="small" align="right" unlink-panels
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:picker-options="pickerOptions2">
				</el-date-picker>
 		 	</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-show="authCode.indexOf('76') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="small">查询</el-button>
				<el-button type="primary" @click="reSearch(true)" size="small">重置</el-button>
		    <el-button type="primary" v-show="authCode.indexOf('73') > -1"  @click="add" size="small">新增</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money_allot">
			<a>返款总额：</a>{{money}} <span>元</span>
		</div>
		<el-table :data="allots" style="width: 100%" :stripe="true" :border="true">
				<el-table-column fixed prop="allot_time" label="调货时间" width="90" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="allot_hospital" label="调货单位" width="120"></el-table-column>
				<el-table-column prop="product_code" label="产品通用名" width="150"></el-table-column>
  			<el-table-column prop="product_common_name" label="产品通用名" width="150"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生厂企业" width="200"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
				<el-table-column prop="allot_number" label="数量" width="60"></el-table-column>
				<el-table-column prop="allot_mack_price" label="打款价" width="80"></el-table-column>
				<el-table-column prop="allot_price" label="中标价" width="80"></el-table-column>
				<el-table-column prop="allot_money" label="金额" width="80"></el-table-column>
				<el-table-column prop="allot_return_price" label="返款单价" width="80"></el-table-column>
				<el-table-column prop="allot_return_money" label="返款金额" width="80"></el-table-column>
				<el-table-column prop="allot_return_time" label="返款时间" width="90" :formatter="formatterDate"></el-table-column>
				<el-table-column fixed="right" prop="allot_return_flag" label="是否返款" width="80"></el-table-column>
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
		<el-dialog title="修改调货记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+allot.product_common_name+ '）'" name="2">
			    <div><span>产品编号:</span>{{allot.product_code}}</div>
			    <div><span>产品规格:</span>{{allot.product_specifications}}</div>
					<div><span>中标价:</span>{{allot.product_price}}</div>
					<div><span>包装:</span>{{allot.product_packing}}</div>
					<div><span>单位:</span>{{allot.product_unit}}</div>
					<div><span>打款价:</span>{{allot.product_mack_price}}</div>
					<div><span>返款金额:</span>{{allot.product_return_money}}</div>
					<div style="display:block;width:100%;"><span>生产产家:</span>{{allot.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="allot" ref="allot" status-icon :rules="allotRule" style="margin-top:20px;" :inline="true" label-width="100px" class="demo-ruleForm">
				<el-form-item label="调货时间" prop="allot_time">
					<el-date-picker v-model="allot.allot_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="调货单位" prop="allot_hospital">
					<el-autocomplete popper-class="my-autocomplete" style="width:179px;"
					 v-model="allot.allot_hospital"
					 :fetch-suggestions="querySearch"
					 placeholder="调货单位" @select="handleSelect">
					 <template slot-scope="{ item }">
						 <div class="name">{{ item.allot_hospital }}</div>
					 </template>
					</el-autocomplete>
			  </el-form-item>
				<el-form-item label="调货数量" prop="allot_number" :required="true">
					<el-input v-model="allot.allot_number" :maxlength="10" placeholder="请输入购入数量"></el-input>
				</el-form-item>
				<el-form-item label="调货金额" prop="allot_money">
					<el-input v-model="allot.allot_money" :readonly="true"></el-input>
				</el-form-item>
				<el-form-item label="返款单价" prop="allot_return_price">
					<el-input v-model="allot.allot_return_price"></el-input>
				</el-form-item>
				<el-form-item label="返款金额" prop="allot_return_money">
					<el-input v-model="allot.allot_return_money" :readonly="true"></el-input>
				</el-form-item>
				<el-form-item label="返款时间" prop="allot_return_time">
					<el-date-picker v-model="allot.allot_return_time" style="width:179px;" type="date" placeholder="请选择打款时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="是否返款" prop="allot_return_flag">
					<el-select v-model="allot.allot_return_flag" placeholder="请选择" style="width:179px;" >
						<el-option key="是" label="是" value="是"></el-option>
						<el-option key="否" label="否" value="否"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="editallots('allot')">确 定</el-button>
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
					this.allot.allot_money = this.allot.allot_number * this.allot.allot_price;
					this.allot.allot_money = this.allot.allot_money.toFixed(2);
					if(this.allot.allot_return_price && reg.test(this.allot.allot_return_price)){
						this.allot.allot_return_money = this.allot.allot_return_price * this.allot.allot_number;
						this.allot.allot_return_money =	this.allot.allot_return_money.toFixed(2);
					}
          callback();
        }
      };
			var validateRealReturnMoney = (rule, value, callback) => {
        if(!value && !reg.test(value)){
					callback(new Error('请输入正确的返款单价'));
				} else {
					this.allot.allot_return_money = value * this.allot.allot_number;
					this.allot.allot_return_money =	this.allot.allot_return_money.toFixed(2);
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
				allots:[],
				allot:{},
				hospitals:[],
				money:0,//总额统计
				pageNum:10,
				currentPage:1,
				count:0,
				dialogFormVisible:false,
				params:{
					productCommonName:"",
					allot_hospital:"",
					allot_time:[defaultStart,defaultEnd],
					product_code:"",
					allot_return_flag:""
				},
				allotRule:{
					allot_number:[{validator:validateNum,trigger: 'blur' }],
					allot_return_price:[{validator:validateRealReturnMoney,trigger: 'blur' }],
					allot_time:[{ required: true, message: '请选择调货时间', trigger: 'blur,change' }],
					allot_hospital:[{ required: true, message: '请输入调货单位', trigger: 'blur,change' }]
				},
				authCode:"",
			}
		},
		activated(){
			this.getAllotsList();
			this.getAllotHospitalList();
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		mounted(){

		},
		methods:{
			getAllotHospitalList(){
				var _self = this;
				this.jquery('/iae/allot/getHospitals',null,function(res){
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
          return (hospitals.allot_hospital.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
        };
      },
			editallots(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							_self.jquery('/iae/allot/editAllot',_self.allot,function(res){
								_self.dialogFormVisible = false;
								_self.$message({message: '修改成功',type: 'success'});
								_self.getAllotsList();
							});
						} else {
							return false;
						}
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
				this.allot = scope.row;
				this.allot.allot_number_temp = scope.row.allot_number;
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
					product_type:scope.row.product_type,
					stock:scope.row.stock,
					product_id:scope.row.product_id,
					allot_number:scope.row.allot_number
				},function(res){
					_self.$message({message: '删除成功',type: 'success'});
					_self.getAllotsList();
					_self.dialogFormVisible = false;
				});
			},
			//跳转到编辑页面
			add(){
				this.$router.push("/main/allotdrugs");
				sessionStorage["allot_hospital"]=JSON.stringify(this.hospitals);
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
						_self.money = res.message.returnMoney.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
	.main_content .el-date-editor--daterange{
		width: 310px !important;
	}
	.main_content .el-date-editor--daterange > input{
		width: 37% !important;
	}
</style>
