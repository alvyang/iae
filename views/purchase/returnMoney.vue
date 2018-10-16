<template>
	<div style="padding:0 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/purchase' }">高打品种销售管理</el-breadcrumb-item>
			<el-breadcrumb-item>返现详情</el-breadcrumb-item>
		</el-breadcrumb>
    <el-table :data="report" style="width: 100%">
        <el-table-column fixed prop="contacts_name" label="联系人姓名" width="140"></el-table-column>
        <el-table-column prop="contacts_phone" label="联系人手机号" ></el-table-column>
        <el-table-column prop="pm" label="采购总额(元)" ></el-table-column>
        <el-table-column prop="sm" label="应返金额(元)" ></el-table-column>
        <el-table-column prop="rm" label="实返金额(元)" ></el-table-column>
        <el-table-column prop="wm" label="未返金额(元)" :formatter="formatterWm"></el-table-column>
    </el-table>
	</div>
</template>
<script>
	export default({
    data(){
      return {
        report:[]
      }
    },
    mounted(){
      var that = this;
			if (window.require) {
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('return-purchase-report', (event, arg) => {
          this.report = arg.data;
				});
        that.ipc.send('get_purchase_report');
      }
    },
    methods:{
      formatterWm(row, column, cellValue){
        return row.sm-row.rm;
      }
    }
	});
</script>
<style scoped="scoped">

</style>
