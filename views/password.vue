<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item>{{params.username}}</el-breadcrumb-item>
			<el-breadcrumb-item>退出登录</el-breadcrumb-item>
		</el-breadcrumb>
		<div class="add_div">
			<div style="width:400px;margin: 20px auto;">
				<el-form :model="params" status-icon :rules="paramsRule" ref="params" label-width="80px" class="demo-ruleForm">
          <el-form-item label="旧密码" prop="password">
            <el-input type="password" v-model="params.password" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="pass" :required="true">
            <el-input type="password" v-model="params.pass" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPass" :required="true">
            <el-input type="password" v-model="params.checkPass" :maxlength="20" auto-complete="off"></el-input>
          </el-form-item>
				  <el-form-item>
				    <el-button type="primary" @click="submitForm('params')">提交</el-button>
				    <el-button @click="returnList">返回</el-button>
				  </el-form-item>
				</el-form>
			</div>
		</div>
	</div>
</template>
<script>
  import $ from "jquery";
	export default({
		data(){
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.params.checkPass !== '') {
            this.$refs.params.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.params.pass) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
			return {
        params:{
          username:"",
          password:"",
          pass:"",
          checkPass:""
        },
				paramsRule:{
          password: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
          pass: [{validator: validatePass, trigger: 'blur' }],
          checkPass: [{validator: validatePass2, trigger: 'blur'}],
				}
			}
		},
		mounted(){
			this.params.username = sessionStorage["username"];
		},
		methods:{
			returnList(){
				this.$router.push("/main");
			},
			submitForm(formName) {
			  var that = this;
        this.$refs[formName].validate((valid) => {
        	if (valid) {
            var _self = this;
            $.ajax({
              type: "post",
              url: "http://139.129.238.114/iae/login/password",
              data:_self.params,
              success: function(res) {
                if(res.code == "100000"){//验证码错识
                  _self.$message.error("旧密码错误！");
                } else if(res.code == "000000"){
                  _self.$message.success("修改成功！");
                }
              }
            });
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
