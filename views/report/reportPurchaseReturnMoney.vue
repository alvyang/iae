<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/main/report' }">报表管理</el-breadcrumb-item>
			<el-breadcrumb-item>采进外欠积分（按联系人）</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <div>
        <el-form-item label="是否打款" prop="makeMoneyFlag">
          <el-select v-model="params.makeMoneyFlag" filterable size="mini" style="width:210px;" placeholder="请选择">
            <el-option key="2" label="是" value="2"></el-option>
            <el-option key="" label="全部" value=""></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
         <el-button type="primary" v-dbClick style="margin-left: 14px;" @click="getPurchasesRefundMoney()" size="mini">查询</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div style="margin-top:10px;padding:10px;border:1px solid #ffffff;background-color:#ffffff;">
      <el-table v-for="d in listData" :data="d" style="width: 372px;display: inline-block;vertical-align: top;" size="mini" :stripe="true" :border="true">
    			<el-table-column prop="contacts_name" label="联系人" width="80" ></el-table-column>
  				<el-table-column prop="rsm" label="外欠金额" width="100" :formatter="formatterMoney"></el-table-column>
          <el-table-column prop="contacts_phone" label="联系电话" width="100"></el-table-column>
          <el-table-column width="90" label="操作" >
            <template slot-scope="scope">
              <el-button @click="viewReturnDetail(scope.row)" type="text" style="padding:0;font-size:12px;">查看详情</el-button>
            </template>
          </el-table-column>
  		</el-table>
    </div>
  </div>
</template>
<script>
  export default({
    data(){
        return{
          params:{
            makeMoneyFlag:"2"
          },
          listData:[]
        }
    },
    activated(){
      this.listData = [];
      this.getPurchasesRefundMoney();
    },
    methods:{
      viewReturnDetail(row){
        this.$router.push({path:`/main/reportpurchasereturnmoneydetail`,query:{contactId:row.contacts_id}});
      },
      formatterMoney(row, column, cellValue){
        return Math.round(cellValue*100)/100;
      },
      getPurchasesRefundMoney(){
        var _self = this;
        this.listData=[];
				this.jquery('/iae/report/getPurchasesReturnByContacts',_self.params,function(res){
          var len = Math.ceil(res.message.length/10);
          for(var i = 0 ; i < len ;i++){
            _self.listData.push(res.message.slice(i*10,(i+1)*10));
          }
				});
      }
    }
  })
</script>
<style>

</style>
