<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
		  <el-form-item label="产品通用名" prop="productCommonName">
		    <el-input v-model="params.productCommonName" @keyup.13.native="searchDrugsList" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
			<el-form-item label="产品通用名" prop="product_code">
		    <el-input v-model="params.product_code" @keyup.13.native="searchDrugsList" size="small" placeholder="产品通用名"></el-input>
		  </el-form-item>
		  <el-form-item label="联系人" prop="contactId">
		    <el-select v-model="params.contactId" size="small" filterable placeholder="请选择">
		    	<el-option key="" label="全部" value=""></el-option>
			    <el-option v-for="item in contacts"
			      :key="item.contacts_id"
			      :label="item.contacts_name"
			      :value="item.contacts_id">
			    </el-option>
			</el-select>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick @click="searchDrugsList" size="small">查询</el-button>
				<el-button type="primary" v-dbClick @click="reSearch" size="small">重置</el-button>
				<el-button type="primary" v-dbClick @click="returnallot" size="small">返回列表</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="drugs" style="width: 100%" :stripe="true" :border="true">
  			<el-table-column fixed prop="product_common_name" label="产品名称" width="200"></el-table-column>
				<el-table-column prop="product_code" label="产品编号" width="150"></el-table-column>
				<!-- <el-table-column prop="product_supplier" label="供货单位" width="150"></el-table-column> -->
				<el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column>
				<el-table-column prop="product_makesmakers" label="生厂企业" width="200"></el-table-column>
				<el-table-column prop="product_packing" label="包装" width="80"></el-table-column>
				<el-table-column prop="product_unit" label="单位" width="80"></el-table-column>
  			<el-table-column prop="product_price" label="中标价" width="80"></el-table-column>
				<el-table-column prop="product_mack_price" label="打款价" width="80"></el-table-column>
				<el-table-column prop="product_discount" label="毛利率(百分比)" :formatter="formatPercent" width="120"></el-table-column>
				<el-table-column prop="product_specifications" label="产品规格" width="150"></el-table-column>
				<el-table-column prop="contacts_name" label="联系人" width="120"></el-table-column>
  			<el-table-column fixed="right" label="操作" width="100">
			    <template slot-scope="scope">
						<el-button v-dbClick @click.native.prevent="selectRow(scope)" type="primary" size="small">选择</el-button>
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
					<div><span>返款金额:</span>{{drug.product_return_money}}</div>
					<div style="display:block;width:100%;"><span>生产产家:</span>{{drug.product_makesmakers}}</div>
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
					<el-input v-model="allot.allot_return_price" @blur="returnMoney"></el-input>
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
        <el-button size="mini" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="mini" @click="addallots('allot')">确 定</el-button>
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
					this.allot.allot_money = this.allot.allot_number * this.drug.product_price;
					this.allot.allot_money = this.allot.allot_money.toFixed(2);
					if(this.allot.allot_return_price && reg.test(this.allot.allot_return_price)){
						this.allot.allot_return_money = this.allot.allot_return_price * this.allot.allot_number;
						this.allot.allot_return_money =	this.allot.allot_return_money.toFixed(2);
					}
          callback();
        }
      };
			// var validateRealReturnMoney = (rule, value, callback) => {
      //   if(!value && !reg.test(value)){
			// 		callback(new Error('请输入正确的返款单价'));
			// 	} else {
			// 		this.allot.allot_return_money = value * this.allot.allot_number;
			// 		this.allot.allot_return_money =	this.allot.allot_return_money.toFixed(2);
      //     callback();
      //   }
      // };
			return {
				dialogFormVisible:false,
				loading:false,
				drugs:[],
				drug:{},
				hospitals:[],
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					product_type:['高打','高打(底价)'],
					productCommonName:"",
					contactId:"",
					product_code:""
				},
				remarks:[],
				allot:{
					allot_time:new Date(),
					allot_number:"",
					allot_hospital:"",
					allot_mack_price:"",
					allot_price:"",
					allot_money:"",
					allot_return_money:"",
					allot_return_time:null,
					allot_return_price:"",
					allot_return_flag:"",
					allot_drug_id:""
				},
				allotRule:{
					allot_number:[{validator:validateNum,trigger: 'blur' }],
					// allot_return_price:[{validator:validateRealReturnMoney,trigger: 'blur' }],
					allot_time:[{ required: true, message: '请选择调货时间', trigger: 'blur,change' }],
					allot_hospital:[{ required: true, message: '请输入调货单位', trigger: 'blur,change' }]
				},
			}
		},
		activated(){
			this.getDrugsList();
			this.hospitals = JSON.parse(sessionStorage["allot_hospital"]);
		},
		mounted(){

		},
		methods:{
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
			//选择要进货的药品
			selectRow(scope){
				this.drug = scope.row;
				if(this.$refs["allot"]){
					this.$refs["allot"].resetFields();
				}
				this.dialogFormVisible = true;
			},
			//搜索所有药品信息
			searchDrugsList(){
				this.getDrugsList();
			},
			returnallot(){
				this.$router.push("/main/allot");
			},
			addallots(formName){
				var _self = this;
				this.loading = true;
				this.allot.allot_price = this.drug.product_price;
				this.allot.allot_mack_price = this.drug.product_mack_price;
				this.allot.allot_drug_id = this.drug.product_id;
				this.allot.product_type = this.drug.product_type;
				this.allot.stock = this.drug.stock;
				this.$refs[formName].validate((valid) => {
						if (valid) {
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
				this.allot.allot_return_money = this.allot.allot_return_price * this.allot.allot_number;
				this.allot.allot_return_money =	this.allot.allot_return_money.toFixed(2);
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
