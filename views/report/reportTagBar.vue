<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售额/毛利统计（按标签）</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="标签类型" prop="tag_type">
        <el-select v-model="params.tag_type" style="width:210px;" placeholder="请选择">
					<el-option key="" label="请选择" value=""></el-option>
					<el-option key="1" label="医院科室" value="1"></el-option>
					<el-option key="2" label="药品分类" value="2"></el-option>
					<el-option key="0" label="运营方式" value="0"></el-option>
					<el-option key="3" label="其它" value="3"></el-option>
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
      <el-form-item label="销售日期" prop="salesTime">
 			 <el-date-picker v-model="params.salesTime" type="daterange" size="mini" align="right" unlink-panels
 				 range-separator="至"
 				 start-placeholder="开始日期"
 				 end-placeholder="结束日期"
 				 :picker-options="pickerOptions2">
 			 </el-date-picker>
 		 </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('99') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('99') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
    <!-- <div id="sale_month_line" style="width:100%;height:300px;background-color:#ffffff;padding-top:20px;"></div> -->
    <div style="margin-top:10px;padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table :data="listData" style="width: 100%" size="mini" :stripe="true" :border="true">
          <el-table-column fixed prop="tag_name" label="标签" width="100"></el-table-column>
          <el-table-column prop="sm" label="销售额" width="140"></el-table-column>
          <el-table-column prop="rgp" label="真实毛利" width="140"></el-table-column>
          <el-table-column label="真实毛利率(%)" width="120"  :formatter="formatterPercent"></el-table-column>
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
  </div>
</template>
<script>
  import echarts from "echarts";
  export default({
    data(){
      const nowDate = new Date();
      return{
        pickerOptions2: {
					shortcuts: [{
						text: '本月',
						onClick(picker) {
							const end = new Date();
							const start = new Date(end.getFullYear()+"-"+(end.getMonth()+1)+"-01");
							picker.$emit('pick', [start, end]);
						}
					},{
						text: nowDate.getFullYear()+'年',
						onClick(picker) {
							const end = new Date();
							const start = new Date(end.getFullYear()+"-01"+"-01");
							picker.$emit('pick', [start, end]);
						}
					}]
				},
        pageNum:10,
				currentPage:1,
				count:0,
        params:{
          hospitalsId:'',
          business:'',
          salesTime:[],
          tag_type:"",
        },
        listData:[],
        listDataTemp:[],
        hospitals:[],
        business:[],
        authCode:""
      }
    },
    activated(){
      this.getTagSales();
      this.getProductBusiness();
      this.getHospitals();
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      formatterPercent(row, column, cellValue){
        if(row.sm > 0){
          return this.mul(this.div(row.rgp,row.sm,4),100,2);
        }else{
          return "0";
        }
      },
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.currentPage = 1;
        this.getTagSales();
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
      getTagSales(){
        var _self = this;
				this.jquery('/iae/report/getTagAnalysis',_self.params,function(res){
					_self.dialogFormVisible = true;
          // _self.showTagSalesBar(res.message.imageData);
          _self.listDataTemp = res.message.listData;
          _self.frontPage();
          _self.pageNum=_self.pageNum;
          _self.count=_self.listDataTemp.length;

				});
      },
      handleSizeChange(val) {
    		this.currentPage = 1;
        this.pageNum = val;
        this.frontPage();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.frontPage();
    	},
      frontPage(){
        var start = (this.currentPage-1)*this.pageNum;
        var end = this.currentPage*this.pageNum;
        this.listData = this.listDataTemp.slice(start,end);
      },
      showTagSalesBar(arg){
        // 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('sale_month_line'));
	      // 指定图表的配置项和数据
				var option = {
          title: {
               text: '销售额，真实毛利柱状图（按标签）'
          },
					color: ["#8ad163","#b373f4"],
					grid:{
						top:"40px",
					},
					tooltip: {
		        trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
			    },
          legend:{
              data: ['销售额', '真实毛利']
          },
			    xAxis: {
		        type: 'category',
            name: '标签',
		        data:arg.tagName.reverse()
			    },
			    yAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
			    },
			    series: [{
            name:'销售额',
            type:'bar',
            data:arg.tagMoney.reverse()
	        },{
            name:'真实毛利',
            type:'bar',
            data:arg.tagRgp.reverse()
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
