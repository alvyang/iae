<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>采进应收管理</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <div>
        <el-form-item label="备货日期" prop="time">
         <el-date-picker v-model="params.time" type="daterange" size="mini" align="right" unlink-panels
           range-separator="至"
           start-placeholder="开始日期"
           end-placeholder="结束日期"
           :picker-options="pickerOptions2">
         </el-date-picker>
        </el-form-item>
        <el-form-item label="打款日期" prop="makeMoneyTime">
         <el-date-picker v-model="params.makeMoneyTime" type="daterange" size="mini" align="right" unlink-panels
           range-separator="至"
           start-placeholder="开始日期"
           end-placeholder="结束日期"
           :picker-options="pickerOptions2">
         </el-date-picker>
        </el-form-item>
        <el-form-item label="应收日期" prop="returnTime">
         <el-date-picker v-model="params.returnTime" type="daterange" size="mini" align="right" unlink-panels
           range-separator="至"
           start-placeholder="开始日期"
           end-placeholder="结束日期"
           :picker-options="pickerOptions2">
         </el-date-picker>
        </el-form-item>
        <el-form-item label="实收日期" prop="realReturnTime">
         <el-date-picker v-model="params.realReturnTime" type="daterange" size="mini" align="right" unlink-panels
           range-separator="至"
           start-placeholder="开始日期"
           end-placeholder="结束日期"
           :picker-options="pickerOptions2">
         </el-date-picker>
        </el-form-item>
        <el-form-item label="产品名称" prop="productCommonName">
          <el-input v-model="params.productCommonName" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品名称/助记码"></el-input>
        </el-form-item>
        <el-form-item label="产品编码" prop="product_code">
          <el-input v-model="params.product_code" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="产品编码"></el-input>
        </el-form-item>
        <el-form-item label="　　批号" prop="batch_number">
   			 <el-input v-model="params.batch_number" style="width:210px;" @keyup.13.native="reSearch(false)" size="mini" placeholder="批号"></el-input>
   		 </el-form-item>
        <el-form-item label="　联系人" prop="contactId">
          <el-select v-model="params.contactId" style="width:210px;" filterable size="mini" placeholder="请选择">
            <el-option key="" label="全部" value=""></el-option>
            <el-option v-for="item in contacts"
              :key="item.contacts_id"
              :label="item.contacts_name"
              :value="item.contacts_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="　　商业" prop="business">
   			 <el-select v-model="params.business" style="width:210px;" size="mini" filterable placeholder="请选择商业">
   				 <el-option key="" label="全部" value=""></el-option>
   				 <el-option v-for="item in business"
   					 :key="item.business_id"
   					 :label="item.business_name"
   					 :value="item.business_id"></el-option>
   			 </el-select>
   		 </el-form-item>
       <el-form-item label="　　标签" prop="tag_type">
       <el-cascader v-model="params.tag_type" style="width:210px;" size="mini" placeholder="搜索标签" :options="tags" filterable></el-cascader>
     </el-form-item>
        <el-form-item label="积分状态" prop="status">
          <el-select v-model="params.status" filterable size="mini" style="width:210px;" placeholder="请选择">
            <el-option key="" label="全部" value=""></el-option>
            <el-option key="已收" label="已收" value="已收"></el-option>
            <el-option key="未收" label="未收" value="未收"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="付积分人" prop="refundser">
          <el-select v-model="params.refundser" style="width:210px;" filterable size="mini" placeholder="请选择">
            <el-option key="" label="全部" value=""></el-option>
            <el-option v-for="item in refundser" v-if="item.refundser"
              :key="item.refundser"
              :label="item.refundser"
              :value="item.refundser">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否超期" prop="overdue">
          <el-select v-model="params.overdue" filterable size="mini" style="width:210px;" placeholder="请选择">
            <el-option key="是" label="是" value="是"></el-option>
            <el-option key="" label="否" value=""></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否打款" prop="makeMoneyFlag">
          <el-select v-model="params.makeMoneyFlag" filterable size="mini" style="width:210px;" placeholder="请选择">
            <el-option key="2" label="是" value="2"></el-option>
            <el-option key="" label="全部" value=""></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
         <el-button type="primary" v-dbClick v-show="authCode.indexOf(',44,') > -1"  style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
         <el-button type="primary" v-dbClick v-show="authCode.indexOf(',44,') > -1"  @click="reSearch(true)" size="mini">重置</el-button>
         <el-button type="primary" v-dbClick v-show="authCode.indexOf(',106,') > -1"  @click="exportRefundPurchase" size="mini">导出</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div class="sum_money">
      积分：<a>{{refundMoney.rsm}}</a>
      实收积分：<a>{{refundMoney.rrm}}</a>
      未收积分：<a>{{refundMoney.own}}</a>
      其它积分：<a>{{refundMoney.sc}}</a> </div>
    <el-table :data="purchases" style="width: 100%" size="mini" :height="tableHeight" :stripe="true" :border="true">
      <el-table-column fixed prop="product_code" label="产品编码" width="100"></el-table-column>
      <el-table-column fixed prop="product_common_name" label="产品名称" width="120" ></el-table-column>
      <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
      <el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
      <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
      <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
      <el-table-column prop="purchase_price" label="中标价" width="60"></el-table-column>
      <el-table-column prop="purchase_number" label="购入数量" width="70"></el-table-column>
      <el-table-column prop="purchase_money" label="购入金额" width="70"></el-table-column>
      <el-table-column prop="batch_number" label="批号" width="70"></el-table-column>
      <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
      <el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
      <el-table-column  prop="time" label="备货日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="make_money_time" label="打款日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="send_out_time" label="发货日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="refunds_policy_money" label="积分" width="80"></el-table-column>
      <el-table-column  prop="refunds_should_time" label="应收日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="refunds_should_money" label="应收积分" width="80"></el-table-column>
      <el-table-column  prop="refunds_real_time" label="实收日期" width="80" :formatter="formatterDate"></el-table-column>
      <el-table-column  prop="refunds_real_money" label="实收积分" width="70"></el-table-column>
      <el-table-column  prop="service_charge" label="其它积分" width="60"></el-table-column>
      <el-table-column label="未收积分" width="80" :formatter="formatterMeondy"></el-table-column>
      <el-table-column  prop="refundser" label="付积分人" width="60"></el-table-column>
      <el-table-column  prop="account_number" label="收积分账号" width="80"></el-table-column>
      <el-table-column prop="refunds_remark" label="备注" width="150"></el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
      <template slot-scope="scope">
        <el-button v-show="authCode.indexOf(',104,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
        <el-button v-show="authCode.indexOf(',45,') > -1" size="mini" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary"></el-button>
      </template>
    </el-table-column>
    </el-table>
    <div class="page_div">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10,20, 50, 100]"
        :page-size="pageNum"
        layout="total, sizes, prev, pager, next"
        :total="count">
      </el-pagination>
    </div>
    <el-dialog title="更新积分记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+refund.product_common_name+ '）'" name="1">
			    <div><span>产品规格:</span>{{refund.product_specifications}}</div>
					<div><span>中标价:</span>{{refund.purchase_price}}</div>
          <div><span>打款价:</span>{{refund.purchase_mack_price}}</div>
          <div><span>购入数量:</span>{{refund.purchase_number}}</div>
          <div><span>积分:</span>{{refund.product_return_money}}</div>
          <div><span>打款时间:</span>{{refund.make_money_time?new Date(refund.make_money_time).format("yyyy-MM-dd"):""}}</div>
          <div><span>发货时间:</span>{{refund.send_out_time?new Date(refund.send_out_time).format("yyyy-MM-dd"):""}}</div>
					<div><span>积分率:</span>{{refund.product_return_discount}}%</div>
          <div style="display:block;width:100%;"><span>积分说明:</span>{{refund.product_return_explain}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="refund" status-icon style="margin-top:20px;" :inline="true" :rules="refundRule" ref="refund" label-width="100px" class="demo-ruleForm">
				<el-form-item label="应收日期" prop="refunds_should_time">
          <el-date-picker v-model="refund.refunds_should_time" style="width:194px;" type="date" placeholder="请选择应付日期"></el-date-picker>
				</el-form-item>
        <el-form-item label="积　　分" prop="refunds_policy_money">
					<el-input v-model="refund.refunds_policy_money" style="width:194px;" @blur="refundsPolicyMoney" placeholder="应付积分" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="应收积分" prop="refunds_should_money">
					<el-input v-model="refund.refunds_should_money" style="width:194px;" placeholder="应付积分" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="实收日期" prop="refunds_real_time">
          <el-date-picker v-model="refund.refunds_real_time" style="width:194px;" type="date" placeholder="请选择实收日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="实收积分" prop="refunds_real_money">
          <el-input v-model="refund.refunds_real_money" style="width:194px;" placeholder="实收积分" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="其它积分" prop="service_charge">
          <el-input v-model="refund.service_charge" style="width:194px;" placeholder="其它积分" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="付积分人" prop="refundser">
          <el-autocomplete popper-class="my-autocomplete" style="width:194px;"
           v-model="refund.refundser"
           :fetch-suggestions="querySearch"
           placeholder="付积分人" @select="handleSelect">
           <template slot-scope="{ item }">
             <div class="name">{{ item.refundser }}</div>
           </template>
          </el-autocomplete>
				</el-form-item>
        <el-form-item label="收积分账号" prop="receiver">
          <el-select v-model="refund.receiver" style="width:194px;" filterable placeholder="请选择">
            <el-option key="" label="请选择" value=""></el-option>
            <el-option v-for="item in accounts"
              :key="item.account_id"
              :label="item.account_number"
              :value="item.account_id">
            </el-option>
          </el-select>
				</el-form-item>
        <el-form-item label="备注" prop="refunds_remark">
          <el-input v-model="refund.refunds_remark" style="width:194px;" placeholder="备注" auto-complete="off"></el-input>
        </el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading"  @click="editRefunds('refund')">确 定</el-button>
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
    var validateNull = (rule, value, callback) =>{
      if(this.refund.receiver && !value){
        callback(new Error('请选择实付日期'));
      }else{
        callback();
      }
    }
    var validateMoney = (rule, value, callback) => {
      var reg = /^(([1-9]\d+(.[0-9]{1,4})?|\d(.[0-9]{1,4})?)|([-]([1-9]\d+(.[0-9]{1,4})?|\d(.[0-9]{1,4})?)))$/;
      if(this.refund.receiver && !value){
        callback(new Error('请再输入'+rule.labelname));
      }else if (this.refund.receiver && !reg.test(value)) {
        callback(new Error('请再输入正确的'+rule.labelname));
      } else {
        callback();
      }
    };
    const nowDate = new Date();
    const beforeDate = new Date();
    beforeDate.setFullYear(nowDate.getFullYear()-1);
    return {
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
        },{
          text: beforeDate.getFullYear()+'年',
          onClick(picker) {
            const start = new Date(beforeDate.getFullYear()+"-01"+"-01");
            const end = new Date(beforeDate.getFullYear()+"-12"+"-31");
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      purchases:[],
      contacts:[],
      business:[],//商业
      accounts:[],//收款人账号列表
      refundser:[],//返款人列表
      contactRefunders:[],//与当前联系人相关返款人列表
      refund:{
        refunds_real_time:null,
        refunds_should_money:"",
        refunds_real_money:"",
        refunds_policy_money:""
      },
      refundRule:{
        refunds_real_time:[{validator: validateNull,trigger: 'blur' }],
        refunds_should_money:[{validator: validateMoney,labelname:'应返积分',trigger: 'blur' }],
        refunds_real_money:[{validator: validateMoney,labelname:'实返积分',trigger: 'blur' }]
      },
      refundMoney:{
        rsm:0,
        rrm:0,
        sc:0,
        own:0
      },//返费总额
      pageNum:20,
      currentPage:1,
      count:0,
      params:{//查询参数
        overdue:"",
        productCommonName:"",
        time:[],
        returnTime:[],
        makeMoneyTime:[],
        realReturnTime:[],
        contactId:"",
        status:"",
        product_code:"",
        refundser:"",
        business:"",
        tag:"",
        tag_type:[],
        batch_number:"",
        makeMoneyFlag:"2"
      },
      tags:[],//标签
      dialogFormVisible:false,
      loading:false,
      authCode:"",
      tableHeight:0
    }
  },
  updated(){
    this.tableHeight = $(window).height() - 200 - $(".search").height();
    var that = this;
    $(window).resize(function(){
        that.tableHeight = $(window).height() - 200 - $(".search").height();
    });
  },
  activated(){
    this.getPurchasesList();
    this.getContacts();
    this.getPurchasesRefunder();
    this.getBankAccount();
    this.getProductBusiness();
    this.getTags();
    this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
  },
  mounted(){

  },
  methods:{
    refundsPolicyMoney(){
      if(!this.isEmpty(this.refund.refunds_policy_money)){
        this.refund.refunds_should_money = this.refund.refunds_policy_money * this.refund.purchase_number;
      }
    },
    getTags(){
      var _self = this;
      this.jquery("/iae/tag/getAllTags",null,function(res){//查询商业
        _self.tags=res.message.tagAll;
      });
    },
    deleteRow(scope){//删除
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
      this.jquery('/iae/refunds/deleteRefunds',{
        refunds_id:scope.row.refunds_id,
        refund_delete_flag:'1',
        purchases_id :scope.row.purchases_id
      },function(res){
        _self.$message({showClose: true,message: '删除成功',type: 'success'});
        _self.getPurchasesList();
        _self.dialogFormVisible = false;
      });
    },
    getProductBusiness(){
      var _self = this;
      this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
        _self.business=res.message;
      });
    },
    getPurchasesRefunder(){
      var _self = this;
      this.jquery("/iae/refunds/getPurchasesRefunder",null,function(res){//查询返款人
        _self.refundser=res.message;
      });
    },
    getBankAccount(){
      var _self = this;
      this.jquery("/iae/bankaccount/getAllAccounts",null,function(res){//查询返款人
        _self.accounts=res.message;
      });
    },
    getContacts(){
      var _self = this;
      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['高打品种']},function(res){
        _self.contacts = res.message;
      });
    },
    formatterMeondy(row, column, cellValue){
      var temp1 = this.sub(row.refunds_should_money,row.refunds_real_money,4);
      var temp = this.sub(temp1,row.service_charge,2);
      return temp;
    },
    formatterDate(row, column, cellValue){
      if(cellValue && typeof cellValue == "string"){
        var temp = cellValue.substring(0,10);
        var d = new Date(temp);
        d.setDate(d.getDate()+1);
        return d.format("yyyy-MM-dd");
      }else if(cellValue && typeof cellValue == "object"){
        return new Date(cellValue).format("yyyy-MM-dd");
      }else{
        return "";
      }
    },
    editRow(scope){//编辑返款信息
      //获取返款人信息
      var _self = this;
      this.jquery('/iae/refunds/getContactPurchasesRefunder',{contact_name:scope.row.contacts_name},function(res){
        _self.contactRefunders = res.message;
      });

      this.dialogFormVisible = true;
      if(this.$refs["refund"]){
        this.$refs["refund"].resetFields();
      }
      var temp = JSON.stringify(scope.row);
      this.refund = JSON.parse(temp);
      this.refund.front_message = temp;
      this.refund.refunds_policy_money =  this.refund.product_return_money;
      if(!this.isEmpty(this.refund.product_return_money) && this.isEmpty(this.refund.refunds_should_money)){
        var num = this.refund.sale_num?this.refund.sale_num:this.refund.purchase_number;
        if(!this.isEmpty(this.refund.product_floor_price) && !this.isEmpty(this.refund.product_high_discount)){
          var rMoney = (this.refund.purchase_mack_price - this.refund.product_floor_price) * (1-this.refund.product_high_discount/100);
          this.refund.refunds_should_money = rMoney * num;
        }else{
          this.refund.refunds_should_money = this.refund.product_return_money * num;
        }
        this.refund.refunds_should_money = Math.round(this.refund.refunds_should_money*100)/100;
      }
    },
    handleSelect(item) {
      this.refund.refundser = item.refundser;
    },
    querySearch(queryString, cb) {
      var receiver = this.contactRefunders;
      var results = queryString ? receiver.filter(this.createFilter(queryString)) : receiver;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      var _self = this;
      return (refundser) => {
        if(!_self.isEmpty(refundser.refundser)){
          return (refundser.refundser.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
        }else{
          return ;
        }
      };
    },
    reSearch(arg){
      if(arg){
        this.$refs["params"].resetFields();
        this.params.returnTime = [];
      }
      this.currentPage = 1;
      this.getPurchasesList();
    },
    exportRefundPurchase(){
      var url = this.$bus.data.host + "/iae/refunds/exportRefundPurchase";
      this.download(url,this.params);
    },
    getPurchasesList(){
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
      this.params.tag = this.params.tag_type[1];
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
      var url = this.refund.refunds_id?"/iae/refunds/editRefunds":"/iae/refunds/saveRefunds";
      this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true;
            var accountDetail = this.formatterDate(null,null,this.refund.make_money_time)+"高打"+this.refund.product_common_name+"收积分";
            var params = {
              refunds_should_time:this.refund.refunds_should_time,
          		refunds_real_time:this.refund.refunds_real_time,
          		refunds_should_money:this.refund.refunds_should_money,
          		refunds_real_money:this.refund.refunds_real_money,
          		refundser:this.refund.refundser,
          		receiver:this.refund.receiver,
              refunds_id:this.refund.refunds_id,
              purchases_id:this.refund.purchase_id,
              purchase_number:this.refund.purchase_number,
              sales_id:this.refund.sale_id,
              service_charge:this.refund.service_charge,
              refunds_remark:this.refund.refunds_remark,
              front_message:this.refund.front_message,
              refunds_policy_money:this.refund.refunds_policy_money,
              account_detail:accountDetail,
            };
            _self.jquery(url,params,function(res){
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.$message({showClose: true,message: '修改成功',type: 'success'});
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
