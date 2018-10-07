<template>
  <div>
    <el-button round @click="toReport('/main/reportsaleline')" >销售统计（按月） 折线图</el-button>
    <el-button round @click="toReport('/main/reporttagbar')" >销售统计（按标签） 柱状图</el-button>
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
<style>
</style>
