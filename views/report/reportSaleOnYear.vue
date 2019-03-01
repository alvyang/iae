<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>产品销售额分析（同比）表格</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
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
      <el-form-item label="产品名称" prop="productCommonName">
		    <el-input v-model="params.productCommonName" style="width:210px;" size="mini" @keyup.13.native="reSearch(false)" placeholder="产品名称/助记码"></el-input>
		  </el-form-item>
      <el-form-item label="生产产家" prop="product_makesmakers">
		    <el-input v-model="params.product_makesmakers" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="生产企业"></el-input>
		  </el-form-item>
      <el-form-item label="是否配送" prop="product_distribution_flag">
				<el-select v-model="params.product_distribution_flag" style="width:210px;" size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="0" label="配送" value="0"></el-option>
					<el-option key="1" label="不配送" value="1"></el-option>
				</el-select>
			</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('99,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('99,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
    <div style="margin-top:10px;padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column fixed prop="product_common_name" label="产品名称" width="150"></el-table-column>
          <el-table-column prop="product_specifications" label="产品规格" width="80"></el-table-column>
          <el-table-column prop="product_makesmakers" label="生产产家" width="100"></el-table-column>
          <el-table-column v-for="m in month" :label="m+'月销售额（同比）'">
            <el-table-column v-for="t in time" :prop="t.time"  :label="t.year" v-if="m == t.month " :formatter="formatNumber">
              <!-- <el-table-column :prop="t.time" label="销售额" :formatter="formatNumber" width="80"></el-table-column> -->
              <!-- <el-table-column :prop="t.time+'sn'" label="销售量" :formatter="formatNumber" width="80"></el-table-column> -->
            </el-table-column>
          </el-table-column>
          <!-- <el-table-column fixed="right" prop="sum" label="销售总额" width="100"></el-table-column> -->
          <el-table-column fixed="right" label="操作（柱状图）" width="80">
  			    <template slot-scope="scope">
  				    <el-button v-dbClick @click.native.prevent="showImage(scope,1)" type="primary" size="mini">销售额</el-button>
              <!-- <el-button v-dbClick @click.native.prevent="showImage(scope,2)" type="primary" size="mini">销售量</el-button> -->
  			    </template>
    			</el-table-column>
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
    <el-dialog :title="imageTitle" width="1000px" :visible.sync="dialogFormVisible">
        <div id="sale_month_line" style="width:100%;height:300px;background-color:#ffffff;padding-top:20px;"></div>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        </div>
    </el-dialog>
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
          params:{
            hospitalsId:'',
            business:'',
            productCommonName:"",
            product_makesmakers:"",
            product_distribution_flag:"0"
          },
          listData:[],
          listDataTemp:[],
          time:[],
          month:[],
          hospitals:[],
          business:[],
          authCode:"",
          pageNum:10,
  				currentPage:1,
  				count:0,
          dialogFormVisible:false,
          imageTitle:"",
        }
    },
    activated(){
      this.getProductSalesByOnYear();
      this.getProductBusiness();
      this.getHospitals();
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      showImage(scope,n){
        var scopeTemp = JSON.stringify(scope.row);
        var s = JSON.parse(scopeTemp);
        this.imageTitle = n==1?scope.row.product_common_name+"  销售额（同比）柱状图":scope.row.product_common_name+"  销售量（同比）柱状图";
        this.dialogFormVisible = true;
        var d=[[],[],[]];
        var now = new Date();
        var year = [now.getFullYear()-2,now.getFullYear()-1,now.getFullYear()];
        for(var i = 0 ; i < this.month.length;i++){
          for(var m = 0;m<year.length;m++){
            d[m][i]=d[m][i]?d[m][i]:0;
            for(var j in s){
              var key = n==1?year[m]+"-"+this.month[i]:year[m]+"-"+this.month[i]+"sn";
              if(s[key]){
                d[m][i]=s[key];
              }
            }
          }
        }
        var _self = this;
        setTimeout(function(){
          var m = JSON.stringify(_self.month);
          _self.showSalesMonthLine({month:JSON.parse(m),year:year,d1:d[0],d2:d[1],d3:d[2]});
        },10);
      },
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.currentPage = 1;
        this.getProductSalesByOnYear();
      },
      formatNumber(row, column, cellValue, index){
        return cellValue?Math.round(cellValue*100)/100:"0";
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
      getProductSalesByOnYear(){
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
        this.jquery('/iae/report/getSaleOnYear',{
					data:_self.params,
          page:page
        },function(res){
						_self.listDataTemp= JSON.stringify(res.message.data);
            var temp = JSON.parse(_self.listDataTemp);
            _self.listData = temp.slice(page.start,page.start+page.limit);
            _self.time= res.message.time;
            _self.month = res.message.month;
            _self.pageNum=page.limit;
    				_self.count=  temp.length;
        });
      },
      handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.listData = JSON.parse(this.listDataTemp).slice(0,val);
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
        this.listData = JSON.parse(this.listDataTemp).slice((val-1)*this.pageNum,val*this.pageNum);
    	},
      showSalesMonthLine(arg){
        for(var i = 0 ; i < arg.year.length;i++){
          arg.year[i] = arg.year[i]+"年";
        }
        for(var i = 0 ; i < arg.month.length;i++){
          arg.month[i] = arg.month[i] + "月";
        }
        // 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('sale_month_line'));
	      // 指定图表的配置项和数据
				var option = {
					color: ["#8ad163","#b373f4","#00a0ea"],
          legend:{
              data:arg.year
          },
					tooltip: {
		        trigger: 'axis'
			    },
			    xAxis: {
		        type: 'category',
						name: '月份',
		        data:arg.month
			    },
			    yAxis: {
            type: 'value'
			    },
			    series: [{
            name:arg.year[0],
            type:'bar',
            data:arg.d1
	        },{
            name:arg.year[1],
            type:'bar',
            data:arg.d2
	        },{
            name:arg.year[2],
            type:'bar',
            data:arg.d3
	        }]
				};
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
      }
    }
  })
</script>
<style>

</style>
