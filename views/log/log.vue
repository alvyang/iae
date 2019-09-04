<template>
	<div style="box-sizing: border-box;padding: 0px 10px;" class="allot_list">
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="日志" prop="log_message">
		    <el-input v-model="params.log_message" style="width:210px;" size="mini" @keyup.13.native="reSearch(false)" placeholder="日志"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
		<div class="sum_money_allot" style="text-align:right;padding-right:5px;font-size:12px;">
			温馨提示：字符串对比站（https://www.sojson.com/jsondiff.html）可查看日志
		</div>
		<el-table :data="logs" style="width: 100%" :height="tableHeight" size="mini" :stripe="true" :border="true">
				<el-table-column prop="log_create_time" label="日志时间" width="140" :formatter="formatterDate"></el-table-column>
				<el-table-column prop="log_remark" label="日志信息" width="300"></el-table-column>
				<el-table-column prop="log_front_message" label="修改前日志" ></el-table-column>
				<el-table-column prop="log_after_message" label="修改后日志/其它" ></el-table-column>
				<!-- <el-table-column fixed="right" label="操作" width="100">
			    <template slot-scope="scope">
						<el-button type="text" @click="viewDetail(scope.row)" style="padding:0;font-size:12px;">查看详情</el-button>
			    </template>
  			</el-table-column> -->
		</el-table>
		<div class="page_div">
			<el-pagination
				background
	      @size-change="handleSizeChange"
	      @current-change="handleCurrentChange"
	      :current-page="currentPage"
	      :page-sizes="[10,20, 50, 100]"
	      :page-size="pageNum"
	      layout="total, sizes, prev, pager, next, jumper"
	      :total="count">
	    </el-pagination>
		</div>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				params:{
					log_message:""
				},
				logs:[],
				pageNum:20,
				tableHeight:0,
				currentPage:1,
				count:0,
			}
		},
		updated(){
			this.tableHeight = $(window).height() - 170 - $(".search").height();
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 170 - $(".search").height();
			});
    },
		activated(){
			this.getLogsList();
		},
		mounted(){

		},
		methods:{
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getLogsList();
			},
			formatterDate(row, column, cellValue){
				if(cellValue && typeof cellValue == "string"){
	        var temp = cellValue.substring(0,19);
	        var d = new Date(temp);
	        return d.format("yyyy-MM-dd hh:mm:ss");
	      }else if(cellValue && typeof cellValue == "object"){
	        return new Date(cellValue).format("yyyy-MM-dd hh:mm:ss");
	      }else{
	        return "";
	      }
			},
			getLogsList(){
				var _self = this;
				if(!_self.currentPage){
					_self.currentPage = 1;
				}
				if(!_self.pageNum){
					_self.pageNum = 20;
				}
				var page = {
					start:(_self.currentPage-1)*_self.pageNum,
					limit:_self.pageNum
				}
				this.jquery('/iae/log/getLogs',{
					data:_self.params,
					page:page
				},function(res){
						_self.logs = res.message.data;
						_self.pageNum=parseInt(res.message.limit);
						_self.count=res.message.totalCount;
				});
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getLogsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getLogsList();
    	}
		}
	});
</script>
<style>

</style>
