<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
      <el-breadcrumb-item v-show="params.flag == '1'" :to="{ path: '/main/reportcomprehensive' }">销售积分收付统计（近24个月）表格</el-breadcrumb-item>
      <el-breadcrumb-item v-show="params.flag == '2' || params.flag == '4' " :to="{ path: '/main/reportcomprehensive1' }">销售积分收付统计（按销往单位）表格</el-breadcrumb-item>
      <el-breadcrumb-item v-show="params.flag == '3' || params.flag == '5' " :to="{ path: '/main/reportcomprehensive2' }">销售积分收付统计（按商业）表格</el-breadcrumb-item>
      <el-breadcrumb-item>详情</el-breadcrumb-item>
    </el-breadcrumb>
    <el-tabs type="border-card" :value="value">
      <el-tab-pane label="佣金品种应收" :disabled="!(params.flag == '1' || params.flag == '2' || params.flag == '3') " >
        <div class="sum_money_allot">
    			<a>销售额：</a>{{listData.listData1Sum.sum1}} <span>元</span> <a>应收积分：</a>{{listData.listData1Sum.sum2}} <a>实收积分：</a>{{listData.listData1Sum.sum3}} <a>未收积分：</a>{{listData.listData1Sum.sum4}}
    		</div>
        <el-table :data="listData.listData1" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column fixed prop="bill_date" label="调货日期" width="100" :formatter="formatterDate"></el-table-column>
          <el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
          <el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
          <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
          <el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
          <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
          <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
          <el-table-column prop="sale_price" label="中标价" width="60"></el-table-column>
          <el-table-column prop="sale_num" label="计划数量" width="70"></el-table-column>
          <el-table-column prop="sale_money" label="购入金额" width="70"></el-table-column>
          <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
          <el-table-column prop="product_return_money" label="积分" width="80"></el-table-column>
          <el-table-column prop="refunds_should_money" label="应收积分" width="80" :formatter="formatterMoney"></el-table-column>
          <el-table-column prop="refunds_real_money" label="实收积分" width="80" :formatter="formatterMoney"></el-table-column>
          <el-table-column prop="service_charge" label="其它积分" width="60" :formatter="formatterMoney"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="高打品种应收（销售）" :disabled="!(params.flag == '1' || params.flag == '2' || params.flag == '3') " >
        <div class="sum_money_allot">
    			<a>销售额：</a>{{listData.listData2Sum.sum1}} <span>元</span> <a>应收积分：</a>{{listData.listData2Sum.sum2}} <a>实收积分：</a>{{listData.listData2Sum.sum3}} <a>未收积分：</a>{{listData.listData2Sum.sum4}}
    		</div>
        <el-table :data="listData.listData2" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column fixed prop="bill_date" label="调货日期" width="100" :formatter="formatterDate"></el-table-column>
          <el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
          <el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
          <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
          <el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
          <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
          <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
          <el-table-column prop="sale_price" label="中标价" width="60"></el-table-column>
          <el-table-column prop="sale_num" label="计划数量" width="70"></el-table-column>
          <el-table-column prop="sale_money" label="购入金额" width="70"></el-table-column>
          <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
          <el-table-column prop="product_return_money" label="积分" width="80"></el-table-column>
          <el-table-column prop="refunds_should_money" label="应收积分" width="80" :formatter="formatterMoney"></el-table-column>
          <el-table-column prop="refunds_real_money" label="实收积分" width="80" :formatter="formatterMoney"></el-table-column>
          <el-table-column prop="service_charge" label="其它积分" width="60" :formatter="formatterMoney"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="高打品种应收（调货）" :disabled="!(params.flag == '1' || params.flag == '4' || params.flag == '5')" >
        <div class="sum_money_allot">
    			<a>销售额：</a>{{listData.listData3Sum.sum1}} <span>元</span> <a>应收积分：</a>{{listData.listData3Sum.sum2}} <a>实收积分：</a>{{listData.listData3Sum.sum3}} <a>未收积分：</a>{{listData.listData3Sum.sum4}}
    		</div>
        <el-table :data="listData.listData3" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column fixed prop="allot_time" label="调货日期" width="100" :formatter="formatterDate"></el-table-column>
          <el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
          <el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
          <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
          <el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
          <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
          <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
          <el-table-column prop="allot_price" label="中标价" width="60"></el-table-column>
          <el-table-column prop="allot_number" label="计划数量" width="70"></el-table-column>
          <el-table-column prop="allot_money" label="购入金额" width="70"></el-table-column>
          <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
          <el-table-column prop="product_return_money" label="积分" width="80"></el-table-column>
          <el-table-column prop="refundsShouldMoney" label="应收积分" width="80" :formatter="formatterMoney"></el-table-column>
          <el-table-column prop="refundsRealMoney" label="实收积分" width="80" :formatter="formatterMoney"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="销售应付" :disabled="!(params.flag == '1' || params.flag == '2' || params.flag == '3') " >
        <div class="sum_money_allot">
    			<a>应付积分：</a>{{listData.listData4Sum.sum2}} <a>实付积分：</a>{{listData.listData4Sum.sum3}} <a>未付积分：</a>{{listData.listData4Sum.sum4}}
    		</div>
        <el-table :data="listData.listData4" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column fixed prop="bill_date" label="调货日期" width="100" :formatter="formatterDate"></el-table-column>
          <el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
          <el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
          <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
          <el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
          <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
          <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
          <el-table-column prop="sale_price" label="中标价" width="60"></el-table-column>
          <el-table-column prop="sale_num" label="计划数量" width="70"></el-table-column>
          <el-table-column prop="sale_money" label="购入金额" width="70"></el-table-column>
          <el-table-column prop="business_name" label="商业" width="60"></el-table-column>

          <el-table-column prop="sale_policy_money" label="政策积分" width="80"></el-table-column>
          <el-table-column prop="sale_return_money" label="应付积分" width="80" :formatter="formatterMoney"></el-table-column>
          <el-table-column prop="sale_return_real_return_money" label="实付积分" width="80" :formatter="formatterMoney"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="调货应付" :disabled="!(params.flag == '1' || params.flag == '4' || params.flag == '5') " >
        <div class="sum_money_allot">
    			<a>应付积分：</a>{{listData.listData3Sum.sum5}} <a>实付积分：</a>{{listData.listData3Sum.sum6}} <a>未付积分：</a>{{listData.listData3Sum.sum7}}
    		</div>
        <el-table :data="listData.listData3" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column fixed prop="allot_time" label="调货日期" width="100" :formatter="formatterDate"></el-table-column>
          <el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
          <el-table-column prop="product_common_name" label="产品名称" width="120" ></el-table-column>
          <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
          <el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
          <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
          <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
          <el-table-column prop="allot_price" label="中标价" width="60"></el-table-column>
          <el-table-column prop="allot_number" label="计划数量" width="70"></el-table-column>
          <el-table-column prop="allot_money" label="购入金额" width="70"></el-table-column>
          <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
          <el-table-column prop="allot_return_price" label="政策积分" width="80"></el-table-column>
          <el-table-column prop="allot_return_money" label="应付积分" width="80" :formatter="formatterMoney"></el-table-column>
          <el-table-column prop="allot_real_return_money" label="实付积分" width="80" :formatter="formatterMoney"></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
  export default({
    data(){
        return{
          value:0,
          params:{
            time:null,
            business:"",
            hospitalsId:"",
            flag:""
          },
          listData:{},
        }
    },
    activated(){
      this.params = this.$route.query;
      this.value = this.params.flag == "4" || this.params.flag == "5"?"2":"0";
      this.getReportComprehensiveDetail();
      var height = $(window).height() - 175;
      $(".el-tabs__content").height(height);
			var that = this;
			$(window).resize(function(){
        var height = $(window).height() - 175;
				$(".el-tabs__content").height(height);
			});
    },
    methods:{
      formatterMoney(row, column, cellValue){
        return Math.round(cellValue*100)/100;
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
      getReportComprehensiveDetail(){
        var _self = this;
        this.jquery('/iae/reportComprehensive/getReportComprehensiveDetail',_self.params,function(res){
						_self.listData= res.message;
        });
      }
    }
  })
</script>
<style scope="scope">
  .el-tabs__content{
    overflow-y: scroll;
  }
</style>
