<template>
	<div style="width:400px;margin: 20px auto;">

		<el-form :model="drugs" status-icon :rules="drugsRule" ref="drugs" label-width="100px" class="demo-ruleForm">
		  <el-form-item label="购入数量" prop="puchase_number">
		    <el-input v-model="drugs.puchase_number" auto-complete="off" placeholder="请输入购入数量"></el-input>
		  </el-form-item>
		  <el-form-item label="购入金额" prop="puchase_money">
		    <el-input v-model="drugs.puchase_money" auto-complete="off" placeholder="请输入购入金额"></el-input>
		  </el-form-item>
		  <el-form-item label="入库时间" prop="storage_time">
		    <el-input v-model="drugs.storage_time" auto-complete="off" placeholder="请输入入库时间"></el-input>
		  </el-form-item>
		  <el-form-item label="应返金额" prop="shoule_return_money">
		    <el-input v-model="drugs.shoule_return_money" auto-complete="off" placeholder="请输入应返金额"></el-input>
		  </el-form-item>
		  <el-form-item label="应返时间" prop="should_return_time">
		    <el-input v-model="drugs.should_return_time" auto-complete="off" placeholder="请输入应返时间"></el-input>
		  </el-form-item>
		  <el-form-item label="实返金额" prop="real_return_money">
		    <el-input v-model="drugs.real_return_money" auto-complete="off" placeholder="请输入实返金额"></el-input>
		  </el-form-item>
      <el-form-item label="返费时间" prop="real_return_time">
		    <el-input v-model="drugs.real_return_time" auto-complete="off" placeholder="请输入返费时间"></el-input>
		  </el-form-item>
      <el-form-item label="外欠佣金" prop="own_money">
		    <el-input v-model="drugs.own_money" auto-complete="off" placeholder="请输入外欠佣金"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="submitForm('drugs')">提交</el-button>
		    <el-button @click="resetForm('drugs')">重置</el-button>
		    <el-button @click="returnList">返回</el-button>
		  </el-form-item>
		</el-form>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				ipc:null,
				contacts:[],
				drugs:{
					product_id:"",
					puchase_number:"",
					puchase_money:"",
					product_unit:"",
					should_return_time:"",
					contacts:"",
					shoule_return_money:"",
					real_return_money:"",
				},
				drugsRule:{
					puchase_number:[{ required: true, message: '请输入产品通用名', trigger: 'blur' }],
					puchase_money:[{ required: true, message: '请输入产品规格', trigger: 'blur' }],
					product_unit:[{ required: true, message: '请输入单位', trigger: 'blur' }],
					should_return_time:[{ required: true, message: '请输入中标价', trigger: 'blur' }],
					contacts:[{ required: true, message: '请选择联系人', trigger: 'change' }],
					shoule_return_money:[{ required: true, message: '请输入商业', trigger: 'blur' }],
					real_return_money:[{ required: true, message: '请输入佣金', trigger: 'blur' }],
				},
				editmessage:"",
			}
		},
		activated(){
			this.resetForm("drugs");
			this.drugs.product_id = "";
			if(sessionStorage["drugs_edit"]){
				var sessionDrugs = JSON.parse(sessionStorage["drugs_edit"]);
				delete sessionDrugs.contacts_name;
				this.drugs = sessionDrugs;
				sessionStorage.removeItem('drugs_edit');
				this.editmessage = "修改";
			}else{
				this.editmessage = "新增";
			}
		},
		mounted(){
			var that = this;
			this.contacts = JSON.parse(sessionStorage["contacts_all"]);
			if (window.require) {
			    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('edit-drugs-return', (event, arg) => {
					console.log(arg);
				  	that.$confirm(that.editmessage+'成功', '提示', {
			          	confirmButtonText:'继续添加',
			          	cancelButtonText:'返回列表',
			          	type: 'success'
			        }).then(() => {
			          	that.resetForm("drugs");
			          	this.drugs.product_id = "";
			        }).catch(() => {
			          	that.$router.push("/main/drugs");
					});
				});
			}
		},
		methods:{
			returnList(){
				this.$router.push("/main/purchase");
			},
			submitForm(formName) {
				var that = this;
		        this.$refs[formName].validate((valid) => {
		          	if (valid) {
		            		that.ipc.send('edit-drugs',this.drugs);
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
<style>

</style>
