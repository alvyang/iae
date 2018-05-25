<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/drugs' }">药品信息</el-breadcrumb-item>
			<el-breadcrumb-item>{{this.editmessage}}药品</el-breadcrumb-item>
		</el-breadcrumb>
		<div class="add_div">
			<div>
				<el-form :model="drugs" status-icon :rules="drugsRule" ref="drugs" :inline="true" label-width="100px" class="demo-ruleForm">
					<div>
						<el-form-item label="产品通用名" prop="product_common_name">
							<el-input v-model="drugs.product_common_name" style="width:300px;" auto-complete="off" :maxlength="50" placeholder="产品通用名"></el-input>
						</el-form-item>
						<el-form-item label="产品编号" prop="product_code">
							<el-input v-model="drugs.product_code" style="width:250px;" auto-complete="off" :maxlength="20" placeholder="产品编号"></el-input>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="生产产家" prop="product_makesmakers">
							<el-autocomplete popper-class="my-autocomplete" style="width:300px;"
							  v-model="drugs.product_makesmakers"
							  :fetch-suggestions="querySearch"
							  placeholder="生产产家" @select="handleSelect"
								@blur="drugs.product_supplier = drugs.product_makesmakers">
							  <template slot-scope="{ item }">
							    <div class="name">{{ item.product_makesmakers }}</div>
							    <span class="addr">{{ item.product_supplier }}</span>
							  </template>
							</el-autocomplete>
						</el-form-item>
						<el-form-item label="产品规格" prop="product_specifications">
							<el-input v-model="drugs.product_specifications" style="width:250px;" :maxlength="30" auto-complete="off" placeholder="产品规格"></el-input>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="供货单位" prop="product_supplier">
							<el-input v-model="drugs.product_supplier" style="width:300px;" auto-complete="off" :maxlength="50" placeholder="供货单位"></el-input>
						</el-form-item>
						<el-form-item label="联系人" prop="contacts_id">
						  <el-select v-model="drugs.contacts_id" filterable placeholder="请选择联系人" style="width: 250px;">
						    <el-option v-for="item in contacts" :key="item.contacts_id" :label="item.contacts_name" :value="item.contacts_id"></el-option>
						  </el-select>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="包装" prop="product_packing">
							<el-input v-model="drugs.product_packing" auto-complete="off" :maxlength="20" placeholder="包装"></el-input>
						</el-form-item>
						<el-form-item label="单位" prop="product_unit">
							<el-select v-model="drugs.product_unit" placeholder="请选择" style="width: 179px;">
						    <el-option key="盒" label="盒" value="盒"></el-option>
								<el-option key="支" label="支" value="支"></el-option>
								<el-option key="瓶" label="瓶" value="瓶"></el-option>
								<el-option key="袋" label="袋" value="袋"></el-option>
						  </el-select>
						</el-form-item>
						<el-form-item label="医保类型" prop="product_medical_type">
							<el-select v-model="drugs.product_medical_type" placeholder="请选择" style="width: 179px;">
								<el-option key="" label="" value=""></el-option>
						    <el-option key="甲类" label="甲类" value="甲类"></el-option>
								<el-option key="乙类" label="乙类" value="乙类"></el-option>
								<el-option key="丙类" label="丙类" value="丙类"></el-option>
								<el-option key="省医保" label="省医保" value="省医保"></el-option>
						  </el-select>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="中标价" prop="product_price">
							<el-input v-model="drugs.product_price" @blur="priceBlur" auto-complete="off" :maxlength="10" placeholder="中标价"></el-input>
						</el-form-item>
						<el-form-item label="扣率" prop="product_discount">
							<el-input v-model="drugs.product_discount" style="width:163px;" @blur="priceBlur" auto-complete="off" :maxlength="10" placeholder="扣率（如：88）"></el-input> %
						</el-form-item>
						<el-form-item label="打款价" prop="product_mack_price">
							<el-input v-model="drugs.product_mack_price" auto-complete="off" :maxlength="10" placeholder="打款价"></el-input>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="返费类型" prop="product_type">
							<el-radio-group v-model="drugs.product_type">
								<el-radio border label="佣金"></el-radio>
			 					<el-radio border label="高打"></el-radio>
								<el-radio border label="高打(底价)"></el-radio>
					    </el-radio-group>
						</el-form-item>
						<el-form-item label="返费说明" prop="product_return_explain">
							<el-input v-model="drugs.product_return_explain" style="width:342px;" auto-complete="off" :maxlength="50" placeholder="返费说明"></el-input>
						</el-form-item>
					</div>
					<div v-show="drugs.product_type == '高打(底价)'">
						<el-form-item label="底价" prop="product_floor_price">
							<el-input v-model="drugs.product_floor_price" @blur="priceBlur" auto-complete="off" :maxlength="10" placeholder="底价"></el-input>
						</el-form-item>
						<el-form-item label="高开返费率" prop="product_high_discount">
							<el-input v-model="drugs.product_high_discount" @blur="priceBlur" style="width:163px;"  auto-complete="off" :maxlength="10" placeholder="高开返费率（如：23）"></el-input> %
						</el-form-item>
					</div>
					<div>
						<el-form-item label="返费金额" prop="product_return_money">
							<el-input v-model="drugs.product_return_money" @blur="priceBlur" auto-complete="off" :maxlength="10" placeholder="返费金额"></el-input>
						</el-form-item>
						<el-form-item label="返费率" prop="product_return_discount">
							<el-input v-model="drugs.product_return_discount" style="width:163px;" auto-complete="off" :maxlength="10" placeholder="返费率（如：40）"></el-input> %
						</el-form-item>
					</div>
					<div>
						<el-form-item label="备注" prop="remark">
							<el-input v-model="drugs.remark" style="width:300px;" auto-complete="off" :maxlength="50" placeholder="备注"></el-input>
						</el-form-item>
					</div>
					<div style="text-align:center;">
						<el-form-item>
							<el-button type="primary" @click="submitForm('drugs')">提交</el-button>
							<el-button @click="resetForm('drugs')">重置</el-button>
							<el-button @click="returnList">返回</el-button>
						</el-form-item>
					</div>
				</el-form>
			</div>
		</div>
	</div>
