<template>
  <div class="login" :style="{'background-image':'url('+bg+')','height':height+'px'}">
    <div class="mask" v-show="tips != 'new'">
      <el-progress type="circle" :percentage="downloadPercent"></el-progress>
      <div class="download_title">{{tips}}</div>
    </div>
    <div class="login_div">
      <div class="login_title">欢迎使用药品进销存管理软件</div>
      <div class="login_operation">
        <div class="login_operation_title">登&nbsp&nbsp&nbsp陆</div>
        <div style="padding-left:20px;padding-right:20px;margin-top:16px;">
          <el-form :model="login" status-icon :rules="rules" ref="login" label-width="0px" class="demo-ruleForm">
            <el-form-item prop="groupCode">
              <el-input type="text" class="group" style="width:320px;" @keyup.13.native="submitForm('login')" v-model="login.groupCode" placeholder="请输入组编码"></el-input>
            </el-form-item>
            <el-form-item prop="username">
              <el-input type="text" class="username" style="width:320px;" @keyup.13.native="submitForm('login')" v-model="login.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input type="password" class="password" style="width:320px;" @keyup.13.native="submitForm('login')" v-model="login.password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item prop="code" class="code" >
              <el-input type="text" v-model="login.code" @keyup.13.native="submitForm('login')" :maxlength="4" placeholder="请输入验证码"></el-input>
              <div class="img_div" @click="refreshCode" title="点击刷新">
                <img :src="$bus.data.host+'/iae/login/captcha?v='+datetime" style="height:40px;"/>
              </div>
            </el-form-item>
          </el-form>
          <div style="margin-bottom:5px;">
            <el-checkbox v-model="login.remember">记住密码</el-checkbox>
          </div>
          <el-button type="primary" v-dbClick style="width:100%;font-size28px;" @keyup.13="submitForm('login')" @click="submitForm('login')">登&nbsp&nbsp&nbsp陆</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import p from "../package.json";
  export default({
    data(){
      return {
        session:null,
        datetime:"",
        tips:"new",
        downloadPercent:0,
        login:{
          username:"",
          password:"",
          machineCode:"",
          code:"",
          version:p.version,
          remember:true,
          groupCode:""
        },
        ipcRenderer:"",
        rules: {
          groupCode:[{required: true, message: '请输入组编码', trigger: 'blur'}],
          username:[{required: true, message: '请输入用户名', trigger: 'blur'}],
          password:[{required: true, message: '请输入密码', trigger: 'blur' }],
          code:[{required: true, message: '请输入验证码', trigger: 'blur' }]
        },
        bg:"img/login.png",
        height:"",
      }
    },
    activated(){
      this.getCookies("login_message");
      this.refreshCode();
      this.login.code = "";
      this.datetime = new Date().getTime();
      this.height = $(window).height();
      var that = this;
      $(window).resize(function(){
        that.height = $(window).height();
      });

      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.ipcRenderer.send("checkForUpdate");
			this.ipcRenderer.on("message", (event, text) => {
         this.tips = text;
     	});
     	this.ipcRenderer.on("downloadProgress", (event, progressObj)=> {
         this.downloadPercent = progressObj.percent || 0;
         this.downloadPercent = Math.round(this.downloadPercent);
     	});
     	this.ipcRenderer.on("isUpdateNow", () => {
         that.ipcRenderer.send("isUpdateNow");
     	});
    },
    deactivated(){
      //组件销毁前移除所有事件监听channel
      this.ipcRenderer.removeAll(["message", "downloadProgress", "isUpdateNow"]);
    },
    mounted(){
      this.session = window.require('electron').remote.session;
    },
    methods:{
      setCookie(name, value){
        let Days = 60;
        let exp = new Date();
        let date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
        const cookie = {
          url: this.$bus.data.host,
          name: name,
          value: value,
          expirationDate: date
        };
        this.session.defaultSession.cookies.set(cookie, (error) => {
          if (error) console.error(error);
        });
      },
      clearCookies(){
        this.session.defaultSession.clearStorageData({
          origin: this.$bus.data.host,
          storages: ['cookies']
        }, function (error) {
          if (error) console.error(error);
        })
      },
      getCookies(){
        var _self = this;
        this.session.defaultSession.cookies.get({ url: this.$bus.data.host}, function (error, cookies) {
          if (cookies.length > 0) {
            for(var i = 0 ; i < cookies.length ; i++){
              if(cookies[i].name == "login_message"){
                var temp = JSON.parse(cookies[i].value);
                _self.login.username = temp.username;
                _self.login.password = temp.password;
                _self.login.remember = temp.remember;
                _self.login.groupCode = temp.groupCode;
                break;
              }
            }
          }
        });
      },
      refreshCode(){
        this.datetime = new Date().getTime();
      },
      submitForm(formName) {
         this.$refs[formName].validate((valid) => {
           if (valid) {
              var _self = this;
       				$.ajax({
       					type: "post",
       					url: _self.$bus.data.host+"/iae/login/login",
       					data:_self.login,
       					success: function(res) {
                  if(res.code == "100001"){//验证码错识
                    _self.refreshCode();
                    _self.$message.error("验证码错误");
                  } else if(res.code == "100000"){
                    _self.refreshCode();
                    _self.$message.error("用户名或密码错误");
                  } else if(res.code == "100002"){
                    _self.refreshCode();
                    var temp = res.message.startTime.substring(0,10)+" - "+res.message.endTime.substring(0,10);
                    _self.$message.warning("使用期限为："+temp+"。请续费。");
                  } else if(res.code == "100003"){
                    _self.refreshCode();
                    _self.$message.error("该电脑没有授权登陆");
                  }  else if(res.code == "000000"){
                    sessionStorage["user"] = JSON.stringify(res.message[0]);
       							_self.$router.push("/main");
                    if(!_self.login.remember){
                      _self.login.password = "";
                    }
                    _self.setCookie("login_message",JSON.stringify(_self.login),1000 * 60 * 60);

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
  .mask{
    position:absolute;
    width: 100%;
    height: 100%;
    top:0;
    bottom:0;
    left:0;
    right:0;
    background-color:rgba(0,0,0,0.7);
    z-index: 10;
  }
  .mask .el-progress__text{
    color: #ffffff;
  }
  .mask > .download_title{
    position: absolute;
    height: 40px;
    width: 100%;
    top: 50%;
    margin-top: -140px;
    /* margin-top: -200px; */
    font-size: 18px;
    text-align:center;
    color: #ffffff;
  }
  .mask > .el-progress{
    position: absolute;
    left: 50%;
    top: 50%;
    margin-top: -84px;
    margin-left: -64px;
  }
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
  .group input{
    background: url("../img/group.png") 8px center no-repeat;
    background-size: 20px 20px;
    text-indent: 20px;
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
    height: 390px;
    border-radius: 4px;
  }
  .login_div{
    width: 360px;
    height: 390px;
    position: absolute;
    left:50%;
    top: 50%;
    margin-left: -180px;
    margin-top:-210px;
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
