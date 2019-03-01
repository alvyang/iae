<template>
	<div style="padding:0 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/purchase' }">高打品种销售管理</el-breadcrumb-item>
			<el-breadcrumb-item v-show="editmessage == '新增'" :to="{ path: '/main/purchasedrugs' }">选择药品</el-breadcrumb-item>
			<el-breadcrumb-item>{{editmessage}}记录</el-breadcrumb-item>
		</el-breadcrumb>
		<div class="add_div">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息(药品名：'+drug.product_common_name+')'" name="1">
			    <div>产品规格:{{drug.product_specifications}}</div>
			    <div>单位:{{drug.product_unit}}</div>
					<div>中标价:{{drug.product_price}}</div>
					<div>联系人:{{drug.contacts_name}}</div>
					<div>商业:{{drug.product_business}}</div>
					<div>佣金:{{drug.product_commission}}</div>
			  </el-collapse-item>
			</el-collapse>
			<div class="purchase_add">
				<el-form :model="purchase" status-icon :rules="purchaseRule" :inline="true" ref="purchase" label-width="100px" class="demo-ruleForm">
				  <el-form-item label="购入数量" prop="puchase_number" :required="true" >
				    <el-input v-model="purchase.puchase_number" :maxlength="10" placeholder="请输入购入数量" @blur="purchaseNumBlur();"></el-input>
				  </el-form-item>
				  <el-form-item label="购入金额" prop="puchase_money">
				    <el-input v-model="purchase.puchase_money" auto-complete="off"></el-input>
				  </el-form-item>
				  <el-form-item label="入库时间" prop="storage_time">
						<el-date-picker v-model="purchase.storage_time" type="date" placeholder="请选择入库时间"></el-date-picker>
				  </el-form-item>
				  <el-form-item label="应返金额" prop="shoule_return_money">
				    <el-input v-model="purchase.shoule_return_money" :readonly="true"></el-input>
				  </el-form-item>
				  <el-form-item label="应返时间" prop="should_return_time">
						<el-date-picker v-model="purchase.should_return_time" type="date" placeholder="请选择应返时间"></el-date-picker>
				  </el-form-item>
				  <el-form-item label="实返金额" prop="real_return_money">
				    <el-input v-model="purchase.real_return_money" :maxlength="10" placeholder="请输入实返金额" @blur="realReturnMoneyBlur();"></el-input>
				  </el-form-item>
		      <el-form-item label="返费时间" prop="real_return_time">
						<el-date-picker v-model="purchase.real_return_time" type="date" placeholder="请选择返费时间"></el-date-picker>
				  </el-form-item>
		      <el-form-item label="外欠佣金" prop="own_money">
				    <el-input v-model="purchase.own_money" auto-complete="off" :readonly="true"></el-input>
				  </el-form-item>
					<el-form-item label="返款人" prop="regenerator" :maxlength="20"  v-show="editmessage == '修改'">
				    <el-input v-model="purchase.regenerator" auto-complete="off"></el-input>
				  </el-form-item>
					<el-form-item label="收款人" prop="payee" :maxlength="20" v-show="editmessage == '修改'">
				    <el-input v-model="purchase.payee" auto-complete="off"></el-input>
				  </el-form-item>
				  <el-form-item>
				    <el-button type="primary" @click="submitForm('purchase')">提交</el-button>
				    <el-button @click="resetForm('purchase')">重置</el-button>
						<el-button @click="returnList('/main/purchasedrugs')" v-show="editmessage == '新增'">重新选择药品</el-button>
				    <el-button @click="returnList('/main/purchase')">返回列表</el-button>
				  </el-form-item>
				</el-form>
			</div>
		</div>
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
          callback();
        }
      };
			var validateRealReturnMoney = (rule, value, callback) => {
				var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if(!reg.test(value)){
					callback(new Error('请输入正确的实返金额'));
				} else if(this.purchase.shoule_return_money && parseFloat(value) > parseFloat(this.purchase.shoule_return_money)){
					callback(new Error('实返金额不能大于应返金额'));
				} else {
          callback();
        }
      };
			return {
				ipc:null,
				purchase:{
					purchase_id:"",
					drugs_id:"",
					puchase_number:"",
					puchase_money:"",
					storage_time:new Date(),
					should_return_time:"",
					shoule_return_money:"",
					real_return_money:"0",
          real_return_time:"",
          own_money:"",
					payee:"",
					regenerator:"",
				},
				purchaseRule:{
					puchase_number:[{validator: validateNum,trigger: 'blur,change' }],
					storage_time:[{ required: true, message: '请选择入库时间', trigger: 'blur,change' }],
					should_return_time:[{ required: true, message: '请选择实返时间', trigger: 'blur,change' }],
					real_return_money:[{validator: validateRealReturnMoney,trigger: 'blur'}],
				},
				drug:{},//选择的药品信息
				editmessage:"",
			}
		},
		activated(){
			this.resetForm("purchase");
			this.purchase.purchase_id = "";
			if(sessionStorage["purchase_edit"]){
				var sessionPurchase = JSON.parse(sessionStorage["purchase_edit"]);
				this.drug = {
					product_common_name:sessionPurchase.product_common_name,
					product_specifications:sessionPurchase.product_specifications,
					product_unit:sessionPurchase.product_unit,
					product_price:sessionPurchase.product_price,
					contacts_name:sessionPurchase.contacts_name,
					product_business:sessionPurchase.product_business,
					product_commission:sessionPurchase.product_commission,
				}
				this.purchase = {
					purchase_id:sessionPurchase.purchase_id,
					drugs_id:sessionPurchase.drugs_id,
					puchase_number:sessionPurchase.puchase_number,
					puchase_money:sessionPurchase.puchase_money,
					storage_time:sessionPurchase.storage_time,
					should_return_time:sessionPurchase.should_return_time,
					shoule_return_money:sessionPurchase.shoule_return_money,
					real_return_money:sessionPurchase.real_return_money,
          real_return_time:sessionPurchase.real_return_time,
          own_money:sessionPurchase.own_money,
					payee:sessionPurchase.payee?sessionPurchase.payee:"",
					regenerator:sessionPurchase.regenerator?sessionPurchase.regenerator:"",
				}
				sessionStorage.removeItem('purchase_edit');
				this.editmessage = "修改";
			}else{
				this.drug = JSON.parse(sessionStorage["drugs_select"]);
				this.purchase.drugs_id = this.drug.product_id;
				this.editmessage = "新增";
			}
		},
		mounted(){
			var that = this;
			if (window.require) {
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('edit-purchase-return', (event, arg) => {
			  	that.$confirm(that.editmessage+'成功', '提示', {
          	confirmButtonText:'重新选药,继续添加',
          	cancelButtonText:'返回列表',
          	type: 'success'
	        }).then(() => {
          	that.$router.push("/main/purchasedrugs");
	        }).catch(() => {
          	that.$router.push("/main/purchase");
					});
				});
			}
		},
		methods:{
			//填写实返金额后，计算外欠佣金的值的值
			realReturnMoneyBlur(){
				if(parseFloat(this.purchase.real_return_money) > 0 && parseFloat(this.purchase.real_return_money) <= parseFloat(this.purchase.shoule_return_money)){
					var temp = this.purchase.shoule_return_money - this.purchase.real_return_money;
					this.purchase.own_money = temp == 0 ? temp:Math.round(temp*100)/100;
				}
			},
			//输入购买数量后，计算购买金额、应返金额、外欠佣金的值
			purchaseNumBlur(){
				var regu = /^\+?[1-9][0-9]*$/;
				if(this.purchase.puchase_number && regu.test(this.purchase.puchase_number)){

					this.purchase.puchase_money =this.mul(this.purchase.puchase_number,this.drug.product_price,2);
					this.purchase.shoule_return_money = this.mul(this.purchase.puchase_number,this.drug.product_commission,2);

					if(parseFloat(this.purchase.shoule_return_money) < parseFloat(this.purchase.real_return_money)){
						this.purchase.real_return_money = Math.round(this.purchase.shoule_return_money*100)/100;
					}
					var temp = this.purchase.shoule_return_money - this.purchase.real_return_money;
					this.purchase.own_money = temp == 0 ? temp:Math.round(temp*100)/100;
				}
			},
			returnList(path){
				this.$router.push(path);
			},
			submitForm(formName) {
				var that = this;
        this.$refs[formName].validate((valid) => {
          	if (valid) {
            		that.ipc.send('edit-purchase',this.purchase);
          	} else {
            		return false;
          	}
        });
    	},
    	resetForm(formName) {
        this.$refs[formName].resetFields();
    	}
		}
	});
</script>
<style scoped="scoped">
	.el-date-editor{
		width: 179px;
	}
	.el-collapse-item__content > div{
		display: inline-block;
		width: 33%;
	}
	.el-collapse{
		border-top: none;
	}
	.el-collapse-item{
		padding-left: 10px;
	}
	.purchase_add{
		width:600px;
		margin: 20px auto;
	}
</style>
