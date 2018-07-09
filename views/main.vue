<template>
	<div>
		<div class="main_top">
			<el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" :router="routerFlag"
			  background-color="#545c64"
			  text-color="#fff"
			  active-text-color="#ffd04b">
			  <el-menu-item index="/main/home">首页</el-menu-item>
				<template v-for="a in authList">
					<el-menu-item v-if="a.children.length == 0 || a.authority_type == '2'" :index="a.authority_path">{{a.authority_name}}</el-menu-item>
					<el-submenu v-else :index="a.authority_id+''">
						<template slot="title">{{a.authority_name}}</template>
						<el-menu-item v-for="sa in a.children"  :index="sa.authority_path">{{sa.authority_name}}</el-menu-item>
					</el-submenu>
				</template>
			</el-menu>
			<div class="login_out" v-show="username">
				<el-dropdown @command="handleCommand">
		      <span class="el-dropdown-link">
		       	{{username}}<i class="el-icon-arrow-down el-icon--right"></i>
		      </span>
		      <el-dropdown-menu slot="dropdown">
		        <el-dropdown-item command="login_out">退出登陆</el-dropdown-item>
		        <el-dropdown-item command="modify_password">修改密码</el-dropdown-item>
		      </el-dropdown-menu>
		    </el-dropdown>
			</div>
		</div>
		<div style="height: 60px;"></div>
		<div class="main_content" :style="{height:height+'px'}">
			<keep-alive>
				<router-view class="view"></router-view>
			</keep-alive>
		</div>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				routerFlag:true,
				username:"",
				height:0,
				authList:[]
			}
		},
		activated(){
			this.getAuthorityList();
			this.username = JSON.parse(sessionStorage["user"]).realname;
		},
		mounted(){
			this.height = $(window).height() - 60;
			var that = this;
			$(window).resize(function(){
					that.height = $(window).height() - 60;
			});
		},
		methods:{
			getAuthorityList(){
				var _self = this;
				var user = JSON.parse(sessionStorage["user"])
				var authCode = user.authority_code;
				if(user.authority_parent_code){
					authCode += ","+user.authority_parent_code;
				}
				this.jquery('/iae/authority/getAuthoritysList',{
					authority_code:authCode,
				},function(res){
					console.log(res);
					_self.authList = res.message[0].children;
				});
			},
			handleCommand(command) {
				if(command == "login_out"){
					this.$router.push({path:"/login"});
				}else if(command == "modify_password"){
					this.$router.push({path:"/main/password"});
				}
      }
		}
	})
</script>
<style>
	.login_out{
		position: fixed;
		float: right;
		top:0px;
		right: 0px;
		line-height: 61px;
		padding-right: 20px;
		color: #fff;
		text-decoration: none;
		cursor: pointer;
	}
	.login_out .el-dropdown{
		color: #fff;
		height: 40px;
	}
	.main_top{
		position: fixed;
		width: 100%;
		height: 60px;
		z-index: 10;
	}
	.view{
		background-color: #f4f4f4;
	}
	.main_content{
		padding: 10px;
		box-sizing: border-box;
	}
</style>
