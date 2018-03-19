<template>
	<div>
		<div class="echarts_div">
			<el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
				<el-form-item label="销售日期" prop="time">
	 			 <el-date-picker v-model="params.time" type="daterange" size="small" align="right" unlink-panels
	 				 range-separator="至"
	 				 start-placeholder="开始日期"
	 				 end-placeholder="结束日期"
	 				 :picker-options="pickerOptions2">
	 			 </el-date-picker>
	 		 	</el-form-item>
				<el-form-item>
	 	     <el-button type="primary" @click="search" size="small">查询</el-button>
	 	   </el-form-item>
			</el-form>
			<div id="echart1"></div>
			<div id="echart2"></div>
			<div id="echart6" style="display:block;width:100%"></div>
			<div id="echart3"></div>
			<div id="echart4"></div>
			<div id="echart5" style="display:block;width:100%"></div>
		</div>
		<div class="advertisement">
			<iframe src="http://139.129.238.114/web/ad.html" frameborder="0" width="100%"></iframe>
		</div>
	</div>
</template>
<script>
	import echarts from "echarts";
	export default({
		data(){
			const defaultEnd = new Date();
			const defaultStart = new Date(defaultEnd.getFullYear()+"-01"+"-01");
			return {
				pickerOptions2: {
					shortcuts: [{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				params:{//查询参数
					time:[defaultStart,defaultEnd]
				},
				ipc:null,
			}
		},
		mounted(){
			if (window.require) {
				//获取药品信息
		    this.ipc = window.require('electron').ipcRenderer;
				this.ipc.on('get_report_return1', (event, arg) => {
					this.getReport1(arg);
				});
				this.ipc.on('get_report_return2', (event, arg) => {
					this.getReport2(arg);
				});
				this.ipc.on('get_report_return3', (event, arg) => {
					this.getReport3(arg);
				});
				this.ipc.on('get_report_return4', (event, arg) => {
					this.getReport4(arg);
				});
				this.ipc.on('get_report_return5', (event, arg) => {
					for(var i = 0 ; i < arg.time.length ;i++){
						arg.time[i] = arg.time[i].substring(0,10);
					}
					this.getReport5(arg);
				});
				this.ipc.on('get_report_return6', (event, arg) => {
					for(var i = 0 ; i < arg.time.length ;i++){
						arg.time[i] = arg.time[i].substring(0,10);
					}
					this.getReport6(arg);
				});
				this.search();
				//高打品种销售返利排行数据
				this.ipc.send('get_report_5',this.params);
				//高打品种销售量排行数据
				this.ipc.send('get_report_6',this.params);
			}
		},
		methods:{
			search(){
				//高打品种销售返利排行数据
				this.ipc.send('get_report_1',this.params);
				//高打品种销售量排行数据
				this.ipc.send('get_report_2',this.params);
				//普通品种销售额排行数据
				this.ipc.send('get_report_3',this.params);
				//普通品种销售量排行数据
				this.ipc.send('get_report_4',this.params);
			},
			getReport5(arg){
				// 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('echart5'));
	      // 指定图表的配置项和数据
				var option = {
					color: ["#8ad163","#b373f4"],
			    title: {
		        text: '普通品种销售曲线'
			    },
			    legend: {
						top:'30px',
		        data:['销售量','销售额']
			    },
					tooltip: {
		        trigger: 'axis'
			    },
			    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data:arg.time.reverse()
			    },
			    yAxis: {
		        type: 'value'
			    },
			    series: [{
            name:'销售量',
            type:'line',
            data:arg.sm.reverse()
	        },{
            name:'销售额',
            type:'line',
            data:arg.sm2.reverse()
	        }]
				};
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
			},
			getReport6(arg){
				// 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('echart6'));
	      // 指定图表的配置项和数据
	      var option = {
					color: ["#8ad163","#36c9ff","#63e0d9","#b373f4"],
			    title: {
			        text: '高打品种销售曲线'
			    },
					tooltip: {
		        trigger: 'axis'
			    },
			    legend: {
						top:'30px',
		        data:['销售量','销售额','应返金额','实返金额']
			    },
			    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data:arg.time.reverse()
			    },
			    yAxis: {
			        type: 'value'
			    },
			    series: [{
	            name:'销售量',
	            type:'line',
	            data:arg.pn.reverse()
	        },{
	            name:'销售额',
	            type:'line',
	            data:arg.pm.reverse()
	        },{
	            name:'应返金额',
	            type:'line',
	            data:arg.srm.reverse()
	        },{
	            name:'实返金额',
	            type:'line',
	            data:arg.rrm.reverse()
	        }]
				};
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
			},
			getReport4(arg){
				// 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('echart4'));
	      // 指定图表的配置项和数据
	      var option = {
						color: ["#8ad163"],
	          title: {
              text:'普通品种药品销售量排行'
	          },
	          tooltip: {},
						grid:{
							left:"20%"
						},
	          yAxis: {
							type: 'category',
							axisLabel:{
		            interval: 0
			        },
              data: arg.pcn.reverse()
	          },
						xAxis: {
			        type: 'value'
				    },
	          series: [{
	              name: '销售量',
	              type: 'bar',
	              data: arg.sm.reverse()
	          }]
	      };
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
			},
			getReport3(arg){
				// 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('echart3'));
	      // 指定图表的配置项和数据
	      var option = {
						color: ["#36c9ff"],
	          title: {
              text:'普通品种药品销售额排行'
	          },
	          tooltip: {},
						grid:{
							left:"20%"
						},
	          yAxis: {
							type: 'category',
							axisLabel:{
		            interval: 0
			        },
              data: arg.pcn.reverse()
	          },
						xAxis: {
			        type: 'value'
				    },
	          series: [{
	              name: '销售额',
	              type: 'bar',
	              data: arg.sm.reverse()
	          }]
	      };
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
			},
			getReport2(arg){
				// 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('echart2'));
	      // 指定图表的配置项和数据
	      var option = {
						color: ["#85a0f6"],
	          title: {
              text:'高打品种药品销售量排行'
	          },
	          tooltip: {},
						grid:{
							left:"20%"
						},
	          yAxis: {
							type: 'category',
							axisLabel:{
		            interval: 0
			        },
              data: arg.pcn.reverse()
	          },
						xAxis: {
			        type: 'value'
				    },
	          series: [{
	              name: '销售量',
	              type: 'bar',
	              data: arg.pn.reverse()
	          }]
	      };
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
			},
			getReport1(arg){
				// 基于准备好的dom，初始化echarts实例
	      var myChart = echarts.init(document.getElementById('echart1'));
	      // 指定图表的配置项和数据
	      var option = {
						color: ["#63e0d9","#b373f4"],
	          title: {
              text:'高打品种药品销售返利排行'
	          },
	          tooltip: {},
						grid:{
							left:"20%"
						},
	          legend: {
							top:'30px',
              data:['应返金额','实返金额']
	          },
	          yAxis: {
							type: 'category',
							axisLabel:{
		            interval: 0
			        },
              data: arg.pcn.reverse()
	          },
						xAxis: {
			        type: 'value'
				    },
	          series: [{
	              name: '应返金额',
	              type: 'bar',
	              data: arg.srm.reverse()
	          },{
	              name: '实返金额',
	              type: 'bar',
	              data: arg.rrm.reverse()
	          }]
	      };
	      // 使用刚指定的配置项和数据显示图表。
	      myChart.setOption(option);
			}
		}
	});
</script>
<style>
	.echarts_div{
		font-size: 0px;
		box-sizing: border-box;
		padding: 0px 10px 50px 10px;
	}
	.echarts_div > div{
		display: inline-block;
		width: 50%;
		height: 400px;
	}
	.advertisement{
		position: fixed;
		bottom: 0px;
		width: 100%;
		height: 60px;
	}
</style>
