<template>
  <div>
    <el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
      <el-form-item label="回款医院" prop="hospitalsId">
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
        <el-button type="primary" v-dbClick v-show="authCode.indexOf('84,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf('84,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
        <el-button type="primary" v-dbClick v-show="authCode.indexOf('87,') > -1" @click="addShow" size="mini">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="returnMoneys" style="width: 100%" size="mini" :stripe="true" :border="true">
      <el-table-column prop="return_money_time" label="日期" :formatter="formatterDate" width="100"></el-table-column>
      <el-table-column prop="return_money" label="回款金额" :formatter="formatterMoney" width="150"></el-table-column>
      <el-table-column prop="hospital_name" label="医院名称" width="350"></el-table-column>
      <el-table-column prop="business_name" label="商业"></el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
  		    <el-button v-show="authCode.indexOf('86,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
          <el-button v-show="authCode.indexOf('85,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
        layout="total, sizes, prev, pager, next, jumper"
        :total="count">
      </el-pagination>
    </div>
    <el-dialog :title="title == 1?'新增回款':'修改回款'" width="700px" :visible.sync="dialogFormVisible">
      <el-form :model="returnMoney" status-icon :rules="returnMoneyRule" ref="returnMoney" :inline="true" label-width="90px" class="demo-ruleForm">
        <el-form-item label="回款日期" prop="return_money_time">
					<el-date-picker v-model="returnMoney.return_money_time" style="width:194px;" type="date" placeholder="请选择回款日期"></el-date-picker>
				</el-form-item>
        <el-form-item label="回款金额" prop="return_money" :required="true">
          <el-input v-model="returnMoney.return_money" style="width:194px;" placeholder="请输入回款金额"></el-input>
				</el-form-item>
				<el-form-item label="回款医院" prop="return_money_hospital">
					<el-select v-model="returnMoney.return_money_hospital" style="width:194px;" filterable placeholder="请选择回款医院">
						<el-option v-for="item in hospitals"
							:key="item.hospital_id"
							:label="item.hospital_name"
							:value="item.hospital_id">
						</el-option>
					</el-select>
				</el-form-item>
        <el-form-item label="　商业" prop="return_money_business">
   			 <el-select v-model="returnMoney.return_money_business" style="width:194px;"filterable placeholder="请选择商业">
   				 <el-option key="" label="全部" value=""></el-option>
   				 <el-option v-for="item in business"
   					 :key="item.business_id"
   					 :label="item.business_name"
   					 :value="item.business_id"></el-option>
   			 </el-select>
   		 </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="add('returnMoney')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default({
    data(){
      var validateReturnMoney = (rule, value, callback) => {
				var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if(!value){
          callback(new Error('请输入回款金额'));
        }else if(!reg.test(value)){
					callback(new Error('请输入正确的回款金额'));
				} else {
          callback();
        }
      }
      return {
        title:1,
        dialogFormVisible:false,
        loading:false,
        authCode:"",
        returnMoney:{
          return_money_time:"",
          return_money:"",
          return_money_hospital:"",
          return_money_business:""
        },
        returnMoneyRule:{
          return_money_time:[{ required: true, message: '请选择回款时间', trigger: 'blur,change' }],
          return_money:[{validator: validateReturnMoney,trigger: 'blur' }],
          return_money_hospital:[{ required: true, message: '请选择回款医院', trigger: 'blur,change' }],
          return_money_business:[{ required: true, message: '请选择商业', trigger: 'blur,change' }]
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
        returnMoneys:[],//返款列表
      }
    },
    activated(){
      this.getReturnMoneyList();
      this.getProductBusiness();
      this.getHospitals();
    },
    mounted(){
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods:{
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
      formatterMoney(row, column, cellValue){
        return cellValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
      getHospitals(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:'销售单位'},function(res){
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
        this.title=2;
        this.returnMoney = scope.row;
        var _self = this;
        setTimeout(function(){
          _self.$refs["returnMoney"].clearValidate();
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
        this.jquery('/iae/hospitalreturnmoney/deleteReturnMoney',{
          return_money_id:scope.row.return_money_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.getReturnMoneyList();
          _self.dialogFormVisible = false;
        });
      },
      addShow(){
        this.title=1;
        this.returnMoney={
          return_money_time:"",
          return_money:"",
          return_money_hospital:"",
          return_money_business:""
        };
        if(this.$refs["returnMoney"]){
          this.$refs["returnMoney"].resetFields();
          this.$refs["returnMoney"].clearValidate();
        }
        this.dialogFormVisible = true;
      },
      add(formName){
        var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/hospitalreturnmoney/saveReturnMoney',_self.returnMoney,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
                _self.loading = false;
                _self.getReturnMoneyList();
              });
            }else{
              this.jquery('/iae/hospitalreturnmoney/editReturnMoney',_self.returnMoney,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
                _self.getReturnMoneyList();
                _self.loading = false;
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      getReturnMoneyList(){
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
        this.jquery('/iae/hospitalreturnmoney/getReturnMoney',{
          data:_self.params,
          page:page
        },function(res){
            _self.returnMoneys = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
            _self.count=res.message.totalCount;
        });
      },
      reSearch(arg){
        if(arg){
          this.$refs["params"].resetFields();
        }
        this.currentPage = 1;
        this.getReturnMoneyList();
      },
      handleSizeChange(val) {
        this.currentPage = 1;
        this.getReturnMoneyList();
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getReturnMoneyList();
      }
    }
  })
</script>
<style>
  .commission_config_div{
    background-color: #ffffff;
    height: 40px;
    margin-bottom: 10px;
  }
</style>
