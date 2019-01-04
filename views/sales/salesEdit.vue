<template>
	<div style="padding:0 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/sales' }">普通品种销售管理</el-breadcrumb-item>
			<el-breadcrumb-item v-show="editmessage == '新增'" :to="{ path: '/main/salesdrugs' }">选择药品</el-breadcrumb-item>
			<el-breadcrumb-item>{{editmessage}}记录</el-breadcrumb-item>
		</el-breadcrumb>
		<div class="add_div">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+drug.product_common_name+ '）'" name="1">
			    <div>产品编号:{{drug.product_code}}</div>
			    <div>产品规格:{{drug.product_specifications}}</div>
					<div>单位:{{drug.product_unit}}</div>
					<div>中标价:{{drug.product_price}}</div>
					<div>生产产家:{{drug.product_makesmakers}}</div>
			  </el-collapse-item>
			</el-collapse>
			<div class="sale_add">
				<el-form :model="sale" status-icon :rules="saleRule" :inline="true" ref="sale" label-width="100px" class="demo-ruleForm">
				  <el-form-item label="计划数量" prop="sales_number" :maxlength="10" :required="true" >
				    <el-input v-model="sale.sales_number" placeholder="请输入计划数量" @blur="saleNumBlur();"></el-input>
				  </el-form-item>
				  <el-form-item label="购入金额" prop="sales_money">
				    <el-input v-model="sale.sales_money" auto-complete="off" :readonly="true"></el-input>
				  </el-form-item>
          <el-form-item label="销售机构" prop="sales_hospital_id">
						<el-select v-model="sale.sales_hospital_id" filterable placeholder="请选择销售机构">
							<el-option v-for="item in hospitals"
								:key="item.hospital_id"
								:label="item.hospital_name"
								:value="item.hospital_id">
							</el-option>
		        </el-select>
          </el-form-item>
				  <el-form-item label="销售日期" prop="sales_time">
						<el-date-picker v-model="sale.sales_time" type="date" placeholder="请选择销售时间"></el-date-picker>
				  </el-form-item>
				  <el-form-item>
				    <el-button type="primary" @click="submitForm('sale')">提交</el-button>
				    <el-button @click="resetForm('sale')">重置</el-button>
						<el-button @click="returnList('/main/salesdrugs')" v-show="editmessage == '新增'">重新选择药品</el-button>
				    <el-button @click="returnList('/main/sales')">返回列表</el-button>
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
          callback(new Error('请输入计划数量'));
        } else if(!regu.test(value)){
					callback(new Error('请输入正整数'));
				} else {
          callback();
        }
      };
			return {
				ipc:null,
				sale:{
					sales_id:"",
					drugs_id:"",
					sales_number:"",
					sales_money:"",
					sales_time:new Date(),
          sales_hospital_id:"",
				},
				saleRule:{
					sales_number:[{validator: validateNum,trigger: 'blur,change' }],
					sales_time:[{ required: true, message: '请选择销售时间', trigger: 'blur,change' }],
					sales_hospital_id:[{ required: true, message: '请选择销售机构', trigger: 'blur,change' }],
				},
				drug:{},//选择的药品信息
				editmessage:"",
        hospitals:[],
			}
		},
		activated(){
			this.resetForm("sale");
			this.sale.sales_id = "";
			if(sessionStorage["sale_edit"]){
				var sessionsale = JSON.parse(sessionStorage["sale_edit"]);
				this.drug = {
					product_common_name:sessionsale.product_common_name,
					product_code:sessionsale.product_code,
					product_specifications:sessionsale.product_specifications,
					product_unit:sessionsale.product_unit,
					product_price:sessionsale.product_price,
          product_makesmakers:sessionsale.product_makesmakers,
				}
				this.sale = {
          sales_id:sessionsale.sales_id,
					drugs_id:sessionsale.drugs_id,
					sales_number:sessionsale.sales_number,
					sales_money:sessionsale.sales_money,
					sales_time:sessionsale.sales_time,
          sales_hospital_id:sessionsale.sales_hospital_id,
				}
				sessionStorage.removeItem('sale_edit');
				this.editmessage = "修改";
			}else{
				this.drug = JSON.parse(sessionStorage["drugs_select"]);
				this.sale.drugs_id = this.drug.product_id;
				this.editmessage = "新增";
			}
		},
		mounted(){
			var that = this;
			if (window.require) {
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('edit-sale-return', (event, arg) => {
			  	that.$confirm(that.editmessage+'成功', '提示', {
          	confirmButtonText:'重新选药,继续添加',
          	cancelButtonText:'返回列表',
          	type: 'success'
	        }).then(() => {
          	that.$router.push("/main/salesdrugs");
	        }).catch(() => {
          	that.$router.push("/main/sales");
					});
				});
        this.hospitals = JSON.parse(sessionStorage["hospital_all"]);
			}
		},
		methods:{
			//输入购买数量后，计算购买金额、应返金额、外欠佣金的值
			saleNumBlur(){
				var regu = /^\+?[1-9][0-9]*$/;
				if(this.sale.sales_number && regu.test(this.sale.sales_number)){
					this.sale.sales_money = this.mul(this.sale.sales_number,this.drug.product_price,2);
				}
			},
			returnList(path){
				this.$router.push(path);
			},
			submitForm(formName) {
				var that = this;
        this.$refs[formName].validate((valid) => {
          	if (valid) {
            		that.ipc.send('edit-sale',this.sale);
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
	.sale_add{
		width:600px;
		margin: 20px auto;
	}
	.el-select{
	  width: 179px !important;
	}
</style>
