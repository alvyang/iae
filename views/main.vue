<template>
	<div>
		<div class="main_top">
			<el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" :router="routerFlag"
			  background-color="#545c64"
			  text-color="#fff"
			  active-text-color="#ffd04b">
			  <el-menu-item index="/main/home">首页</el-menu-item>
			  <el-menu-item index="/main/purchase">进货管理</el-menu-item>
			  <el-menu-item index="/main/sales">销售管理</el-menu-item>
				<el-submenu index="drugs">
			    <template slot="title">药品管理</template>
			    <el-menu-item index="/main/drugs/1">高打品种药品管理</el-menu-item>
					<el-menu-item index="/main/drugs/2">普通药品管理</el-menu-item>
			  </el-submenu>
			  <el-submenu index="database">
			    <template slot="title">信息管理</template>
			    <el-menu-item index="/main/contacts">联系人管理</el-menu-item>
					<el-menu-item index="/main/hospital">销售机构管理</el-menu-item>
			  </el-submenu>
			</el-menu>
			<router-link :to="{ path: '/login'}" class="login_out">退出登陆</router-link>
		</div>
		<div style="height: 70px;"></div>
		<div class="main_content" style="padding-bottom: 20px;">
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
				routerFlag:true
			}
		},
		mounted(){
		},
		methods:{

		}
	})
</script>
<style>
	.login_out{
		position: fixed;
		float: right;
		top:0px;
		right: 0px;
		height: 61px;
		line-height: 61px;
		padding-right: 20px;
		color: #fff;
		text-decoration: none;
	}
	.main_top{
		position: fixed;
		width: 100%;
		height: 70px;
		z-index: 10;
	}
	.view{
		background-color: #f4f4f4;
	}
</style>
