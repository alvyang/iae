<template>
  <div>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="销售机构" prop="hospitalsId">
			 <el-select v-model="params.hospitalsId" style="width:210px;" filterable size="mini" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option v-for="item in hospitals"
					 :key="item.hospital_id"
					 :label="item.hospital_name"
					 :value="item.hospital_id">
				 </el-option>
		 	</el-select>
		 </el-form-item>
      <el-form-item label="　商业" prop="business">
 			 <el-select v-model="params.business" style="width:210px;" size="mini" filterable placeholder="请选择商业">
 				 <el-option key="" label="全部" value=""></el-option>
 				 <el-option v-for="item in business"
 					 :key="item.business_id"
 					 :label="item.business_name"
 					 :value="item.business_id"></el-option>
 			 </el-select>
 		 </el-form-item>
     <el-form-item label="开始日期" prop="startTime">
			 <el-date-picker v-model="params.startTime" type="month" size="mini" style="width:210px;" placeholder="选择开始日期"></el-date-picker>
		 </el-form-item>
     <el-form-item label="结束日期" prop="endTime">
			 <el-date-picker v-model="params.endTime" type="month" size="mini" style="width:210px;" placeholder="选择结束日期"></el-date-picker>
		 </el-form-item>
      <el-form-item>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf('79,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf('79,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="sum_money">销售总额：<a>{{account.smAccount}}</a> 元；真实毛利：<a>{{account.rgpAccount}}</a> 元；真实毛利(不含税)：<a>{{account.rgptAccount}}</a> 元；商业提成：<a>{{account.profitAccount}}</a> 元；商业提成（按日均算）：<a>{{account.dayAvgprofitAccount}}</a> 元</div>
    <el-table :data="commission" style="width: 100%" size="mini" :stripe="true" :border="true">
      <el-table-column prop="bd" label="日期" width="70" fixed></el-table-column>
      <el-table-column prop="hospital_name" label="医院名称" width="150"></el-table-column>
      <el-table-column prop="business_name" label="商业" width="70"></el-table-column>
      <el-table-column prop="sm" label="销售额" width="80" :formatter="formatMoney"></el-table-column>
      <el-table-column prop="rgp" label="真实毛利（含税）" width="120" :formatter="formatMoney"></el-table-column>
      <el-table-column prop="rgpPercent" label="真实毛利率（含税）" width="120" :formatter="formatPercent"></el-table-column>
      <el-table-column prop="rgpt" label="真实毛利（不含税）" width="120" :formatter="formatMoney"></el-table-column>
      <el-table-column prop="rgptPercent" label="真实毛利率（不含税）" :formatter="formatPercent" width="120"></el-table-column>
      <el-table-column prop="hb_fixed_rate" label="固定成本率" width="50">
        <template slot-scope="scope">
          <el-input v-model="scope.row.hb_fixed_rate" @blur="saveRate(scope)" size="mini" class="small_input"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="hb_floating_rate" label="成本率/月" width="50">
        <template slot-scope="scope">
          <el-input v-model="scope.row.hb_floating_rate" @blur="saveRate(scope)" size="mini" class="small_input"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="ownMoney" label="月末应收金额" width="100" :formatter="formatMoney"></el-table-column>
      <el-table-column prop="mouthCoefficient" label="月末应收系数" width="100"></el-table-column>
      <el-table-column prop="day_avg" label="日均应收金额" width="100" :formatter="formatMoney"></el-table-column>
      <el-table-column prop="dayAvgCoefficient" label="日均应收系数" width="100"></el-table-column>
      <el-table-column prop="profit" label="商务提成" width="100" :formatter="formatMoney" fixed="right"></el-table-column>
      <el-table-column prop="profitCoefficient" label="商务提成系数" width="100" fixed="right"></el-table-column>
      <el-table-column prop="dayAvgprofit" label="商务提成（按日均算）" width="100" :formatter="formatMoney" fixed="right"></el-table-column>
      <el-table-column prop="dayAvgprofitCoefficient" label="商务提成系数（按日均算）" width="100" fixed="right"></el-table-column>
		</el-table>
    </el-table>
    <div class="page_div">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="pageNum"
        layout="total, sizes, prev, pager, next, jumper"
        :total="count">
      </el-pagination>
    </div>
    <el-dialog title="手动核算利润" width="500px" :visible.sync="dialogFormVisible">
      <el-form :model="account" status-icon :rules="accountRule" ref="account" label-width="90px" class="demo-ruleForm">
        <el-form-item label="银行账号" prop="account_number">
          <el-input v-model="account.account_number" style="width:370px;" auto-complete="off" :maxlength="20" placeholder="请输入银行账号"></el-input>
        </el-form-item>
        <el-form-item label="持卡人" prop="account_person">
          <el-input v-model="account.account_person" style="width:370px;" auto-complete="off" :maxlength="11" placeholder="请输入持卡人"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="add('account')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default({
    data(){
      return {
        dialogFormVisible:false,
        loading:false,
        authCode:"",
        account:{
          account_number:"",
          account_person:""
        },
        accountRule:{
          account_number:[{ required: true, message: '请输入银行账号', trigger: 'blur' }]
        },
        commission:[],
        commissionTemp:[],//用于前端分页
        commissionConfig:{
          commission_config_id:"",
          commission_start_money:"",
          commission_fixed_rate:""
        },
        pageNum:10,
        currentPage:1,
        count:0,
        params:{
          hospitalsId:"",
          business:"",
          startTime:null,
          endTime:null
        },
        business:[],//商业表
        hospitals:[],//医院表
        account:{
          smAccount:0,
          rgpAccount:0,
          rgptAccount:0,
          profitAccount:0,
          dayAvgprofitAccount:0,
        },//统计数据
      }
    },
    activated(){
      this.getBuninessCommissionList();
      this.getProductBusiness();
      this.getHospitals();
    },
    mounted(){
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
      saveRate(scope){
        var reg = /^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/;
				if(!scope.row.hb_fixed_rate || !scope.row.hb_floating_rate){
					return;
				}else if (!reg.test(scope.row.hb_fixed_rate) || !reg.test(scope.row.hb_floating_rate)) {
          return;
        }
        var _self = this;
				this.jquery('/iae/businesscommission/saveBunsinessCommission',{
          commission_id:scope.row.commission_id,
          commission_time:scope.row.bd,
          commission_hospital_id:scope.row.hospital_id,
          commission_business:scope.row.product_business,
          commission_fixed_rate:scope.row.hb_fixed_rate,
          commission_floating_rate:scope.row.hb_floating_rate,
        },function(res){
						_self.getBuninessCommissionList();
				});
      },
      formatPercent(row, column, cellValue){
        if(cellValue){
          return cellValue+"%";
        }else{
          return "";
        }
      },
      formatMoney(row, column, cellValue){
        if(cellValue){
          return (cellValue+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }else{
          return 0;
        }
      },
      getHospitals(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'销售医院'},function(res){
						_self.hospitals = res.message;
				});
			},
      getProductBusiness(){
				var _self = this;
				this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
					_self.business=res.message;
				});
			},
      editRow(scope){//编辑药品信息
        this.dialogFormVisible = true;
        this.account = scope.row;
        var _self = this;
        setTimeout(function(){
          _self.$refs["account"].clearValidate();
        });
      },
      deleteRow(scope){
        this.$confirm('是否删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteItem(scope);
        }).catch(() => {
        });
      },
      deleteItem(scope){
        var _self = this;
        this.jquery('/iae/bankaccount/deleteAccount',{
          account_id:scope.row.account_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.getBuninessCommissionList();
          _self.dialogFormVisible = false;
        });
      },
      addShow(){
        this.account={
          account_number:"",
          account_person:"",
        };
        this.dialogFormVisible = true;
      },
      add(formName){
        var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/bankaccount/saveAccounts',_self.account,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
                _self.loading = false;
                _self.getBuninessCommissionList();
              });
            }else{
              this.jquery('/iae/bankaccount/editAccounts',_self.account,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
                _self.loading = false;
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      getBuninessCommissionList(){
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
        this.jquery('/iae/businesscommission/getBuninessCommission',{
          data:_self.params,
          page:page
        },function(res){
            _self.commissionTemp = res.message.data;
            _self.account = res.message.account;
            _self.frontPage();
            _self.pageNum=parseInt(res.message.limit);
            _self.count=res.message.totalCount;
        });
      },
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.currentPage = 1;
        this.getBuninessCommissionList();
      },
      handleSizeChange(val) {
        this.currentPage = 1;
        this.frontPage();
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.frontPage();
      },
      frontPage(){
        var start = (this.currentPage-1)*this.pageNum;
        var end = this.currentPage*this.pageNum;
        this.commission = this.commissionTemp.slice(start,end);
      }
    }
  })
</script>
<style>
  .small_input input{
    padding:0px 7px !important;
    height: 23px !important;
    line-height: 23px !important;
  }
  .commission_config_div{
    background-color: #ffffff;
    height: 40px;
    margin-bottom: 10px;
  }
</style>
