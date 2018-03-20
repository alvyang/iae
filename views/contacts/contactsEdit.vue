<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item>信息管理</el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/main/contacts' }">联系人管理</el-breadcrumb-item>
			<el-breadcrumb-item>{{this.editmessage}}联系人</el-breadcrumb-item>
		</el-breadcrumb>
		<div class="add_div">
			<div style="width:400px;margin: 20px auto;">
				<el-form :model="contacts" status-icon :rules="contactsRule" ref="contacts" label-width="70px" class="demo-ruleForm">
				  <el-form-item label="联系人" prop="contacts_name">
				    <el-input v-model="contacts.contacts_name" auto-complete="off" :maxlength="20" placeholder="请输入联系人姓名"></el-input>
				  </el-form-item>
				  <el-form-item label="手机号码" prop="contacts_phone">
				    <el-input v-model="contacts.contacts_phone" auto-complete="off" :maxlength="11" placeholder="请输入联系人手机号码"></el-input>
				  </el-form-item>
				  <el-form-item>
				    <el-button type="primary" @click="submitForm('contacts')">提交</el-button>
				    <el-button @click="resetForm('contacts')">重置</el-button>
				    <el-button @click="returnList">返回</el-button>
				  </el-form-item>
				</el-form>
			</div>
		</div>
	</div>
</template>
<script>
	export default({
		data(){
			var validatePhone = (rule, value, callback) => {
		        if (value && !/^1[3|4|5|7|8][0-9]{9}$/.test(value)) {
		          	callback(new Error('请再输入正确的手机号码'));
		        } else {
		         	callback();
		        }
	      	};
			return {
				ipc:null,
				contacts:{
					contacts_id:"",
					contacts_name:"",
					contacts_phone:"",
				},
				contactsRule:{
					contacts_name:[{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
					contacts_phone:[{ validator: validatePhone, trigger: 'blur' }],
				},
				editmessage:"",
			}
		},
		activated(){
			this.resetForm("contacts");
			this.contacts.contacts_id = "";
			if(sessionStorage["contacts_edit"]){
				var sessionDrugs = JSON.parse(sessionStorage["contacts_edit"]);
				this.contacts = sessionDrugs;
				sessionStorage.removeItem('contacts_edit');
				this.editmessage = "修改";
			}else{
				this.editmessage = "新增";
			}
		},
		mounted(){
			var that = this;
			if (window.require) {
			    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('edit-contacts-return', (event, arg) => {
				  	that.$confirm(that.editmessage+'成功', '提示', {
			          	confirmButtonText:'继续添加',
			          	cancelButtonText:'返回列表',
			          	type: 'success'
			        }).then(() => {
			          	that.resetForm("contacts");
			          	this.contacts.contacts_id = "";
			        }).catch(() => {
			          	that.$router.push("/main/contacts");
					});
				});
			}
		},
		methods:{
			returnList(){
				this.$router.push("/main/contacts");
			},
			submitForm(formName) {
				var that = this;
		        this.$refs[formName].validate((valid) => {
		          	if (valid) {
		            		that.ipc.send('edit-contacts',this.contacts);
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