</template>
<script>
	export default({
		data(){
			var validateMoney = (rule, value, callback) => {
        if (value && !/\d{1,10}(\.\d{1,2})?$/.test(value)) {
          	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
         	callback();
        }
    	};
			var validatePercent = (rule, value, callback) => {
        if (value && !/^100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
          	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
         	callback();
        }
    	};
			return {
				drugs:{
					product_id:"",
					product_common_name:"",
					product_specifications:"",
					product_unit:"",
					product_packing:"",
					product_price:"",
					product_code:"",
					product_makesmakers:"",
					product_supplier:"",
					product_mack_price:"",
					product_discount:"",
					product_medical_type:"",
					product_type:"佣金",
					product_return_money:"",
					product_return_discount:"",
					product_floor_price:"",
					product_high_discount:"",
					contacts_id:"",
					product_return_explain:""
				},
				drugsRule:{
					product_common_name:[{ required: true, message: '请输入产品通用名', trigger: 'blur' }],
					product_code:[{ required: true, message: '请输入产品编号', trigger: 'blur' }],
					product_makesmakers:[{ required: true, message: '请输入生产产家', trigger: 'blur,change' }],
					product_specifications:[{ required: true, message: '请输入产品规格', trigger: 'blur' }],
					product_price:[{ validator: validateMoney,labelname:'中标价', trigger: 'blur' }],
					product_mack_price:[{ validator: validateMoney,labelname:'打款价', trigger: 'blur' }],
					product_return_money:[{ validator: validateMoney,labelname:'返费金额', trigger: 'blur' }],
					product_floor_price:[{ validator: validateMoney,labelname:'底价', trigger: 'blur' }],
					product_discount:[{ validator: validatePercent,labelname:'扣率', trigger: 'blur' }],
					product_return_discount:[{ validator: validatePercent,labelname:'返费率', trigger: 'blur' }],
					product_high_discount:[{ validator: validatePercent,labelname:'底价', trigger: 'blur' }]
				},
				editmessage:"",
				contacts:[],
				price:/\d{1,10}(\.\d{1,2})?$/,
				percent : /^100$|^(\d|[1-9]\d)(\.\d+)*$/,
				productMakesmakers: [],//生产企业
			}
		},
		activated(){
			this.resetForm("drugs");
			this.drugs.product_id = "";
			this.contacts = JSON.parse(sessionStorage["contacts"]);
			if(sessionStorage["drugs_edit"]){
				var sessionDrugs = JSON.parse(sessionStorage["drugs_edit"]);
				delete sessionDrugs.contacts_name;
				this.drugs = sessionDrugs;
				sessionStorage.removeItem('drugs_edit');
				this.editmessage = "修改";
			}else{
				this.editmessage = "新增";
			}
			this.getProductMakesmakers();
		},
		mounted(){

		},
		methods:{
			handleSelect(item) {
				console.log(item);
				this.drugs.product_makesmakers = item.product_makesmakers;
        this.drugs.product_supplier = item.product_supplier;
      },
			querySearch(queryString, cb) {
        var productMakesmakers = this.productMakesmakers;
        var results = queryString ? productMakesmakers.filter(this.createFilter(queryString)) : productMakesmakers;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      createFilter(queryString) {
        return (productMakesmakers) => {
          return (productMakesmakers.product_makesmakers.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
        };
      },
			getProductMakesmakers(){
				var _self = this;
				this.jquery("/iae/drugs/getProductMakesmakers",null,function(res){//查询添加过的生产企业
					_self.productMakesmakers=res.message;
				});
			},
			returnList(){
				this.$router.push({path:`/main/drugs`});
			},
			submitForm(formName) {
				var _self = this;
        this.$refs[formName].validate((valid) => {
          	if (valid) {
							var url = _self.editmessage == '新增'?"/iae/drugs/saveDrugs":"/iae/drugs/editDrugs";
							this.jquery(url,_self.drugs,function(res){
								_self.$confirm(_self.editmessage+'成功', '提示', {
				          	confirmButtonText:'继续添加',
				          	cancelButtonText:'返回列表',
				          	type: 'success'
				        }).then(() => {
				          	_self.resetForm("drugs");
				          	_self.drugs.product_id = "";
				        }).catch(() => {
				          	_self.$router.push({path:`/main/drugs`});
								});
							});
          	} else {
          		return false;
          	}
        });
    	},
    	resetForm(formName) {
        this.$refs[formName].resetFields();
    	},
			priceBlur(){
				//计算返费金额
				if(this.drugs.product_type == '高打(底价)' &&
					this.drugs.product_price &&
					this.drugs.product_floor_price &&
					this.drugs.product_high_discount &&
					this.price.test(this.drugs.product_floor_price) &&
					this.percent.test(this.drugs.product_high_discount)){

					this.drugs.product_return_money = (this.drugs.product_price - this.drugs.product_floor_price) * (1-this.drugs.product_high_discount/100);
					this.drugs.product_return_money = this.drugs.product_return_money.toFixed(2);

				}
				//计算打款价
				if(this.drugs.product_price &&
					this.drugs.product_discount &&
					this.price.test(this.drugs.product_price) &&
					this.percent.test(this.drugs.product_discount)){

					this.drugs.product_mack_price = (this.drugs.product_discount * this.drugs.product_price)/100;
					this.drugs.product_mack_price = this.drugs.product_mack_price.toFixed(2);
				}
				//计算返费率
				if(this.drugs.product_price &&
					this.drugs.product_return_money &&
					this.price.test(this.drugs.product_price) &&
					this.percent.test(this.drugs.product_return_money)){

					this.drugs.product_return_discount = (this.drugs.product_return_money/this.drugs.product_price)*100;
					this.drugs.product_return_discount = this.drugs.product_return_discount.toFixed(2);
				}
			}
		}
	});
</script>
<style>
	.add_div > div{
		text-align: center;
		padding-top: 40px;
		padding-bottom: 20px;
	}
	.demo-ruleForm{
		text-align: left;
		display: inline-block;
	}
	.my-autocomplete  li {
	    line-height: normal;
	    padding: 7px;
	}
	.my-autocomplete li .name {
      text-overflow: ellipsis;
      overflow: hidden;
  }
  .my-autocomplete  li .addr {
    font-size: 12px;
    color: #b4b4b4;
  }
  .my-autocomplete  li .highlighted .addr {
    color: #ddd;
  }
</style>
