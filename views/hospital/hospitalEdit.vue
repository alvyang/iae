<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item>信息管理</el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/main/hospital' }">销售机构管理</el-breadcrumb-item>
			<el-breadcrumb-item>{{this.editmessage}}机构</el-breadcrumb-item>
		</el-breadcrumb>
		<div class="add_div">
			<div style="width:400px;margin: 20px auto;">
				<el-form :model="hospital" status-icon :rules="hospitalRule" ref="hospital" label-width="80px" class="demo-ruleForm">
				  <el-form-item label="销售机构" prop="hospital_name">
				    <el-input v-model="hospital.hospital_name" auto-complete="off" :maxlength="50" placeholder="请输入销售机构名称"></el-input>
				  </el-form-item>
				  <el-form-item label="机构地址" prop="hospital_address">
				    <el-input v-model="hospital.hospital_address" auto-complete="off" :maxlength="100" placeholder="请输入机构地址"></el-input>
				  </el-form-item>
				  <el-form-item>
				    <el-button type="primary" @click="submitForm('hospital')">提交</el-button>
				    <el-button @click="resetForm('hospital')">重置</el-button>
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
			return {
				ipc:null,
				hospital:{
					hospital_id:"",
					hospital_name:"",
					hospital_address:""
				},
				hospitalRule:{
					hospital_name:[{ required: true, message: '请输入机构名称', trigger: 'blur' }],
				},
				editmessage:"",
			}
		},
		activated(){
			this.resetForm("hospital");
			this.hospital.hospital_id = "";
			if(sessionStorage["hospital_edit"]){
				var sessionHospital = JSON.parse(sessionStorage["hospital_edit"]);
				this.hospital = sessionHospital;
				sessionStorage.removeItem('hospital_edit');
				this.editmessage = "修改";
			}else{
				this.editmessage = "新增";
			}
		},
		mounted(){
			var that = this;
			if (window.require) {
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('edit-hospital-return', (event, arg) => {
			  	that.$confirm(that.editmessage+'成功', '提示', {
          	confirmButtonText:'继续添加',
          	cancelButtonText:'返回列表',
          	type: 'success'
	        }).then(() => {
          	that.resetForm("hospital");
          	this.hospital.hospital_id = "";
	        }).catch(() => {
          	that.$router.push("/main/hospital");
					});
				});
			}
		},
		methods:{
			returnList(){
				this.$router.push("/main/hospital");
			},
			submitForm(formName) {
				var that = this;
      	this.$refs[formName].validate((valid) => {
        	if (valid) {
          		that.ipc.send('edit-hospital',this.hospital);
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
