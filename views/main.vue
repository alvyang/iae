<template>
	<div>
		<div class="main_top">
			<el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" :router="routerFlag"
			  background-color="#545c64"
			  text-color="#fff"
			  active-text-color="#ffd04b">
			  <el-menu-item index="/main/home">首页</el-menu-item>
				<el-menu-item index="/main/sales">普通品种销售管理</el-menu-item>
			  <el-menu-item index="/main/purchase">高打品种销售管理</el-menu-item>
				<el-menu-item index="/main/drugs">药品管理</el-menu-item>
			  <el-submenu index="database">
			    <template slot="title">信息管理</template>
			    <el-menu-item index="/main/contacts">联系人管理</el-menu-item>
					<el-menu-item index="/main/hospital">销售机构管理</el-menu-item>
			  </el-submenu>
				<el-submenu index="system">
			    <template slot="title">系统管理</template>
			    <el-menu-item index="/main/authority">权限管理</el-menu-item>
					<el-menu-item index="/main/role">角色管理</el-menu-item>
					<el-menu-item index="/main/group">用户组管理</el-menu-item>
					<el-menu-item index="/main/user">用户管理</el-menu-item>
			  </el-submenu>
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
			}
		},
		mounted(){
			this.height = $(window).height() - 60;
			this.username = sessionStorage["username"];
			var that = this;
			$(window).resize(function(){
					that.height = $(window).height() - 60;
			});
		},
		methods:{
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
