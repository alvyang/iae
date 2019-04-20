<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>采进外欠积分（按联系人）</el-breadcrumb-item>
      <el-breadcrumb-item>采进外欠积分（按联系人）明细</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <div>
        <el-form-item label="产品名称" prop="productCommonName">
          <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
        </el-form-item>
        <el-form-item label="产品编码" prop="product_code">
          <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编码"></el-input>
        </el-form-item>
        <el-form-item label="　　批号" prop="batch_number">
   			 <el-input v-model="params.batch_number" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="批号"></el-input>
   		  </el-form-item>
        <!-- <el-form-item label="积分状态" prop="status">
          <el-select v-model="params.status" filterable size="mini" style="width:210px;" placeholder="请选择">
            <el-option key="" label="全部" value=""></el-option>
            <el-option key="已返" label="已返" value="已返"></el-option>
            <el-option key="未返" label="未返" value="未返"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="是否打款" prop="makeMoneyFlag">
          <el-select v-model="params.makeMoneyFlag" filterable size="mini" style="width:210px;" placeholder="请选择">
            <el-option key="2" label="是" value="2"></el-option>
            <el-option key="" label="全部" value=""></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
         <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
         <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="$router.push('/main/reportpurchasereturnmoney');" size="mini">返回</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div class="sum_money">
      未收积分：<a>{{refundMoney.own}}</a>
    </div>
    <el-table :data="purchases" style="width: 100%" size="mini" :stripe="true" :border="true">
      <el-table-column fixed prop="product_code" label="产品编码" width="100"></el-table-column>
      <el-table-column fixed prop="product_common_name" label="产品名称" width="120" ></el-table-column>
      <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
      <el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
      <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
      <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
      <el-table-column prop="purchase_price" label="中标价" width="60"></el-table-column>
      <el-table-column prop="purchase_number" label="购入数量" width="70"></el-table-column>
      <el-table-column prop="purchase_money" label="购入金额" width="70"></el-table-column>
      <el-table-column prop="batch_number" label="批号" width="70"></el-table-column>
      <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
      <el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
      <el-table-column  prop="time" label="备货日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="make_money_time" label="打款日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="send_out_time" label="发货日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="product_return_money" label="积分" width="80"></el-table-column>
      <el-table-column  prop="refunds_should_time" label="应收日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="refunds_should_money" label="应收积分" width="80"></el-table-column>
      <el-table-column prop="refunds_remark" label="备注" width="150"></el-table-column>
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
      purchases:[],
      refundMoney:{
        rsm:0,
        rrm:0,
        sc:0,
        own:0
      },//返费总额
      pageNum:10,
      currentPage:1,
      count:0,
      params:{//查询参数
        productCommonName:"",
        contactId:"",
        status:"未返",
        product_code:"",
        batch_number:"",
        makeMoneyFlag:"2"
      },
    }
  },
  activated(){
    this.params.contactId = this.$route.query.contactId;
    this.getPurchasesList();
  },
  mounted(){

  },
  methods:{
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
      this.getPurchasesList();
    },
    getPurchasesList(){
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
      this.jquery('/iae/refunds/getPurchaseRefunds',{
        data:_self.params,
        page:page
      },function(res){
          _self.purchases = res.message.data;
          var own = res.message.rsm-res.message.rrm-res.message.sc;
          _self.refundMoney = {
            rrm:(res.message.rrm+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            rsm:(res.message.rsm+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            sc:(res.message.sc+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            own:(own.toFixed(2)+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          };
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
      });
    },
    handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getPurchasesList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getPurchasesList();
    }
  }
});
</script>
<style>
</style>
