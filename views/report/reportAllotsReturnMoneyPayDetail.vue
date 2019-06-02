<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/main/reportAllotsReturnMoneyPay' }">调货应收积分（按调货联系人）</el-breadcrumb-item>
      <el-breadcrumb-item>调货应收积分（按调货联系人）明细</el-breadcrumb-item>
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
         <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="$router.push('/main/reportAllotsReturnMoneyPay');" size="mini">返回</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div class="sum_money">
      未付积分：<a>{{refundMoney.own}}</a>
    </div>
    <el-table :data="refunds" style="width: 100%" size="mini" :stripe="true" :border="true">
      <el-table-column fixed prop="allot_time" label="调货时间" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column prop="hospital_name" label="调货单位" width="120"></el-table-column>
      <el-table-column prop="product_code" label="产品编码" width="100"></el-table-column>
      <el-table-column prop="product_common_name" label="产品通用名" width="120"></el-table-column>
      <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
      <el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
      <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
      <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
      <el-table-column prop="contacts_name" label="调货联系人" width="80"></el-table-column>
      <el-table-column prop="allot_number" label="数量" width="50"></el-table-column>
      <el-table-column prop="allot_mack_price" label="打款价" width="60"></el-table-column>
      <el-table-column prop="allot_price" label="中标价" width="60"></el-table-column>
      <el-table-column prop="allot_money" label="金额" width="70"></el-table-column>
      <el-table-column prop="batch_number" label="批号" ></el-table-column>
      <el-table-column label="实收上游积分(单价)" width="70" :formatter="formatterReturnMoney"></el-table-column>
      <el-table-column prop="allot_return_price" label="政策积分" width="70"></el-table-column>
      <el-table-column label="补点/费用票" width="80" :formatter="formatterOtherMoney"></el-table-column>
      <el-table-column prop="allot_return_money" label="应付积分" width="70" :formatter="formatterShouldPay"></el-table-column>
      <el-table-column prop="allot_remark" label="备注" width="80"></el-table-column>
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
        allot_return_flag:"未付",
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
    formatterOtherMoney(row, column, cellValue){
      if(row.purchase_other_money){
        var t = (row.purchase_other_money/row.purchase_number)*row.allot_number;
        row.other_monety_temp = Math.round(t*100)/100;
        return Math.round(t*100)/100;
      }else{
        return 0;
      }
    },
    formatterShouldPay(row, column, cellValue){
      if(row.purchase_other_money){
        var t = (row.purchase_other_money/row.purchase_number)*row.allot_number;
        row.other_monety_temp = Math.round(t*100)/100;
        var temp = row.allot_number*row.allot_return_price - t;
        temp = Math.round(temp*100)/100;
        if(row.allot_return_money != temp){
          row.allot_return_money = temp;
          return temp;
        }else{
          return cellValue;
        }
      }else{
        return cellValue;
      }
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
      this.jquery('/iae/allotPolicy/getAllotReturnMoney',{
        data:_self.params,
        page:page
      },function(res){
          _self.refunds = res.message.data;
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;

          var own = res.message.returnMoney - res.message.returnMoney1;
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
