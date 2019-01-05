<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售量/额统计（按真实毛利率）</el-breadcrumb-item>
		</el-breadcrumb>

    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="统计区间" prop="rate_gap">
        <el-input-number v-model="params.rate_gap" :precision="0" :step="1" :max="100"></el-input-number>
      </el-form-item>
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
      <el-form-item label="销售日期" prop="salesTime">
 			 <el-date-picker v-model="params.salesTime" type="daterange" size="mini" align="right" unlink-panels
 				 range-separator="至"
 				 start-placeholder="开始日期"
 				 end-placeholder="结束日期"
 				 :picker-options="pickerOptions2">
 			 </el-date-picker>
 		 </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('99,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('99,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
    <div style="margin-top:10px;padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column prop="realRate" label="真实毛利率区间" width="200" :formatter="formatRate"></el-table-column>
          <el-table-column prop="sale_money" label="销售额" width="200" :formatter="formatNumber"></el-table-column>
          <el-table-column prop="real_gross_profit" label="真实毛利" width="200" :formatter="formatNumber"></el-table-column>
          <el-table-column label="平均真实毛利率" width="200" :formatter="formatRataAverage"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
  import echarts from "echarts";
  export default({
    data(){
      const nowDate = new Date();
        return{
          pickerOptions2: {
  					shortcuts: [{
  						text: '本月',
  						onClick(picker) {
  							const end = new Date();
  							const start = new Date(end.getFullYear()+"-"+(end.getMonth()+1)+"-01");
  							picker.$emit('pick', [start, end]);
  						}
  					},{
  						text: nowDate.getFullYear()+'年',
  						onClick(picker) {
  							const end = new Date();
  							const start = new Date(end.getFullYear()+"-01"+"-01");
  							picker.$emit('pick', [start, end]);
  						}
  					}]
  				},
          params:{
            hospitalsId:'',
            business:'',
            rate_gap:10,
            salesTime:[]
          },
          listData:[],
          hospitals:[],
          business:[],
          authCode:"",
        }
    },
    activated(){
      this.getSalesByProfitRate();
      this.getProductBusiness();
      this.getHospitals();
      this.firstRate="";
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.getSalesByProfitRate();
      },
      formatNumber(row, column, cellValue, index){
        return Math.round(cellValue*100)/100;
      },
      formatRataAverage(row, column, cellValue, index){
        return Math.round(row.real_gross_profit*100/row.sale_money)+"%";
      },
      formatRate(row, column, cellValue, index){
        var gap = this.params.rate_gap?this.params.rate_gap:10;
        var firstRate = index>0?this.listData[index-1].realRate*gap+"%-":"<";
        var temp = firstRate+cellValue*gap+"%";
        return temp;
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
      getSalesByProfitRate(){
        var _self = this;
        this.jquery('/iae/report/getSalesByProfitRate',_self.params,function(res){
						_self.listData= res.message;
        });
      }
    }
  })
</script>
<style>

</style>
