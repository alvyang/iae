<template>
  <div>
    <el-button  @click="toReport('/main/reportsaleline')" >销售额/毛利统计（按月） 折线图</el-button>
    <el-button  @click="toReport('/main/reporttagbar')" >销售额/毛利统计（按标签） 表格</el-button>
    <el-button  @click="toReport('/main/reportsalesbyprofitrate')" >销售额统计（按真实毛利率） 表格</el-button>
    <el-button  @click="toReport('/main/reportsalesbyproduct')" >销售量/额统计（按品种） 表格</el-button>
    <el-button  @click="toReport('/main/reportsalechainratiosn')" >产品销售量分析（环比）表格</el-button>
    <el-button  @click="toReport('/main/reportsalechainratio')" >产品销售额分析（环比）表格</el-button>
    <el-button  @click="toReport('/main/reportsaleonyearsn')" >产品销售量分析（同比）表格</el-button>
    <el-button  @click="toReport('/main/reportsaleonyear')" >产品销售额分析（同比）表格</el-button>
    <el-button  @click="toReport('/main/reportsalevariance')" >产品销售量连续性/稳定性分析</el-button>
    <el-button  @click="toReport('/main/reportsalesbyhospital')" >销售额统计（按品销往单位） 表格</el-button>
    <el-button  @click="toReport('/main/reportsalesreturnmoney')" >佣金外欠金额（按联系人）表格</el-button>
    <el-button  @click="toReport('/main/reportpurchasereturnmoney')" >高打外欠金额（按联系人）表格</el-button>
    <el-button  @click="toReport('/main/reportcomprehensive')" >销售积分收付统计（近24个月）表格</el-button>
  </div>
</template>
<script>
  export default({
    data(){
        return{

        }
    },
    methods:{
      toReport(url){
        this.$router.push({path:url});
      }
    }
  })
</script>
<style scoped="scoped">
  .el-button{
    margin-bottom: 10px;
    margin-right:10px;
    margin-left:0px;
  }
</style>
