<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>销售应收管理</el-breadcrumb-item>
		</el-breadcrumb>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <div>
        <el-form-item label="销售日期" prop="salesTime">
         <el-date-picker v-model="params.salesTime" type="daterange" size="mini" align="right" unlink-panels
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
        <el-form-item label="销往单位" prop="hospitalsId">
  			 <el-select v-model="params.hospitalsId" style="width:210px;" filterable size="mini" placeholder="请选择">
  				 <el-option key="" label="全部" value=""></el-option>
  				 <el-option v-for="item in hospitals"
  					 :key="item.hospital_id"
  					 :label="item.hospital_name"
  					 :value="item.hospital_id">
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
        <el-form-item>
         <el-button type="primary" v-dbClick v-show="authCode.indexOf(',46,') > -1" style="margin-left: 14px;" @click="reSearch(false)" size="mini">查询</el-button>
         <el-button type="primary" v-dbClick v-show="authCode.indexOf(',46,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
         <el-button type="primary" v-dbClick v-show="authCode.indexOf(',105,') > -1" @click="exportRefundSale" size="mini">导出</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div class="sum_money">
      积分：<a>{{refundMoney.rsm}}</a>
      已收积分：<a>{{refundMoney.rrm}}</a>
      未收积分：<a>{{refundMoney.own}}</a>
      其它积分：<a>{{refundMoney.sc}}</a>
    </div>
    <el-table :data="refunds" style="width: 100%" size="mini" :stripe="true" :border="true">
        <el-table-column fixed prop="product_code" label="产品编码" width="100"></el-table-column>
        <el-table-column fixed prop="product_common_name" label="产品名称" width="120" ></el-table-column>
        <el-table-column prop="product_specifications" label="产品规格" width="100"></el-table-column>
        <el-table-column prop="product_makesmakers" label="生产厂家" width="150"></el-table-column>
        <el-table-column prop="product_packing" label="包装" width="50"></el-table-column>
        <el-table-column prop="product_unit" label="单位" width="50"></el-table-column>
        <el-table-column prop="sale_price" label="中标价" width="60"></el-table-column>
        <el-table-column prop="sale_num" label="计划数量" width="70"></el-table-column>
        <el-table-column prop="sale_money" label="购入金额" width="70"></el-table-column>
        <el-table-column prop="business_name" label="商业" width="60"></el-table-column>
        <el-table-column prop="contacts_name" label="联系人" width="60"></el-table-column>
        <el-table-column prop="hospital_name" label="销往单位" width="140"></el-table-column>
        <el-table-column prop="bill_date" label="销售日期" width="80" :formatter="formatterDate"></el-table-column>
        <el-table-column prop="refunds_policy_money" label="积分" width="80"></el-table-column>
        <el-table-column prop="refunds_should_time" label="应收日期" width="80" :formatter="formatterDate"></el-table-column>
        <el-table-column prop="refunds_should_money" label="应收积分" width="80"></el-table-column>
        <el-table-column prop="refunds_real_time" label="实收日期" width="80" :formatter="formatterDate"></el-table-column>
        <el-table-column prop="refunds_real_money" label="实收积分" width="80"></el-table-column>
        <el-table-column label="未返积分" width="80" :formatter="formatterMeondy"></el-table-column>
        <el-table-column prop="service_charge" label="其它积分" width="60"></el-table-column>
        <el-table-column prop="refundser" label="付积分人" width="60"></el-table-column>
        <el-table-column prop="account_number" label="收积分账号" width="80"></el-table-column>
        <el-table-column prop="refunds_remark" label="备注" width="150"></el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button v-show="authCode.indexOf(',103,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
          <el-button v-show="authCode.indexOf(',47,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
    <el-dialog title="更新积分记录" width="700px" :visible.sync="dialogFormVisible">
			<el-collapse v-model="activeNames">
			  <el-collapse-item :title="'药品信息（药品名：'+refund.product_common_name+ '）'" name="1">
			    <div><span>产品编号:</span>{{refund.product_code}}</div>
			    <div><span>产品规格:</span>{{refund.product_specifications}}</div>
					<div><span>中标价:</span>{{refund.sale_price}}</div>
          <div><span>销售数量:</span>{{refund.sale_num}}</div>
          <div><span>积分:</span>{{refund.product_return_money}}</div>
          <div><span>积分率:</span>{{refund.product_return_discount}}%</div>
          <div style="display:block;width:100%;"><span>销售日期:</span>{{formatterDate(null,null,refund.bill_date+"")}}</div>
          <div style="display:block;width:100%;"><span>积分说明:</span>{{refund.product_return_explain}}</div>
			  </el-collapse-item>
			</el-collapse>
			<el-form :model="refund" status-icon style="margin-top:20px;" :rules="refundRule"  :inline="true" ref="refund" label-width="100px" class="demo-ruleForm">
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
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="editRefunds('refund')">确 定</el-button>
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
        callback(new Error('请选择实收日期'));
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
      refunds:[],
      refund:{
        refunds_real_time:null,
        refunds_should_money:"",
        refunds_real_money:"",
        refunds_policy_money:""
      },
      refundRule:{
        refunds_real_time:[{validator: validateNull,trigger: 'blur' }],
        refunds_should_money:[{validator: validateMoney,labelname:'应付积分',trigger: 'blur' }],
        refunds_real_money:[{validator: validateMoney,labelname:'实收积分',trigger: 'blur' }]
      },
      refundMoney:{
        rsm:0,
        rrm:0,
        sc:0,
        own:0,
      },//返费总额
      contacts:[],
      tags:[],//标签
      business:[],
      refundser:[],//返款人列表
      contactRefunders:[],//与当前联系人相关返款人列表
      pageNum:10,
      currentPage:1,
      count:0,
      params:{//查询参数
        overdue:"",
        productCommonName:"",
        salesTime:[],
        returnTime:[],
        realReturnTime:[],
        contactId:"",
        status:"",
        business:"",
        product_code:"",
        refundser:"",
        tag:"",
        tag_type:[],
        hospitalsId:""
      },
      hospitals:[],
      dialogFormVisible:false,
      loading:false,
      authCode:"",
    }
  },
  activated(){
    this.getRefundsList();
    this.getContacts();
    this.getProductBusiness();
    this.getSalesRefunder();
    this.getBankAccount();
    this.getHospitals();
    this.getTags();
    this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
  },
  mounted(){

  },
  methods:{
    refundsPolicyMoney(){
      if(this.refund.refunds_policy_money){
        this.refund.refunds_should_money = this.refund.refunds_policy_money * this.refund.sale_num;
      }
    },
    getHospitals(){
      var _self = this;
      this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'销售单位'},function(res){
          _self.hospitals = res.message;
      });
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
        sales_id :scope.row.sale_id
      },function(res){
        _self.$message({showClose: true,message: '删除成功',type: 'success'});
        _self.getRefundsList();
        _self.dialogFormVisible = false;
      });
    },
    getSalesRefunder(){
      var _self = this;
      this.jquery("/iae/refunds/getSalesRefunder",null,function(res){//查询返款人
        _self.refundser=res.message;
      });
    },
    getBankAccount(){
      var _self = this;
      this.jquery("/iae/bankaccount/getAllAccounts",null,function(res){//查询账号
        _self.accounts=res.message;
      });
    },
    getProductBusiness(){
      var _self = this;
      this.jquery("/iae/business/getAllBusiness",null,function(res){//查询商业
        _self.business=res.message;
      });
    },
    getContacts(){
      var _self = this;
      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['佣金品种']},function(res){
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
      this.jquery('/iae/refunds/getContactSalesRefunder',{contact_name:scope.row.contacts_name},function(res){
        _self.contactRefunders = res.message;
      });
      this.dialogFormVisible = true;
      if(this.$refs["refund"]){
        this.$refs["refund"].resetFields();
      }
      var temp = JSON.stringify(scope.row);
      this.refund = JSON.parse(temp);
      this.refund.front_message = temp;
      this.refund.product_return_money = this.refund.hospital_policy_return_money?this.refund.hospital_policy_return_money:this.refund.product_return_money;
      if(this.refund.product_return_money && !this.refund.refunds_should_money){
        if(this.refund.product_floor_price && this.refund.product_high_discount && !this.refund.hospital_policy_return_money){
          var rMoney = (this.refund.product_mack_price - this.refund.product_floor_price) * (1-this.refund.product_high_discount/100);
          this.refund.refunds_should_money = rMoney * this.refund.sale_num;
          this.refund.refunds_should_money = Math.round(this.refund.refunds_should_money*100)/100;
        }else{
          this.refund.refunds_should_money = this.mul(this.refund.product_return_money,this.refund.sale_num,2);
        }
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
      return (refundser) => {
        if(refundser.refundser){
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
        this.params.realReturnTime = [];
      }
      this.currentPage = 1;
      this.getRefundsList();
    },
    exportRefundSale(){
      var url = this.$bus.data.host + "/iae/refunds/exportRefundSale";
      this.download(url,this.params);
    },
    getRefundsList(){
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
      this.params.tag = this.params.tag_type[1];
      this.jquery('/iae/refunds/getSaleRefunds',{
        data:_self.params,
        page:page
      },function(res){
          _self.refunds = res.message.data;
          var own = res.message.rsm - res.message.rrm - res.message.sc;
          own = Math.round(own*100)/100;
          _self.refundMoney = {
            rrm:(res.message.rrm+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            rsm:(res.message.rsm+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            sc:(res.message.sc+"").replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            own:(own+"").replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
            this.loading=true;
            var accountDetail = this.formatterDate(null,null,this.refund.bill_date)+"销售"+this.refund.product_common_name+"收积分";
            var params = {
              refunds_should_time:this.refund.refunds_should_time,
          		refunds_real_time:this.refund.refunds_real_time,
          		refunds_should_money:this.refund.refunds_should_money,
          		refunds_real_money:this.refund.refunds_real_money,
          		refundser:this.refund.refundser,
          		receiver:this.refund.receiver,
              refunds_id:this.refund.refunds_id,
              sales_id:this.refund.sale_id,
              service_charge:this.refund.service_charge,
              refunds_remark:this.refund.refunds_remark,
              front_message:this.refund.front_message,
              account_detail:accountDetail,
              refunds_policy_money:this.refund.refunds_policy_money,

            };
            _self.jquery(url,params,function(res){
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.$message({showClose: true,message: '修改成功',type: 'success'});
              _self.getRefundsList();
            });
          } else {
            return false;
          }
      });
    },
    handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getRefundsList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getRefundsList();
    }
  }
});
</script>
<style>
</style>
