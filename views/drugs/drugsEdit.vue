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
						<el-form-item label="产品名称" prop="product_common_name">
							<el-input v-model="drugs.product_common_name" @blur="drugs.product_name_pinyin = getFirstLetter(drugs.product_common_name)" style="width:300px;" auto-complete="off" :maxlength="50" placeholder="产品名称"></el-input>
						</el-form-item>
						<el-form-item label="产品助记码" prop="product_name_pinyin">
							<el-input v-model="drugs.product_name_pinyin" style="width:250px;" auto-complete="off" :maxlength="20" placeholder="产品助记码"></el-input>
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
						<el-form-item label="产品编号" prop="product_code" :required="true">
							<el-input v-model="drugs.product_code" style="width:250px;" :disabled="drugs.readonly?true:false" auto-complete="off" :maxlength="20" placeholder="产品编号"></el-input>
							<el-button type="text" @click="randomCode" v-show="!drugs.readonly">随机编码</el-button>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="供货单位" prop="product_supplier">
							<el-input v-model="drugs.product_supplier" style="width:300px;" auto-complete="off" :maxlength="50" placeholder="供货单位"></el-input>
						</el-form-item>
						<el-form-item label="产品规格" prop="product_specifications">
							<el-input v-model="drugs.product_specifications" style="width:250px;" :maxlength="30" auto-complete="off" placeholder="产品规格"></el-input>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="联系人" prop="contacts_id">
						  <el-select v-model="drugs.contacts_id" filterable placeholder="请选择联系人" style="width: 179px;">
						    <el-option v-for="item in contacts" :key="item.contacts_id" :label="item.contacts_name" :value="item.contacts_id"></el-option>
						  </el-select>
						</el-form-item>
						<el-form-item label="采购员" prop="buyer">
							<el-input v-model="drugs.buyer" auto-complete="off" style="width: 179px;" :maxlength="10" placeholder="采购员"></el-input>
						</el-form-item>
						<el-form-item label="商业" prop="product_business">
							<el-select v-model="drugs.product_business" style="width:179px;" filterable placeholder="请选择商业">
								<el-option v-for="item in business"
			 					 :key="item.business_id"
			 					 :label="item.business_name"
			 					 :value="item.business_id"></el-option>
			 			 		</el-select>
							</el-select>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="包装" prop="product_packing">
							<el-input v-model="drugs.product_packing" auto-complete="off" style="width: 179px;" :maxlength="20" placeholder="包装"></el-input>
						</el-form-item>
						<el-form-item label="单位" prop="product_unit">
							<el-select v-model="drugs.product_unit" placeholder="请选择" style="width: 179px;">
						    <el-option key="盒" label="盒" value="盒"></el-option>
								<el-option key="支" label="支" value="支"></el-option>
								<el-option key="瓶" label="瓶" value="瓶"></el-option>
								<el-option key="袋" label="袋" value="袋"></el-option>
								<el-option key="包" label="包" value="包"></el-option>
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
							<el-input v-model="drugs.product_price" @blur="priceBlur" style="width: 179px;" auto-complete="off" :maxlength="10" placeholder="中标价"></el-input>
						</el-form-item>
						<el-form-item label="成本价" prop="product_mack_price">
							<el-input v-model="drugs.product_mack_price" style="width: 179px;" auto-complete="off" @blur="priceBlur" :maxlength="10" placeholder="打款价"></el-input>
						</el-form-item>
						<el-form-item label="扣率" prop="product_discount">
							<el-input v-model="drugs.product_discount" style="width:163px;" auto-complete="off" :maxlength="10" placeholder="扣率（如：88）"></el-input> %
						</el-form-item>
					</div>
					<div>
						<el-form-item label="产品税率" prop="product_tax_rate" :required="true">
							<el-input v-model="drugs.product_tax_rate" style="width: 179px;" auto-complete="off" :maxlength="10" placeholder="产品税率（如：0.16）"></el-input>
						</el-form-item>
						<el-form-item label="核算成本" prop="accounting_cost">
							<el-input v-model="drugs.accounting_cost" style="width: 179px;" auto-complete="off" @blur="priceBlur" :maxlength="10" placeholder="核算成本"></el-input>
						</el-form-item>
						<el-form-item label="毛利率" prop="gross_interest_rate">
							<el-input v-model="drugs.gross_interest_rate" style="width:163px;" auto-complete="off" :maxlength="10" placeholder="毛利率（如：12）"></el-input> %
						</el-form-item>
					</div>
					<div>
						<el-form-item label="标签" prop="tag_ids">
							<tag-input :tag_ids="drugs.tag_ids" v-on:emitTagIds="emitTagIds"></tag-input>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="采购方式" prop="product_purchase_mode">
							<el-radio-group v-model="drugs.product_purchase_mode">
								<el-radio border label="招标"></el-radio>
			 					<el-radio border label="议价"></el-radio>
					    </el-radio-group>
						</el-form-item>
						<el-form-item label="是否基药" prop="product_basic_medicine">
							<el-radio-group v-model="drugs.product_basic_medicine">
								<el-radio border label="基药"></el-radio>
			 					<el-radio border label="非基药"></el-radio>
					    </el-radio-group>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="品种类型" prop="product_type">
							<el-radio-group v-model="drugs.product_type" @change="typeChange">
								<el-radio border label="佣金"></el-radio>
			 					<el-radio border label="高打"></el-radio>
								<el-radio border label="其它"></el-radio>
					    </el-radio-group>
						</el-form-item>
					</div>
					<div v-show="drugs.product_type != '其它'">
						<el-form-item label="底价" prop="product_floor_price">
							<el-input v-model="drugs.product_floor_price" style="width: 179px;" @blur="priceBlur" auto-complete="off" :maxlength="10" placeholder="底价"></el-input>
						</el-form-item>
						<el-form-item label="高开部分税率" prop="product_high_discount">
							<el-input v-model="drugs.product_high_discount" @blur="priceBlur" style="width:163px;"  auto-complete="off" :maxlength="10" placeholder="税率（如：23）"></el-input> %
						</el-form-item>
					</div>
					<div v-show="drugs.product_type != '其它'">
						<el-form-item label="积分" prop="product_return_money">
							<el-input v-model="drugs.product_return_money" style="width: 179px;" @blur="priceBlur" auto-complete="off" :maxlength="10" placeholder="积分"></el-input>
						</el-form-item>
						<el-form-item label="积分率" prop="product_return_discount">
							<el-input v-model="drugs.product_return_discount" style="width:163px;" auto-complete="off" :maxlength="10" placeholder="积分率（如：40）"></el-input> %
						</el-form-item>
						<el-form-item label="积分说明" prop="product_return_explain">
							<el-input v-model="drugs.product_return_explain" style="width: 179px;" auto-complete="off" :maxlength="50" placeholder="积分说明"></el-input>
						</el-form-item>
					</div>
					<div v-show="drugs.product_type != '其它'">
						<el-form-item label="返积分类型" prop="product_return_time_type">
							<el-select v-model="drugs.product_return_time_type" placeholder="请选择" style="width: 179px;">
						    <el-option key="1" label="当月返" value="1"></el-option>
								<el-option key="2" label="次月返" value="2"></el-option>
								<el-option key="3" label="隔月返" value="3"></el-option>
								<el-option key="4" label="其它" value="4"></el-option>
						  </el-select>
						</el-form-item>
						<el-form-item label="返积分日" v-show="drugs.product_return_time_type != '4'" prop="product_return_time_day">
							<el-input v-model="drugs.product_return_time_day" style="width:179px;" auto-complete="off" :maxlength="10" placeholder="返积分日（如：1-31）"></el-input>
						</el-form-item>
						<el-form-item label="返积分天数" v-show="drugs.product_return_time_type == '4'" prop="product_return_time_day_num">
							<el-input v-model="drugs.product_return_time_day_num" style="width: 179px;" auto-complete="off" :maxlength="50" placeholder="返积分天数"></el-input>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="返积分统计" prop="product_return_statistics">
							<el-radio-group v-model="drugs.product_return_statistics">
								<el-radio border label="1" v-show="drugs.product_type =='佣金' || drugs.product_type =='高打'">按销售记录统计</el-radio>
								<el-radio border label="2" v-show="drugs.product_type =='高打'">按备货记录统计</el-radio>
			 					<el-radio border label="3" v-show="drugs.product_type =='其它'">无返款</el-radio>
					    </el-radio-group>
						</el-form-item>
					</div>
					<div>
						<el-form-item label="备注" prop="remark">
							<el-input v-model="drugs.remark" style="width:300px;" auto-complete="off" :maxlength="50" placeholder="备注"></el-input>
						</el-form-item>
					</div>
					<div style="text-align:center;">
						<el-form-item>
							<el-button type="primary" v-dbClick :loading="loading" @click="submitForm('drugs')">提交</el-button>
							<el-button v-dbClick @click="resetForm('drugs')">重置</el-button>
							<el-button v-dbClick @click="returnList">返回</el-button>
						</el-form-item>
					</div>
				</el-form>
			</div>
		</div>
	</div>
