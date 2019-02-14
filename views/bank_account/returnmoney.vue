<template>
  <div style="box-sizing: border-box;">
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>财务管理</el-breadcrumb-item>
			<el-breadcrumb-item>医院回款管理</el-breadcrumb-item>
		</el-breadcrumb>
    <return-money-list></return-money-list>
  </div>
</template>
<script>
  import returnmoneylist from "./returnmoneyList.vue";
  export default({
		data(){
			return {}
		},
		components:{
			'return-money-list':returnmoneylist
		}
	})
</script>
<style>

</style>
