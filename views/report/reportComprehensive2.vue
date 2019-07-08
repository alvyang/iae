<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售积分收付统计（按商业）表格</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="月份" prop="time">
 			 <el-date-picker v-model="params.time" type="month" :clearable="false" size="mini" style="width:210px;" placeholder="月份"></el-date-picker>
 		  </el-form-item>
      <el-form-item label="销往单位类型" prop="hospital_type">
				<el-select v-model="params.hospital_type" @change="hospitalType" style="width:210px;" size="mini" placeholder="请选择">
					<el-option key="销售单位" label="销售单位" value="销售单位"></el-option>
					<el-option key="调货单位" label="调货单位" value="调货单位"></el-option>
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
      <el-form-item label="商业" prop="business">
        <el-select v-model="params.business" style="width:210px;" size="mini" filterable>
          <el-option key="" label="全部" value=""></el-option>
          <el-option v-for="item in business"
            :key="item.business_id"
            :label="item.business_name"
            :value="item.business_id"></el-option>
        </el-select>
      </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',99,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',99,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf(',99,') > -1" @click="exportComprehensive(true)" size="mini">导出</el-button>
		  </el-form-item>
		</el-form>
    <div style="background:#ffffff;font-size:12px;color:#f24040;height:20px;line-height:30px;padding-left:20px;">
      温馨提示：高打品种积分收付，已按照每月实际销售（调货）量，折算到每月记录中
    </div>
    <div v-show="params.hospital_type == '销售单位'" style="padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" :height="tableHeight" style="width: 100%" size="mini" :border="true" :span-method="objectSpanMethod">
        <el-table-column fixed prop="businessName" label="商业" width="150"></el-table-column>
        <el-table-column prop="saleMoney" label="销售总额" width="80" :formatter="formatNull"></el-table-column>
        <el-table-column label="上游" header-align="center" >
          <el-table-column label="高打品种（销售）" header-align="center">
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
          <el-table-column label="未付积分总额" width="100" :formatter="formatMoneyAll"></el-table-column>
        </el-table-column>
        <!-- <el-table-column label="利润" width="90" :formatter="formatProfit"></el-table-column>
        <el-table-column label="真实利润" width="90" :formatter="formatRealProfit"></el-table-column> -->
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="90">
        <template slot-scope="scope">
          <el-button type="text" @click="viewDetail(scope.row)" style="padding:0;font-size:12px;">查看详情</el-button>
        </template>
      </el-table-column>
      </el-table>
    </div>
    <div v-show="params.hospital_type == '调货单位'"  style="padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData1" size="mini" :border="true" :span-method="objectSpanMethodAllot">
        <el-table-column fixed prop="businessName" label="商业" width="150"></el-table-column>
        <el-table-column prop="allotMoney" label="调货总额" width="80" :formatter="formatNull"></el-table-column>
        <el-table-column label="调货" header-align="center" >
            <el-table-column prop="allotShouldReturn" label="应收积分" width="80" :formatter="formatNull"></el-table-column>
            <el-table-column label="实收" header-align="center">
              <el-table-column prop="allotRealReturn" label="积分" width="80" :formatter="formatNull"></el-table-column>
              <el-table-column prop="allotRealReturn" label="占比" width="60" :formatter="formatSaleAllotMoney"></el-table-column>
            </el-table-column>
            <el-table-column prop="allotNoReturn" label="未收积分" width="80" :formatter="formatNull"></el-table-column>
            <el-table-column  label="未收积分总额" width="100" :formatter="formatMoneyAllAllot"></el-table-column>
            <el-table-column prop="allotReturnMoney" label="应付积分" width="80" :formatter="formatNull"></el-table-column>
            <el-table-column label="实付">
              <el-table-column prop="allotReturnMoney0" label="积分" width="80" :formatter="formatNull"></el-table-column>
              <el-table-column prop="allotReturnMoney0" label="占比" width="60" :formatter="formatAllotReturn"></el-table-column>
            </el-table-column>
            <el-table-column prop="allotReturnMoney1" label="未付积分" width="80" :formatter="formatNull"></el-table-column>
            <el-table-column label="未付积分总额" width="100" :formatter="formatMoneyAllAllot"></el-table-column>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template slot-scope="scope">
            <el-button type="text" @click="viewDetail(scope.row)" style="padding:0;font-size:12px;">查看详情</el-button>
          </template>
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
            business:'',
            hospitalsId:"",
            hospital_type:'销售单位',
            time:nowDate,
            flag:"3"
          },
          listData:[],
          listData1:[],
          hospitals:[],
          business:[],
          authCode:"",
          pageNum:10,
  				currentPage:1,
  				count:0,
          tableHeight:0,
        }
    },
    activated(){
      this.getComprehensive();
      this.getProductBusiness();
      this.getHospitals();
      this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
    },
    beforeMount(){
      this.tableHeight = $(window).height() - 230;
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 230;
			});
    },
    methods:{
      exportComprehensive(){
        var url = this.$bus.data.host ;
        if(this.params.hospital_type == '销售单位'){
          this.params.flag = "2";
          url += "/iae/reportComprehensiveBusiness/exportReportComprehensive";
        }else{
          this.params.flag = "4";
          url += "/iae/reportComprehensiveBusiness/exportReportComprehensiveAllot";
        }
        this.download(url,this.params);
      },
      viewDetail(row){
        this.$router.push({path:`/main/reportcomprehensivedetail`,query:{
          time:new Date(this.params.time).format("yyyy-MM"),business:row.businessId,hospitalsId:this.params.hospitalId,
          flag:this.params.flag
        }});
      },
      hospitalType(arg){
        this.params.hospitalsId = "";
        this.params.business = "";
        this.getHospitals();
        if(arg == '销售单位'){
          this.getComprehensive();
          this.params.flag = "3";
        }else{
          this.getComprehensiveAllot();
          this.params.flag = "5";
        }
      },
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        if(this.params.hospital_type == '销售单位'){
          this.getComprehensive();
        }else{
          this.getComprehensiveAllot();
        }
      },
      getHospitals(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:_self.params.hospital_type},function(res){
						_self.hospitals = res.message;
				});
			},
      formatNull(row, column, cellValue, index){
        return cellValue?(cellValue+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','):0;
      },
      formatProfit(row, column, cellValue, index){
        var m = row.arefundsMoney2 + row.arefundsMoney1 + row.allotShouldReturn - row.sReturnMoney0 - row.allotReturnMoney;
        m = Math.round(m*100)/100;
        return (m+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      formatRealProfit(row, column, cellValue, index){
        var m = row.refundsMoney2 + row.refundsMoney1 + row.allotRealReturn - row.aReturnMoney0 - row.allotReturnMoney0;
        m = Math.round(m*100)/100;
        return (m+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      formatMoneyAll(row, column, cellValue, index){
        var t1=0,t2=0;
        for(var i = 0 ; i < this.listData.length ;i++){
          t1 += this.listData[i].srefundsMoney2 + this.listData[i].srefundsMoney1;
          t2 += this.listData[i].nReturnMoney0;
        }
        t1 = Math.round(t1*100)/100;
        t2 = Math.round(t2*100)/100;
        if(column.label == "未收积分总额"){
          return t1;
        }else{
          return t2;
        }
      },
      formatMoneyAllAllot(row, column, cellValue, index){
        var t1=0,t2=0;
        for(var i = 0 ; i < this.listData1.length ;i++){
          t1 += this.listData1[i].allotNoReturn;
          t2 += this.listData1[i].allotReturnMoney1;
        }
        t1 = Math.round(t1*100)/100;
        t2 = Math.round(t2*100)/100;
        if(column.label == "未收积分总额"){
          return t1;
        }else{
          return t2;
        }
      },
      formatAllotReturn(row, column, cellValue, index){
        var percent = 0
        if(!this.isEmpty(cellValue) && !this.isEmpty(row.allotReturnMoney)){
           percent = cellValue/row.allotReturnMoney;
        }
        return Math.round(percent*100)+"%";
      },
      formatSalePurchaseMoney(row, column, cellValue, index){
        var percent = 0
        if(!this.isEmpty(cellValue) && !this.isEmpty(row.arefundsMoney2)){
           percent = cellValue/row.arefundsMoney2;
        }
        return Math.round(percent*100)+"%";
      },
      formatSaleReturn(row, column, cellValue, index){
        var percent = 0
        if(!this.isEmpty(cellValue) && !this.isEmpty(row.sReturnMoney0)){
           percent = cellValue/row.sReturnMoney0;
        }
        return Math.round(percent*100)+"%";
      },
      formatSaleAllotMoney(row, column, cellValue, index){
        var percent = 0
        if(!this.isEmpty(cellValue) && !this.isEmpty(row.allotShouldReturn)){
           percent = cellValue/row.allotShouldReturn;
        }
        return Math.round(percent*100)+"%";
      },
      formatSaleRefund(row, column, cellValue, index){
        var percent = 0
        if(!this.isEmpty(cellValue) && !this.isEmpty(row.arefundsMoney1)){
           percent = cellValue/row.arefundsMoney1;
        }
        return Math.round(percent*100)+"%";
      },
      formatSaleMoney(row, column, cellValue, index){
        var percent = 0
        if(!this.isEmpty(cellValue) && !this.isEmpty(row.saleMoney)){
           percent = cellValue/row.saleMoney;
        }
        return Math.round(percent*100)+"%";
      },
      objectSpanMethodAllot({ row, column, rowIndex, columnIndex }) {
        var l = this.listData1.length;
        if (columnIndex === 6) {
          if (rowIndex % l === 0) {
            return {
              rowspan: l,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
        if (columnIndex === 11) {
          if (rowIndex % l === 0) {
            return {
              rowspan: l,
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
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        var l = this.listData.length;
        if (columnIndex === 14) {
          if (rowIndex % l === 0) {
            return {
              rowspan: l,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
        if (columnIndex === 19) {
          if (rowIndex % l === 0) {
            return {
              rowspan: l,
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
      getComprehensive(){
        var _self = this;
        this.jquery('/iae/reportComprehensiveBusiness/getReportComprehensive',_self.params,function(res){
						_self.listData= res.message;
        });
      },
      getComprehensiveAllot(){
        var _self = this;
        this.jquery('/iae/reportComprehensiveBusiness/getReportComprehensiveAllot',_self.params,function(res){
						_self.listData1= res.message;
        });
      },
    }
  })
</script>
<style scope="scope">
  .el-table thead.is-group th{
    background:#fafcfe !important;
  }
</style>
