<template>
	<div>
		<div class="main_top">
			<el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" :router="routerFlag"
			  background-color="#545c64"
			  text-color="#fff"
			  active-text-color="#ffd04b">
			  <el-menu-item index="/main/home">首页</el-menu-item>
			  <el-menu-item index="/main/purchase">进货记录</el-menu-item>
			  <el-menu-item index="/main/distributionreport">销售记录</el-menu-item>
			  <el-submenu index="database">
			    <template slot="title">基础数据</template>
			    <el-menu-item index="/main/drugs">药品信息</el-menu-item>
			    <el-menu-item index="/main/contacts">联系人信息</el-menu-item>
			  </el-submenu>
			</el-menu>
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
