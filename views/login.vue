<template>
  <div class="login" :style="{'background-image':'url('+bg+')','height':height+'px'}">
    <div class="login_div">
      <div class="login_title">欢迎使用药品销售管理软件</div>
      <div class="login_operation">
        <div class="login_operation_title">登&nbsp&nbsp&nbsp陆</div>
        <div style="padding-left:20px;padding-right:20px;margin-top:16px;">
          <el-form :model="login" status-icon :rules="rules" ref="login" label-width="0px" class="demo-ruleForm">
            <el-form-item prop="username">
              <el-input type="text" class="username" v-model="login.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input type="password" class="password" v-model="login.password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item prop="code" class="code" >
              <el-input type="text" v-model="login.code" :maxlength="4" placeholder="请输入验证码"></el-input>
              <div class="img_div" @click="refreshCode" title="点击刷新">
                <img :src="'http://139.129.238.114/iae/login/captcha?v='+datetime" style="height:40px;"/>
              </div>
            </el-form-item>
          </el-form>
          <el-button type="primary" style="width:100%;font-size28px;" @keyup.13="submitForm('login')" @click="submitForm('login')">登&nbsp&nbsp&nbsp陆</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import $ from "jquery";
  export default({
    data(){
      return {
        datetime:"",
        ipc:"",
        login:{
          username:"",
          password:"",
          machineCode:"",
          code:"",
        },
        rules: {
          username:[{required: true, message: '请输入用户名', trigger: 'blur'}],
          password:[{required: true, message: '请输入密码', trigger: 'blur' }],
          code:[{required: true, message: '请输入验证码', trigger: 'blur' }]
        },
        bg:"img/login.png",
        height:"",
      }
    },
    activated(){
      this.refreshCode();
      this.datetime = new Date().getTime();
      this.height = $(window).height();
      var that = this;
      $(window).resize(function(){
        that.height = $(window).height();
      });
    },
    mounted(){
      if (window.require) {
				//获取药品信息
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('code-return', (event, arg) => {
				  	this.login.machineCode = arg;
				});
				this.ipc.send('get-code');
			}
    },
    methods:{
      refreshCode(){
        this.datetime = new Date().getTime();
      },
      submitForm(formName) {
          console.log(this.login);
         this.$refs[formName].validate((valid) => {
           if (valid) {
              var _self = this;
       				$.ajax({
       					type: "post",
       					url: "http://139.129.238.114/iae/login/login",
       					data:_self.login,
       					success: function(res) {
                  if(res.code == "100001"){//验证码错识
                    _self.refreshCode();
                    _self.$message.error("验证码错误");
                  } else if(res.code == "100000"){
                    _self.refreshCode();
                    _self.$message.error("用户名或密码错误");
                  } else if(res.code == "100002"){
                    var temp = res.message.startTime.substring(0,10)+" - "+res.message.endTime.substring(0,10);
                    _self.$message.warning("使用期限为："+temp+"。请续费。");
                  } else if(res.code == "100003"){
                    _self.$message.error("该电脑没有授权登陆");
                  }  else if(res.code == "000000"){
       							_self.$router.push("/main");
       						}
       					}
       				});
           } else {
             console.log('error submit!!');
             return false;
           }
         });
      },
    }
  });
</script>
<style>
  .code{
    position: relative;
  }
  .code .img_div{
    position: absolute;
    overflow: hidden;
    right: 0px;
    top: 0px;
    height: 40px;
    cursor: pointer;
  }
  .code .el-input{
    width:180px;
  }
  .code input{
    background: url("../img/code.png") 8px center no-repeat;
    background-size: 20px 20px;
    text-indent: 20px;
    width:180px;
  }
  .password > input{
    background: url("../img/password.png") 8px center no-repeat;
    background-size: 20px 20px;
    text-indent: 20px;
  }
  .username > input{
    background: url("../img/username.png") 8px center no-repeat;
    background-size: 20px 20px;
    text-indent: 20px;
  }
  .login_operation_title{
    height: 40px;
    line-height: 40px;
    font-size: 18px;
    text-align: center;
    background-color: #409EFF;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    color: #fff;
  }
  .login_operation{
    background: #fff;
    height: 300px;
    border-radius: 4px;
  }
  .login_div{
    width: 360px;
    height: 300px;
    position: absolute;
    left:50%;
    top: 50%;
    margin-left: -180px;
    margin-top:-180px;
  }
  .login_title{
    padding-bottom:20px;
    font-size: 22px;
    text-align: center;
    color: #fff;
  }
  .login{
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    background-attachment:fixed;
  }
</style>
