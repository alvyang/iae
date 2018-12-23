<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/reportcomprehensive' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>利润/负债综合统计（近12个月）表格</el-breadcrumb-item>
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
    <div style="margin-top:10px;padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" style="width: 100%" size="mini" :stripe="true" :border="true" :span-method="objectSpanMethod">
          <el-table-column fixed prop="time" label="日期" width="80"></el-table-column>
          <el-table-column prop="saleMoney0" label="高打销售额" width="100" :formatter="formatNumber"></el-table-column>
          <el-table-column prop="saleMoney1" label="佣金销售额" width="100" :formatter="formatNumber"></el-table-column>
          <el-table-column prop="saleMoney2" label="其它销售额" width="140" :formatter="formatNumber"></el-table-column>
          <el-table-column label="按返(回)款时间算">
            <el-table-column prop="apurchaseReturnMoney1" label="备货返款" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="crefundsMoney1" label="销售返款(佣金)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="cReturnMoney0" label="销售回款(高打)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="cReturnMoney1" label="销售回款(佣金)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="callotReturnMoney0" label="调货回款" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column label="利润" width="120" :formatter="formatRefundProfit"></el-table-column>
          </el-table-column>
          <el-table-column label="按销售(打款)时间">
            <el-table-column prop="apurchaseReturnMoney0" label="备货返款" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="refundsMoney1" label="销售返款(佣金)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="aReturnMoney0" label="销售回款(高打)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="aReturnMoney1" label="销售回款(佣金)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="allotReturnMoney0" label="调货回款" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column label="利润" width="120" :formatter="formatSaleProfit"></el-table-column>
          </el-table-column>
          <el-table-column label="按销售(打款)时间-欠款">
            <el-table-column prop="npurchaseReturnMoney0" label="备货未返款" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="srefundsMoney1" label="销售未返款(佣金)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column label="未返款总额" width="120" :formatter="formatNofefund"></el-table-column>
          </el-table-column>
          <el-table-column label="按销售(打款)时间-负债">
            <el-table-column prop="nReturnMoney0" label="销售未回款(高打)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="nReturnMoney1" label="销售未回款(佣金)" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column prop="allotReturnMoney1" label="调货未回款" width="120" :formatter="formatNumber"></el-table-column>
            <el-table-column label="未回款总负债" width="100" :formatter="formatNoRefund"></el-table-column>
          </el-table-column>
          <el-table-column prop="stockMoneyReturn" label="库存总负债" width="90" :formatter="formatNumber"></el-table-column>

      </el-table>
    </div>
    <!-- <div class="page_div">
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
		</div> -->
  </div>
</template>
<script>
  import echarts from "echarts";
  export default({
    data(){
      const nowDate = new Date();
        return{
          params:{
            hospitalsId:'',
            business:''
          },
          listData:[],
          hospitals:[],
          business:[],
          authCode:"",
          pageNum:10,
  				currentPage:1,
  				count:0,
        }
    },
    activated(){
      this.getComprehensive();
      this.getProductBusiness();
      this.getHospitals();
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.getComprehensive();
      },
      formatNofefund(row, column, cellValue, index){
        var t = 0;
        for(var i = 0 ; i < this.listData.length;i++){
           t+=this.listData[i].npurchaseReturnMoney0 + this.listData[i].srefundsMoney1;
        }
        return Math.round(t*100)/100;
      },
      formatNoRefund(row, column, cellValue, index){
        var t = 0;
        for(var i = 0 ; i < this.listData.length;i++){
           t+=this.listData[i].nReturnMoney0 + this.listData[i].nReturnMoney1 + this.listData[i].allotReturnMoney1;
        }
        return Math.round(t*100)/100;
      },
      formatSaleProfit(row, column, cellValue, index){
        var t = row.apurchaseReturnMoney0+row.refundsMoney1-row.aReturnMoney0-row.aReturnMoney1-row.allotReturnMoney0;
        return Math.round(t*100)/100;
      },
      formatRefundProfit(row, column, cellValue, index){
        var t = row.apurchaseReturnMoney1+row.crefundsMoney1-row.cReturnMoney0-row.cReturnMoney1-row.callotReturnMoney0;
        return Math.round(t*100)/100;
      },
      formatNumber(row, column, cellValue, index){
        return cellValue?cellValue:0;
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 18) {
          if (rowIndex % 12 === 0) {
            return {
              rowspan: 12,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
        if (columnIndex === 22) {
          if (rowIndex % 12 === 0) {
            return {
              rowspan: 12,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
        if (columnIndex === 23) {
          if (rowIndex % 12 === 0) {
            return {
              rowspan: 12,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
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
      getComprehensive(){
        var _self = this;
        // if(!_self.currentPage){
        //   _self.currentPage = 1;
        // }
        // if(!_self.pageNum){
        //   _self.pageNum = 10;
        // }
				// var page = {
        //   start:(_self.currentPage-1)*_self.pageNum,
        //   limit:_self.pageNum
        // }
        this.jquery('/iae/report/getReportComprehensive',_self.params,function(res){
						_self.listData= res.message;
            // _self.pageNum=parseInt(res.message.limit);
    				// _self.count=res.message.totalCount;
        });
      },
      handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getComprehensive();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getComprehensive();
    	}
    }
  })
</script>
<style>
  .el-table_1_column_12_column_18,.el-table_1_column_5_column_11,.el-table_2_column_28_column_34,.el-table_2_column_35_column_41   {
    color:#67c23a;
  }
  .el-table_1_column_23_column_27,.el-table_1_column_28,.el-table_2_column_46_column_50,.el-table_2_column_51    {
    color:#f56c6c;
  }
  .el-table_1_column_19_column_22,.el-table_2_column_42_column_45  {
    color:#e6a23c;
  }
</style>
