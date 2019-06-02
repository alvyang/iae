<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/main/reportSalesReturnMoneyPay' }">销售应付积分（按业务员）</el-breadcrumb-item>
      <el-breadcrumb-item>销售应付积分（按业务员）明细</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <div>
        <el-form-item label="产品名称" prop="productCommonName">
          <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
        </el-form-item>
        <el-form-item label="产品编码" prop="product_code">
          <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编码"></el-input>
        </el-form-item>
        <el-form-item>
         <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
         <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="$router.push('/main/reportSalesReturnMoneyPay');" size="mini">返回</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div class="sum_money">
      未付积分：<a>{{refundMoney.own}}</a>
    </div>
    <el-table :data="refunds" style="width: 100%" size="mini" :stripe="true" :border="true">
      <el-table-column fixed prop="bill_date" label="日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
      <el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
      <el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
      <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
      <el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
      <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
      <el-table-column prop="sale_type" label="销售类型" width="60" :formatter="formatterType"></el-table-column>
      <el-table-column prop="product_type" label="品种类型" width="60"></el-table-column>
      <el-table-column prop="sale_price" label="中标价" width="60"></el-table-column>
      <el-table-column prop="sale_num" label="销售数量" width="70"></el-table-column>
      <el-table-column prop="sale_money" label="购入金额" width="70"></el-table-column>
      <el-table-column prop="batch_number" label="批号" width="70"></el-table-column>
      <el-table-column label="实收上游积分(单价)" width="70" :formatter="formatterReturnMoney"></el-table-column>
      <el-table-column prop="sale_return_price" label="政策积分" width="70" ></el-table-column>
      <el-table-column prop="sale_return_money" label="补点/费用票" width="80" :formatter="formatterOtherMoney"></el-table-column>
      <el-table-column prop="sale_return_money" label="应付积分" width="70" :formatter="formatterShouldPay"></el-table-column>
      <el-table-column prop="sale_remark" label="备注" width="70"></el-table-column>
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
        sale_return_flag:"未付",
        product_code:"",
        sale_contact_id:""
      },
    }
  },
  activated(){
    this.params.sale_contact_id = this.$route.query.contactId;
    this.getRefundsList();
  },
  mounted(){

  },
  methods:{
    formatterType(row, column, cellValue){
      return cellValue=='1'?"销售出库":(cellValue=='2'?"销售退回":"销售退补价");
    },
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
      this.jquery('/iae/salesPolicy/getSalesReturnMoney',{
        data:_self.params,
        page:page
      },function(res){
          var own = res.message.saleReturnMoney - res.message.saleReturnMoney1;
          own = Math.round(own*100)/100;
          _self.refundMoney = {
            own:(own+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          };
          _self.refunds = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
      });
    },
    formatterOtherMoney(row, column, cellValue){
      if(row.product_type == '佣金' && row.sale_other_money){
        row.other_money_temp = row.sale_other_money;
        return	row.sale_other_money;
      }else if(row.product_type == '高打' && row.purchase_other_money){
        var temp = (row.purchase_other_money/row.purchase_number)*row.sale_num;
        row.other_money_temp = Math.round(temp*100)/100;
        return Math.round(temp*100)/100;
      }else{
        return 0;
      }
    },
    formatterShouldPay(row, column, cellValue){
      if(row.product_type == '佣金' && row.sale_other_money){
        row.other_money_temp = row.sale_other_money;
      }else if(row.product_type == '高打' && row.purchase_other_money){
        var temp = (row.purchase_other_money/row.purchase_number)*row.sale_num;
        row.other_money_temp = Math.round(temp*100)/100;
      }else{
        row.other_money_temp = 0;
      }
      var t = row.sale_return_price*row.sale_num - row.other_money_temp;
      t = Math.round(t*100)/100;
      if(cellValue != t){
        row.sale_return_money = t;
        return t;
      }else{
        return cellValue;
      }
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
