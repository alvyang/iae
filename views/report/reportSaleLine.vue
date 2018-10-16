<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售额/毛利统计（按月）</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="商业" prop="business">
        <el-select v-model="params.business" style="width:210px;" size="mini" filterable>
          <el-option key="" label="全部" value=""></el-option>
          <el-option v-for="item in business"
            :key="item.business_id"
            :label="item.business_name"
            :value="item.business_id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="销往单位" prop="hospitalsId">
			 <el-select v-model="params.hospitalsId" style="width:210px;" filterable size="mini">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option v-for="item in hospitals"
					 :key="item.hospital_id"
					 :label="item.hospital_name"
					 :value="item.hospital_id">
				 </el-option>
	 	   </el-select>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('99') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('99') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
    <div id="sale_month_line" style="width:100%;height:300px;background-color:#ffffff;padding-top:20px;"></div>
    <div style="margin-top:10px;padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" style="width: 100%" size="mini" :stripe="true" :border="true">
    			<el-table-column prop="all_day" label="日期" width="80" ></el-table-column>
  				<el-table-column prop="smt" label="销售额" width="140"></el-table-column>
          <el-table-column prop="rgpt" label="真实毛利" width="140"></el-table-column>
          <el-table-column label="真实毛利率(%)" width="120"  :formatter="formatterPercent"></el-table-column>
  		</el-table>
    </div>
  </div>
</template>
<script>
  import echarts from "echarts";
  export default({
    data(){
        return{
          params:{
            hospitalsId:'',
            business:''
          },
          hospitals:[],
          listData:[],
          business:[],
          authCode:""
        }
    },
    activated(){
      this.getSales();
      this.getProductBusiness();
      this.getHospitals();
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      formatterPercent(row, column, cellValue){
        if(row.smt > 0){
          return this.mul(this.div(row.rgpt,row.smt,4),100,2);
        }else{
          return "0";
        }
      },
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.getSales();
      },
      getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
      getHospitals(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'销售医院'},function(res){
						_self.hospitals = res.message;
				});
			},
      getSales(){
        var _self = this;
				this.jquery('/iae/report/getSalesMonth',_self.params,function(res){
					_self.dialogFormVisible = true;
          _self.showSalesMonthLine(res.message.imageData);
          _self.listData = res.message.listData
				});
      },
      showSalesMonthLine(arg){
        // 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('sale_month_line'));
	      // 指定图表的配置项和数据
				var option = {
          title: {
             text: '销售额折线图（按月）'
          },
					color: ["#8ad163","#b373f4"],
					grid:{
						top:"80px",
					},
          legend:{
              data:['销售额','真实毛利']
          },
					tooltip: {
		        trigger: 'axis'
			    },
			    xAxis: {
		        type: 'category',
						name: '日期',
						boundaryGap: false,
		        data:arg.time.reverse()
			    },
			    yAxis: {
            type: 'value'
			    },
			    series: [{
            name:'销售额',
            type:'line',
            data:arg.money.reverse()
	        },{
            name:'真实毛利',
            type:'line',
            data:arg.rgpt.reverse()
	        }]
				};
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
      }
    }
  })
</script>
<style>

</style>
