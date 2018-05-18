<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/drugs' }">药品信息</el-breadcrumb-item>
			<el-breadcrumb-item>{{this.editmessage}}药品</el-breadcrumb-item>
		</el-breadcrumb>
		<div class="add_div">
			<div style="width:700px;margin: 20px auto;">
				<el-form :model="drugs" status-icon :rules="drugsRule" ref="drugs" :inline="true" label-width="100px" class="demo-ruleForm">
					<el-form-item label="产品通用名" prop="product_common_name">
						<el-input v-model="drugs.product_common_name" auto-complete="off" :maxlength="20" placeholder="请输入产品通用名"></el-input>
					</el-form-item>
					<el-form-item label="产品编号" prop="product_code">
						<el-input v-model="drugs.product_code" auto-complete="off" :maxlength="20" placeholder="请输入产品编号"></el-input>
					</el-form-item>
					<el-form-item label="产品规格" prop="product_specifications">
						<el-input v-model="drugs.product_specifications" :maxlength="10" auto-complete="off" placeholder="请输入产品规格"></el-input>
					</el-form-item>
					<el-form-item label="单位" prop="product_unit">
						<el-input v-model="drugs.product_unit" auto-complete="off" :maxlength="10" placeholder="请输入单位"></el-input>
					</el-form-item>
					<el-form-item label="价格" prop="product_price">
						<el-input v-model="drugs.product_price" auto-complete="off" :maxlength="20" placeholder="请输入中标价"></el-input>
					</el-form-item>
					<el-form-item label="生产产家" prop="product_makesmakers">
						<el-input v-model="drugs.product_makesmakers" auto-complete="off" :maxlength="100" placeholder="请输入生产产家"></el-input>
					</el-form-item>
					<el-form-item label="包装" prop="product_packing">
						<el-input v-model="drugs.product_makesmakers" auto-complete="off" :maxlength="100" placeholder="请输入生产产家"></el-input>
					</el-form-item>
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
			return {
				ipc:null,
				drugs:{
					product_id:"",
					product_common_name:"",
					product_specifications:"",
					product_unit:"",
					product_packing:"",
					product_price:"",
					product_code:"",
					product_makesmakers:"",
				},
				drugsRule:{
					product_common_name:[{ required: true, message: '请输入产品通用名', trigger: 'blur' }],
					product_specifications:[{ required: true, message: '请输入产品规格', trigger: 'blur' }],
					product_unit:[{ required: true, message: '请输入单位', trigger: 'blur' }],
					product_price:[{ required: true, message: '请输入价格', trigger: 'blur' }],
					product_code:[{ required: true, message: '请输入产品编号', trigger: 'blur' }],
					product_makesmakers:[{ required: true, message: '请输入生产产家', trigger: 'blur' }],
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
			if (window.require) {
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('edit-drugs-return', (event, arg) => {
			  	that.$confirm(that.editmessage+'成功', '提示', {
	          	confirmButtonText:'继续添加',
	          	cancelButtonText:'返回列表',
	          	type: 'success'
	        }).then(() => {
	          	that.resetForm("drugs");
	          	that.drugs.product_id = "";
	        }).catch(() => {
	          	that.$router.push({path:`/main/drugs`});
					});
				});
			}
		},
		methods:{
			returnList(){
				this.$router.push({path:`/main/drugs`});
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
<style scoped="scoped">
	.el-select{
	  width: 179px !important;
	}
</style>
