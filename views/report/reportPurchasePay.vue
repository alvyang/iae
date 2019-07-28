<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item  :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>预付招商积分收付统计（近24个月）表格</el-breadcrumb-item>
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
      <el-form-item label="　业务员" prop="contactId">
        <el-select v-model="params.contactId" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts"
            :key="item.contacts_id"
            :label="item.contacts_name"
            :value="item.contacts_id">
          </el-option>
        </el-select>
      </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',99,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',99,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf(',99,') > -1" @click="exportComprehensive(true)" size="mini">导出</el-button>
		  </el-form-item>
		</el-form>
    <div style="padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" style="width: 100%" :height="tableHeight" size="mini" :border="true" >
        <el-table-column fixed prop="all_day" label="打款日期" width="80" ></el-table-column>
        <el-table-column label="上游" header-align="center" >
          <el-table-column prop="ppsm" label="应收积分" :formatter="formatNull"></el-table-column>
          <el-table-column prop="pprm" label="实收积分" :formatter="formatNull"></el-table-column>
          <el-table-column label="未收积分" :formatter="formatNoReturn"></el-table-column>
        </el-table-column>
        <el-table-column label="下游" header-align="center" >
          <el-table-column prop="ppspm" label="应付积分" :formatter="formatNull"></el-table-column>
          <el-table-column prop="pprpm" label="实付积分" :formatter="formatNull"></el-table-column>
          <el-table-column label="未付积分" :formatter="formatNoPay"></el-table-column>
        </el-table-column>
        <el-table-column label="利润" header-align="center" >
          <el-table-column label="利润" :formatter="formatProfit1"></el-table-column>
          <el-table-column label="真实利润" :formatter="formatProfit2"></el-table-column>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="90">
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
            contactId:'',
            business:''
          },
          listData:[],
          contacts:[],
          business:[],
          authCode:"",
          tableHeight:0,
        }
    },
    activated(){
      this.getComprehensive();
      this.getContacts();
      this.getProductBusiness();
      this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
    },
    beforeMount(){
      this.tableHeight = $(window).height() - 200;
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 200;
			});
    },
    mounted(){

		},
    methods:{
      getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['业务员']},function(res){
	        _self.contacts = res.message;
	      });
	    },
      getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
      formatProfit1(row, column, cellValue, index){
        var t1 = !this.isEmpty(row.ppsm)?row.ppsm:0;
        var t2 = !this.isEmpty(row.ppspm)?row.ppspm:0;
        var t3 = t1 - t2 ;
        t3 = Math.round(t3*100)/100;
        return (t3+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      formatProfit2(row, column, cellValue, index){
        var t1 = !this.isEmpty(row.pprm)?row.pprm:0;
        var t2 = !this.isEmpty(row.pprpm)?row.pprpm:0;
        var t3 = t1 - t2 ;
        t3 = Math.round(t3*100)/100;
        return (t3+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      formatNoPay(row, column, cellValue, index){
        var t1 = !this.isEmpty(row.ppspm)?row.ppspm:0;
        var t2 = !this.isEmpty(row.pprpm)?row.pprpm:0;
        var t3 = t1 - t2 ;
        t3 = Math.round(t3*100)/100;
        return (t3+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      formatNoReturn(row, column, cellValue, index){
        var t1 = !this.isEmpty(row.ppsm)?row.ppsm:0;
        var t2 = !this.isEmpty(row.pprm)?row.pprm:0;
        var t3 = t1 - t2 ;
        t3 = Math.round(t3*100)/100;
        return (t3+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      formatNull(row, column, cellValue, index){
        cellValue = Math.round(cellValue*100)/100;
        return cellValue?(cellValue+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','):0;
      },
      exportComprehensive(){
        var url = this.$bus.data.host + "/iae/report/exportReportPurchasePayComprehensive";
        this.download(url,this.params);
      },
      viewDetail(row){
        this.$router.push({path:`/main/reportpurchasepaydetail`,query:{
          time:row.all_day
        }});
      },
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.getComprehensive();
      },
      getComprehensive(){
        var _self = this;
        this.jquery('/iae/report/getReportPurchasePayComprehensive',_self.params,function(res){
						_self.listData= res.message;
        });
      }
    }
  })
</script>
<style scope="scope">
  .el-table thead.is-group th{
    background:#fafcfe !important;
  }
</style>
