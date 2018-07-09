<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>返款管理</el-breadcrumb-item>
			<el-breadcrumb-item>高打返款管理</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" class="demo-form-inline search">
      <div>
        <el-form-item label="产品名称" prop="productCommonName">
          <el-input v-model="params.productCommonName" @keyup.13.native="reSearch(false)" size="small" placeholder="产品名称/助记码"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactId">
          <el-select v-model="params.contactId" filterable size="small" placeholder="请选择">
            <el-option v-for="item in contacts"
              :key="item.contacts_id"
              :label="item.contacts_name"
              :value="item.contacts_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备货日期" prop="time">
         <el-date-picker v-model="params.time" type="daterange" size="small" align="right" unlink-panels
           range-separator="至"
           start-placeholder="开始日期"
           end-placeholder="结束日期"
           :picker-options="pickerOptions2">
         </el-date-picker>
        </el-form-item>
        <el-form-item label="应返日期" prop="returnTime">
         <el-date-picker v-model="params.returnTime" type="daterange" size="small" align="right" unlink-panels
           range-separator="至"
           start-placeholder="开始日期"
           end-placeholder="结束日期"
           :picker-options="pickerOptions2">
         </el-date-picker>
        </el-form-item>
        <el-form-item label="返款状态" prop="status">
          <el-select v-model="params.status" filterable size="small" style="width:178px;" placeholder="请选择">
            <el-option key="已返" label="已返" value="已返"></el-option>
            <el-option key="未返" label="未返" value="未返"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
         <el-button type="primary" v-dbClick v-show="authCode.indexOf('44') > -1"  style="margin-left: 14px;" @click="reSearch(false)" size="small">查询</el-button>
         <el-button type="primary" v-dbClick v-show="authCode.indexOf('44') > -1"  @click="reSearch(true)" size="small">重置</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div class="sum_money">应返金额：<a>{{refundMoney.rsm}}</a> 元；实返金额：<a>{{refundMoney.rrm}}</a> 元；手续费：<a>{{refundMoney.sc}}</a> 元；外欠金额：<a>{{refundMoney.own}}</a> 元</div>
    <el-table :data="purchases" style="width: 100%" :stripe="true" :border="true">
      <el-table-column fixed prop="product_code" label="产品编码" width="120"></el-table-column>
      <el-table-column fixed prop="product_common_name" label="产品名称" width="160" ></el-table-column>
      <el-table-column prop="product_specifications" label="产品规格" width="120"></el-table-column>
      <el-table-column prop="product_makesmakers" label="生产产家" width="150"></el-table-column>
      <el-table-column prop="product_packing" label="包装" width="60"></el-table-column>
      <el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
      <el-table-column prop="purchase_price" label="中标价" width="80"></el-table-column>
      <el-table-column prop="purchase_number" label="购入数量" width="80"></el-table-column>
      <el-table-column prop="purchase_money" label="购入金额" width="90"></el-table-column>
      <el-table-column prop="contacts_name" label="联系人" width="90"></el-table-column>
      <el-table-column  prop="time" label="备货日期" width="100" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="make_money_time" label="打款日期" width="100" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="send_out_time" label="发货日期" width="100" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="refunds_should_time" label="应返日期" width="100" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="refunds_should_money" label="应返金额" width="100"></el-table-column>
      <el-table-column  prop="refunds_real_time" label="实返日期" width="100" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="refunds_real_money" label="实返金额" width="100"></el-table-column>
      <el-table-column  prop="service_charge" label="手续费" width="100"></el-table-column>
      <el-table-column  prop="refundser" label="返款人" width="100"></el-table-column>
      <el-table-column  prop="receiver" label="收款人" width="100"></el-table-column>
      <el-table-column fixed="right" label="操作" width="80">
      <template slot-scope="scope">
        <el-button v-show="authCode.indexOf('45') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
      </template>
    </el-table-column>
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
    <el-dialog title="更新返款记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+refund.product_common_name+ '）'" name="1">
			    <div><span>产品规格:</span>{{refund.product_specifications}}</div>
					<div><span>中标价:</span>{{refund.purchase_price}}</div>
          <div><span>打款价:</span>{{refund.purchase_mack_price}}</div>
          <div><span>购入数量:</span>{{refund.purchase_number}}</div>
          <div><span>返款金额:</span>{{refund.product_return_money}}</div>
          <div><span>打款时间:</span>{{refund.make_money_time?new Date(refund.make_money_time).format("yyyy-MM-dd"):""}}</div>
          <div><span>发货时间:</span>{{refund.send_out_time?new Date(refund.send_out_time).format("yyyy-MM-dd"):""}}</div>
					<div><span>返款率:</span>{{refund.product_return_discount}}%</div>
          <div style="display:block;width:100%;"><span>返款说明:</span>{{refund.product_return_explain}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="refund" status-icon style="margin-top:20px;" :inline="true" ref="refund" label-width="100px" class="demo-ruleForm">
				<el-form-item label="应返日期" prop="refunds_should_time" :maxlength="10">
          <el-date-picker v-model="refund.refunds_should_time" style="width:194px;" type="date" placeholder="请选择应返日期"></el-date-picker>
				</el-form-item>
				<el-form-item label="应返金额" prop="refunds_should_money">
					<el-input v-model="refund.refunds_should_money" style="width:194px;" placeholder="应返金额" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="实返日期" prop="refunds_real_time" :maxlength="10">
          <el-date-picker v-model="refund.refunds_real_time" style="width:194px;" type="date" placeholder="请选择实返日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="实返金额" prop="refunds_real_money">
          <el-input v-model="refund.refunds_real_money" style="width:194px;" placeholder="实返金额" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手续费" prop="refunds_real_money">
          <el-input v-model="refund.service_charge" style="width:194px;" placeholder="实返金额" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="返款信息" prop="refundser">
					<el-input v-model="refund.refundser" style="width:194px;" placeholder="返款信息" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="收款信息" prop="receiver">
					<el-input v-model="refund.receiver" style="width:194px;" placeholder="收款信息" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="mini" :loading="loading"  @click="editRefunds('refund')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default({
  data(){
    var validateNum = (rule, value, callback) => {
      var regu = /^\+?[1-9][0-9]*$/;
      if (value === '') {
        callback(new Error('请输入计划数量'));
      } else if(!regu.test(value)){
        callback(new Error('请输入正整数'));
      } else {
        callback();
      }
    };
    const defaultEnd = new Date();
    const defaultStart = new Date(defaultEnd.getFullYear()+"-01"+"-01");
    const defaultStart2 = new Date(defaultEnd.getTime() - 30 * 24 * 3600 * 1000);
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
      purchases:[],
      contacts:[],
      refund:{},
      refundMoney:{},//返费总额
      pageNum:10,
      currentPage:1,
      count:0,
      params:{//查询参数
        productCommonName:"",
        time:[defaultStart,defaultEnd],
        returnTime:null,
        contactId:"",
        status:""
      },
      dialogFormVisible:false,
      loading:false,
      authCode:"",
    }
  },
  activated(){
    this.getPurchasesList();
    this.getContacts();
    this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
  },
  mounted(){

  },
  methods:{
    getContacts(){
      var _self = this;
      this.jquery('/iae/contacts/getAllContacts',{group_id:0},function(res){
        _self.contacts = res.message;
      });
    },
    formatterDate(row, column, cellValue){
      if(cellValue){
        var temp = cellValue.substring(0,10);
        var d = new Date(temp);
        d.setDate(d.getDate()+1);
        return d.format("yyyy-MM-dd");
      }else{
        return "";
      }

    },
    editRow(scope){//编辑返款信息
      this.dialogFormVisible = true;
      this.refund = scope.row;
      if(this.refund.product_return_money && !this.refund.refunds_should_money){
        var num = this.refund.sale_num?this.refund.sale_num:this.refund.purchase_number;
        if(this.refund.product_type=="高打(底价)"){
          var rMoney = (this.refund.purchase_mack_price - this.refund.product_floor_price) * (1-this.refund.product_high_discount/100);
          this.refund.refunds_should_money = rMoney * num;
        }else{
          this.refund.refunds_should_money = this.refund.product_return_money * num;
        }
        this.refund.refunds_should_money = this.refund.refunds_should_money.toFixed(2);
      }
    },
    reSearch(arg){
      if(arg){
        this.$refs["params"].resetFields();
        this.params.returnTime = null;
      }
      this.currentPage = 1;
      this.getPurchasesList();
    },
    getPurchasesList(){
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
      this.jquery('/iae/refunds/getPurchaseRefunds',{
        data:_self.params,
        page:page
      },function(res){
          _self.purchases = res.message.data;
          var own = res.message.rsm-res.message.rrm-res.message.sc;
          _self.refundMoney = {
            rrm:(res.message.rrm+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            rsm:(res.message.rsm+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            sc:(res.message.sc+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            own:(own.toFixed(2)+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          };
          _self.pageNum=parseInt(res.message.limit);
          _self.count=res.message.totalCount;
      });
    },
    editRefunds(formName){
      var _self = this;
      this.loading = true;
      var url = this.refund.refunds_id?"/iae/refunds/editRefunds":"/iae/refunds/saveRefunds";
      this.$refs[formName].validate((valid) => {
          if (valid) {
            var params = {
              refunds_should_time:this.refund.refunds_should_time,
          		refunds_real_time:this.refund.refunds_real_time,
          		refunds_should_money:this.refund.refunds_should_money,
          		refunds_real_money:this.refund.refunds_real_money,
          		refundser:this.refund.refundser,
          		receiver:this.refund.receiver,
              refunds_id:this.refund.refunds_id,
              purchases_id:this.refund.purchase_id,
              sales_id:this.refund.sale_id,
              service_charge:this.refund.service_charge
            };
            _self.jquery(url,params,function(res){
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.$message({message: '修改成功',type: 'success'});
              _self.getPurchasesList();
            });
          } else {
            return false;
          }
      });
    },
    handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getPurchasesList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getPurchasesList();
    }
  }
});
</script>
<style>
</style>
