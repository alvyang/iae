<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售量/额统计（按销往单位）</el-breadcrumb-item>
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
      <el-form-item label="销售日期" prop="salesTime">
 			 <el-date-picker v-model="params.salesTime" type="daterange" size="mini" align="right" unlink-panels
 				 range-separator="至"
 				 start-placeholder="开始日期"
 				 end-placeholder="结束日期"
 				 :picker-options="pickerOptions2">
 			 </el-date-picker>
 		 </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',99,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',99,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
    <div style="margin-top:10px;padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column prop="hospital_name" label="销售单位" width="200"></el-table-column>
          <el-table-column prop="sale_money" label="销售额" width="200" :formatter="formatNumber"></el-table-column>
      </el-table>
    </div>
    <div class="page_div">
			<el-pagination
				background
	      @size-change="handleSizeChange"
	      @current-change="handleCurrentChange"
	      :current-page="currentPage"
	      :page-sizes="[5, 10, 50, 100]"
	      :page-size="pageNum"
	      layout="total, sizes, prev, pager, next"
	      :total="count">
	    </el-pagination>
		</div>
  </div>
</template>
<script>
  import echarts from "echarts";
  export default({
    data(){
      const nowDate = new Date();
      const beforeDate = new Date();
			beforeDate.setFullYear(nowDate.getFullYear()-1);
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
  					},{
  						text: beforeDate.getFullYear()+'年',
  						onClick(picker) {
  							const start = new Date(beforeDate.getFullYear()+"-01"+"-01");
  							const end = new Date(beforeDate.getFullYear()+"-12"+"-31");
  							picker.$emit('pick', [start, end]);
  						}
  					}]
  				},
          params:{
            hospitalsId:'',
            business:'',
            salesTime:[]
          },
          listData:[],
          business:[],
          authCode:"",
          pageNum:10,
  				currentPage:1,
  				count:0,
        }
    },
    activated(){
      this.getSalesByHospital();
      this.getProductBusiness();
      this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.getSalesByHospital();
      },
      formatNumber(row, column, cellValue, index){
        return Math.round(cellValue*100)/100;
      },
      getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
      getSalesByHospital(){
        var _self = this;
        if(!_self.currentPage){
          _self.currentPage = 1;
        }
        if(!_self.pageNum){
          _self.pageNum = 10;
        }
				var page = {
          start:(_self.currentPage-1)*_self.pageNum,
          limit:_self.pageNum
        }
        this.jquery('/iae/report/getSalesByHospital',{
					data:_self.params,
          page:page
        },function(res){
						_self.listData= res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
      },
      handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getSalesByHospital();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getSalesByHospital();
    	}
    }
  })
</script>
<style>

</style>
