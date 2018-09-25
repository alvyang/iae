<template>
	<div style="box-sizing: border-box;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>财务管理</el-breadcrumb-item>
			<el-breadcrumb-item>商务提成管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-tabs tab-position="left" style="margin-top:10px;">
	    <el-tab-pane label="商业提成列表">
				<businesscommission-list></businesscommission-list>
			</el-tab-pane>
			<el-tab-pane label="回款管理">
				<return-money-list></return-money-list>
			</el-tab-pane>
			<el-tab-pane label="商业成本配置">
			 <businesscommission-config></businesscommission-config>
		 </el-tab-pane>
	  </el-tabs>
	</div>
</template>
<script>
	import businesscommissionlist from "./businesscommissionList.vue";
	import businesscommissionconfig from "./businesscommissionConfig.vue";
	import returnmoneylist from "./returnmoneyList.vue";
	export default({
		data(){
			return {}
		},
		components:{
			'businesscommission-list':businesscommissionlist,
			'businesscommission-config':businesscommissionconfig,
			'return-money-list':returnmoneylist
		}
	})
</script>
<style>

</style>