</template>
<script>
	import taginput from "./tagInput.vue";
	export default({
		data(){
			var validateMoney = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
        if (value && !reg.test(value)) {
          	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
         	callback();
        }
    	};
			var validateDecimal = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
        if (!reg.test(value)) {
        	callback(new Error('请再输入正确的产品税率'));
        } else if(parseFloat(value) <= 0 || parseFloat(value) >= 1){
					callback(new Error('产品税率大于0且小于1'));
				} else {
         	callback();
        }
    	};
			var validatePercent = (rule, value, callback) => {
        if (value && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
          	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
         	callback();
        }
    	};
			var validateCode = (rule, value, callback) => {
        if (!value) {
        	callback(new Error('请输入产品编号'));
        } else if((this.editmessage == "修改" && this.product_code == this.drugs.product_code) || !value){
					callback();
        }else{
					this.jquery("/iae/drugs/exitsCode",{product_code:this.drugs.product_code},function(res){
						if(res.message.length > 0){
							callback(new Error('该产品编号已存在'));
						}else{
							callback();
						}
					});
				}
    	};
			var validateDay = (rule, value, callback) => {
				var regu = /^([1-9][0-9]*)$/;
				if (this.drugs.product_return_time_type!='4' && value === '') {
					callback(new Error('请输入返款日'));
				} else if(this.drugs.product_return_time_type!='4' && !regu.test(value)){
					callback(new Error('请输入非0正整数'));
				} else if(this.drugs.product_return_time_type!='4' &&  value > 31){
					callback(new Error('返款日为1-31'));
				} else {
         	callback();
				}
			};
			var validateDayNumber = (rule, value, callback) => {
				var regu = /^(0|[1-9][0-9]*)$/;
				if (this.drugs.product_return_time_type=='4' && value === '') {
					callback(new Error('请输入返款天数'));
				} else if(this.drugs.product_return_time_type=='4' && !regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
         	callback();
				}
			};
			return {
				loading:false,
				product_return_statistics:"",
				drugs:{
					tag_ids:"",
					tag_ids_temp:"",//用于记录修改前的标签id，后台修改标签引用次数
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
					product_return_explain:"",
					buyer:"",
					remark:"",
					product_name_pinyin:"",
					product_business:"",
					readonly:"",
					accounting_cost:"",
					gross_interest_rate:"",
					product_return_statistics:"1",//返款统计方式
					product_return_statistics_update:false,//是否更新销售记录中返款方式
					product_tax_rate:"",//产品税率
					product_purchase_mode:"",//采购方式
					product_basic_medicine:"",//是否基药
					product_return_time_type:"4",//返款时间类型
					product_return_time_day:"",//返款指定日期
					product_return_time_day_num:"45",//返款指定天数
				},
				drugsRule:{
					product_common_name:[{ required: true, message: '请输入产品名称', trigger: 'blur' }],
					product_code:[{ validator: validateCode,trigger: 'blur' }],
					product_makesmakers:[{ required: true, message: '请输入生产产家', trigger: 'blur,change' }],
					product_specifications:[{ required: true, message: '请输入产品规格', trigger: 'blur' }],
					product_price:[{ validator: validateMoney,labelname:'中标价', trigger: 'blur' }],
					product_mack_price:[{ validator: validateMoney,labelname:'成本价', trigger: 'blur' }],
					product_return_money:[{ validator: validateMoney,labelname:'返费金额', trigger: 'blur' }],
					product_floor_price:[{ validator: validateMoney,labelname:'底价', trigger: 'blur' }],
					accounting_cost:[{ validator: validateMoney,labelname:'核算成本', trigger: 'blur' }],
					product_discount:[{ validator: validateMoney,labelname:'扣率', trigger: 'blur' }],
					gross_interest_rate:[{ validator: validateMoney,labelname:'毛利率', trigger: 'blur' }],
					product_return_discount:[{ validator: validatePercent,labelname:'返费率', trigger: 'blur' }],
					product_high_discount:[{ validator: validatePercent,labelname:'底价', trigger: 'blur' }],
					product_tax_rate:[{ validator: validateDecimal,trigger: 'blur' }],
					product_return_time_day:[{ validator: validateDay,trigger: 'blur' }],
					product_return_time_day_num:[{ validator: validateDayNumber,trigger: 'blur' }]
				},
				editmessage:"",
				contacts:[],
				price:/\d{1,10}(\.\d{1,2})?$/,
				percent : /^100$|^(\d|[1-9]\d)(\.\d+)*$/,
				productMakesmakers: [],//生产企业
				business:[],//商业
				product_code:"",//修改时，用于存放修改前的编码
			}
		},
		name:"drugs_edit",
		components:{
			'tag-input':taginput
		},
		activated(){

		},
		beforeMount(){
			// this.resetForm("drugs");
			this.drugs.product_id = "";
			this.drugs.readonly = "";
			this.contacts = JSON.parse(sessionStorage["contacts"]);
			this.business = JSON.parse(sessionStorage["business"]);
			if(sessionStorage["drugs_edit"]){
				var sessionDrugs = JSON.parse(sessionStorage["drugs_edit"]);
				this.product_code = sessionDrugs.product_code;
				delete sessionDrugs.contacts_name;
				delete sessionDrugs.business_name;
				this.drugs = sessionDrugs;
				this.drugs.front_message = sessionStorage["drugs_edit"];
				this.drugs.tag_ids_temp = this.drugs.tag_ids;
				sessionStorage.removeItem('drugs_edit');
				/*
				 * 返款统计由无返款  改为  按销售记录的返款，则更新销售记录
				 */
				this.product_return_statistics = this.drugs.product_return_statistics;
				this.editmessage = "修改";
			}else{
				this.editmessage = "新增";
			}
			this.getProductMakesmakers();
		},
		methods:{
			emitTagIds(val){
				this.drugs.tag_ids = val;
			},
			typeChange(label){
				if(label=="高打" || label=="高打(底价)"){
					this.drugs.product_return_statistics = "2";
				}else if(label == "佣金"){
					this.drugs.product_return_statistics = "1";
				}else{
					this.drugs.product_return_statistics = "3";
				}
			},
			randomCode(){
				this.drugs.product_code = new Date().getTime();
			},
			getFirstLetter(){
				var _self = this;
				this.jquery("/iae/drugs/getFirstLetter",{name:this.drugs.product_common_name},function(res){//查询添加过的生产企业
					_self.drugs.product_name_pinyin = res.message;
				});
			},
			handleSelect(item) {
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
					if(productMakesmakers.product_makesmakers){
						return (productMakesmakers.product_makesmakers.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
					}else{
						return ;
					}
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
				var f1 = this.product_return_statistics != this.drugs.product_return_statistics;
				var f2 = this.product_return_statistics == 3;
				var f3 = this.drugs.product_return_statistics == 1;
				this.drugs.product_return_statistics_update = f1 && f2 && f3;
        this.$refs[formName].validate((valid) => {
          	if (valid) {
							this.loading = true;
							var url = _self.editmessage == '新增'?"/iae/drugs/saveDrugs":"/iae/drugs/editDrugs";
							this.jquery(url,_self.drugs,function(res){
								_self.$confirm(_self.editmessage+'成功', '提示', {
				          	confirmButtonText:'继续添加',
				          	cancelButtonText:'返回列表',
				          	type: 'success'
				        }).then(() => {
				          	_self.resetForm("drugs");
				          	_self.drugs.product_id = "";
										_self.loading = false;
				        }).catch(() => {
										_self.loading = false;
				          	_self.$router.push({path:`/main/drugs`});
								});
							});
          	} else {
							this.loading = false;
          		return false;
          	}
        });
    	},
    	resetForm(formName) {
        this.$refs[formName].resetFields();
    	},
			priceBlur(){
				//计算返费金额
				if(this.drugs.product_mack_price &&
					this.drugs.product_floor_price &&
					this.drugs.product_high_discount &&
					this.price.test(this.drugs.product_floor_price) &&
					this.percent.test(this.drugs.product_high_discount)){
					this.drugs.product_return_money = (this.drugs.product_mack_price - this.drugs.product_floor_price) * (1-this.drugs.product_high_discount/100);
					this.drugs.product_return_money = Math.round(this.drugs.product_return_money*100)/100;
				}
				//计算扣率
				if(this.drugs.product_mack_price &&
					this.drugs.product_price &&
					this.price.test(this.drugs.product_mack_price)){
						this.drugs.product_discount = (this.drugs.product_mack_price*100/this.drugs.product_price);
						this.drugs.product_discount = Math.round(this.drugs.product_discount*100)/100;
				}
				//计算打款价
				if(this.drugs.product_mack_price &&
					!this.drugs.accounting_cost &&
					this.percent.test(this.drugs.product_mack_price)){
					this.drugs.accounting_cost = this.drugs.product_mack_price;
				}
				//计算毛利率
				if(this.drugs.accounting_cost &&
					this.drugs.product_price &&
					this.price.test(this.drugs.accounting_cost)){
						var temp = this.drugs.product_price - this.drugs.accounting_cost;
						this.drugs.gross_interest_rate = (temp*100/this.drugs.product_price);
						this.drugs.gross_interest_rate = Math.round(this.drugs.gross_interest_rate*100)/100;
				}
				//计算返费率
				if(this.drugs.product_price &&
					this.drugs.product_return_money &&
					this.price.test(this.drugs.product_price) &&
					this.price.test(this.drugs.product_return_money)){
					this.drugs.product_return_discount = (this.drugs.product_return_money/this.drugs.product_price)*100;
					this.drugs.product_return_discount = Math.round(this.drugs.product_return_discount*100)/100;
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
