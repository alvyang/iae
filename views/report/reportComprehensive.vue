<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/reportcomprehensive' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售积分收付统计（近24个月）表格</el-breadcrumb-item>
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
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('99,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('99,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
    <div style="background:#ffffff;font-size:12px;color:#f24040;height:20px;line-height:30px;padding-left:20px;">
      温馨提示：高打品种积分收付，已按照每月实际销售量，折算到每月记录中
    </div>
    <div style="padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" style="width: 100%" size="mini" :border="true" :span-method="objectSpanMethod">
        <el-table-column fixed prop="time" label="日期" width="80"></el-table-column>
        <el-table-column prop="saleMoney" label="销售总额" width="80" :formatter="formatNull"></el-table-column>
        <el-table-column label="上游" header-align="center" >
          <el-table-column label="高打品种" header-align="center">
            <el-table-column label="销售" header-align="center">
              <el-table-column prop="saleMoney0" label="额" width="80" :formatter="formatNull"></el-table-column>
              <el-table-column prop="saleMoney0" label="占比" width="60" :formatter="formatSaleMoney"></el-table-column>
            </el-table-column>
            <el-table-column prop="arefundsMoney2" label="应收积分" width="80" :formatter="formatNull"></el-table-column>
            <el-table-column label="实收" header-align="center">
              <el-table-column prop="refundsMoney2" label="积分" width="80" :formatter="formatNull"></el-table-column>
              <el-table-column prop="refundsMoney2" label="占比" width="60" :formatter="formatSalePurchaseMoney"></el-table-column>
            </el-table-column>
            <el-table-column prop="srefundsMoney2" label="未收积分" width="80" :formatter="formatNull"></el-table-column>
          </el-table-column>
          <el-table-column label="佣金品种" header-align="center">
            <el-table-column label="销售" header-align="center">
              <el-table-column prop="saleMoney1" label="额" width="80" :formatter="formatNull"></el-table-column>
              <el-table-column prop="saleMoney1" label="占比" width="60" :formatter="formatSaleMoney"></el-table-column>
            </el-table-column>
            <el-table-column prop="arefundsMoney1" label="应收积分" width="80" :formatter="formatNull"></el-table-column>
            <el-table-column label="实收" header-align="center">
              <el-table-column prop="refundsMoney1" label="积分" width="80" :formatter="formatNull"></el-table-column>
              <el-table-column prop="refundsMoney1" label="占比" width="60" :formatter="formatSaleRefund"></el-table-column>
            </el-table-column>
            <el-table-column prop="srefundsMoney1" label="未收积分" width="80" :formatter="formatNull"></el-table-column>
          </el-table-column>
          <el-table-column  label="未收积分总额" width="100" :formatter="formatMoneyAll"></el-table-column>
        </el-table-column>
        <el-table-column label="下游" header-align="center">
          <el-table-column label="销售" header-align="center">
            <el-table-column prop="sReturnMoney0" label="应付积分" width="80" :formatter="formatNull"></el-table-column>
            <el-table-column label="实付">
              <el-table-column prop="aReturnMoney0" label="积分" width="80" :formatter="formatNull"></el-table-column>
              <el-table-column prop="aReturnMoney0" label="占比" width="60" :formatter="formatSaleReturn"></el-table-column>
            </el-table-column>
            <el-table-column prop="nReturnMoney0" label="未付积分" width="80" :formatter="formatNull"></el-table-column>
          </el-table-column>
          <el-table-column label="调货" header-align="center">
            <el-table-column prop="allotReturnMoney" label="应付积分" width="80" :formatter="formatNull"></el-table-column>
            <el-table-column label="实付">
              <el-table-column prop="allotReturnMoney0" label="积分" width="80" :formatter="formatNull"></el-table-column>
              <el-table-column prop="allotReturnMoney0" label="占比" width="60" :formatter="formatAllotReturn"></el-table-column>
            </el-table-column>
            <el-table-column prop="allotReturnMoney1" label="未付积分" width="80" :formatter="formatNull"></el-table-column>
          </el-table-column>
          <el-table-column label="未付积分总额" width="100" :formatter="formatMoneyAll"></el-table-column>
        </el-table-column>
        <el-table-column label="利润" width="90" :formatter="formatProfit"></el-table-column>
        <el-table-column label="真实利润" width="90" :formatter="formatRealProfit"></el-table-column>
        <el-table-column prop="stockMoneyReturn" label="库存负债" width="80" :formatter="formatNull"></el-table-column>
      </el-table-column>
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
      formatNull(row, column, cellValue, index){
        return cellValue?(cellValue+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','):0;
      },
      formatProfit(row, column, cellValue, index){
        var m = row.arefundsMoney2 + row.arefundsMoney1 - row.sReturnMoney0 - row.allotReturnMoney;
        m = Math.round(m*100)/100;
        return (m+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      formatRealProfit(row, column, cellValue, index){
        var m = row.refundsMoney2 + row.refundsMoney1 - row.aReturnMoney0 - row.allotReturnMoney0;
        m = Math.round(m*100)/100;
        return (m+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      formatMoneyAll(row, column, cellValue, index){
        var t1=0,t2=0;
        for(var i = 0 ; i < this.listData.length ;i++){
          t1 += this.listData[i].srefundsMoney2 + this.listData[i].srefundsMoney1;
          t2 += this.listData[i].nReturnMoney0 + this.listData[i].allotReturnMoney1;
        }
        if(column.label == "未收积分总额"){
          return t1;
        }else{
          return t2;
        }
      },
      formatAllotReturn(row, column, cellValue, index){
        var percent = 0
        if(cellValue && row.allotReturnMoney){
           percent = cellValue/row.allotReturnMoney;
        }
        return Math.round(percent*100)+"%";
      },
      formatSalePurchaseMoney(row, column, cellValue, index){
        var percent = 0
        if(cellValue && row.arefundsMoney2){
           percent = cellValue/row.arefundsMoney2;
        }
        return Math.round(percent*100)+"%";
      },
      formatSaleReturn(row, column, cellValue, index){
        var percent = 0
        if(cellValue && row.sReturnMoney0){
           percent = cellValue/row.sReturnMoney0;
        }
        return Math.round(percent*100)+"%";
      },
      formatSaleRefund(row, column, cellValue, index){
        var percent = 0
        if(cellValue && row.arefundsMoney1){
           percent = cellValue/row.arefundsMoney1;
        }
        return Math.round(percent*100)+"%";
      },
      formatSaleMoney(row, column, cellValue, index){
        var percent = 0
        if(cellValue && row.saleMoney){
           percent = cellValue/row.saleMoney;
        }
        return Math.round(percent*100)+"%";
      },
      formatRefundProfit(row, column, cellValue, index){
        var t = row.apurchaseReturnMoney1+row.crefundsMoney1-row.cReturnMoney0-row.cReturnMoney1-row.callotReturnMoney0;
        return Math.round(t*100)/100;
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 14) {
          if (rowIndex % 24 === 0) {
            return {
              rowspan: 24,
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
          if (rowIndex % 24 === 0) {
            return {
              rowspan: 24,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
        if (columnIndex === 26) {
          if (rowIndex % 24 === 0) {
            return {
              rowspan: 24,
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
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'销售单位'},function(res){
						_self.hospitals = res.message;
				});
			},
      getComprehensive(){
        var _self = this;
        this.jquery('/iae/report/getReportComprehensive',_self.params,function(res){
						_self.listData= res.message;
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
<style scope="scope">
  .el-table thead.is-group th{
    background:#fafcfe !important;
  }
</style>
