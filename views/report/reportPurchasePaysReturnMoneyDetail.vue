<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/main/reportPurchasePaysReturnMoney' }">预付招商应收积分（按联系人）</el-breadcrumb-item>
      <el-breadcrumb-item>预付招商应收积分（按联系人）明细</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <div>
        <el-form-item label="产品名称" prop="productCommonName">
          <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
        </el-form-item>
        <el-form-item label="产品编码" prop="product_code">
          <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编码"></el-input>
        </el-form-item>
        <!-- <el-form-item label="积分状态" prop="status">
          <el-select v-model="params.status" filterable size="mini" style="width:210px;" placeholder="请选择">
            <el-option key="" label="全部" value=""></el-option>
            <el-option key="已返" label="已返" value="已返"></el-option>
            <el-option key="未返" label="未返" value="未返"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item>
         <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
         <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="$router.push('/main/reportPurchasePaysReturnMoney');" size="mini">返回</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div class="sum_money">
      未收积分：<a>{{refundMoney.own}}</a>
    </div>
    <el-table :data="refunds" style="width: 100%" size="mini" :stripe="true" :border="true">
      <el-table-column fixed prop="purchase_pay_contract_time" label="合同时间" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column fixed prop="product_common_name" label="产品通用名" width="120"></el-table-column>
      <el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
      <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
      <el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
      <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
      <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
      <el-table-column prop="product_price" label="中标价" width="60"></el-table-column>
      <el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
      <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
      <el-table-column prop="purchase_pay_number" label="预付数量" width="70"></el-table-column>
      <el-table-column prop="purchase_pay_price" label="打款价" width="60"></el-table-column>
      <el-table-column prop="purchase_pay_money" label="预付金额" width="70"></el-table-column>
      <el-table-column prop="purchase_pay_time" label="打款时间" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column prop="contacts_name1" label="业务员" width="60"></el-table-column>
      <el-table-column prop="purchase_pay_should_price" label="积分" width="80"></el-table-column>
      <el-table-column prop="purchase_pay_other_money" label="补点/费用票" width="80"></el-table-column>
      <el-table-column prop="purchase_pay_should_money" label="应收积分" width="80"></el-table-column>
      <el-table-column prop="purchase_pay_remark" label="备注"></el-table-column>
    </el-table>
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
export default({
  data(){
    return {
      refunds:[],
      refundMoney:{
        rsm:0,
        rrm:0,
        sc:0,
        own:0,
      },//返费总额
      pageNum:10,
      currentPage:1,
      count:0,
      params:{//查询参数
        productCommonName:"",
        status:"未收",
        product_code:"",
        contactId:""
      },
    }
  },
  activated(){
    this.params.contactId = this.$route.query.contactId;
    this.getRefundsList();
  },
  mounted(){

  },
  methods:{
    formatterReturnMoney(row, column, cellValue){
      if(row.hospital_policy_return_money){
        return row.hospital_policy_return_money;
      }else{
        return row.product_return_money;
      }
    },
    formatterDate(row, column, cellValue){
      if(cellValue && typeof cellValue == "string"){
        var temp = cellValue.substring(0,10);
        var d = new Date(temp);
        d.setDate(d.getDate()+1);
        return d.format("yyyy-MM-dd");
      }else if(cellValue && typeof cellValue == "object"){
        return new Date(cellValue).format("yyyy-MM-dd");
      }else{
        return "";
      }
    },
    reSearch(arg){
      this.currentPage = 1;
      this.getRefundsList();
    },
    getRefundsList(){
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
      this.jquery('/iae/purchasepay/getPurchasePay',{
        data:_self.params,
        page:page
      },function(res){
          _self.refunds = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
          var own = res.message.ppsm - res.message.pprm;//未收
          own = Math.round(own*100)/100;
          _self.refundMoney = {
            own:(own+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          };

      });
    },
    handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getRefundsList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getRefundsList();
    }
  }
});
</script>
<style>
</style>
