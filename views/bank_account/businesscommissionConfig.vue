<template>
	<div>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
			<el-form-item label="销售机构" prop="hospital_id">
			 <el-select v-model="params.hospital_id" style="width:210px;" filterable size="mini" placeholder="请选择">
				 <el-option key="" label="全部" value=""></el-option>
				 <el-option v-for="item in hospitals"
					 :key="item.hospital_id"
					 :label="item.hospital_name"
					 :value="item.hospital_id">
				 </el-option>
		 	</el-select>
		 </el-form-item>
      <el-form-item label="　商业" prop="business_id">
 			 <el-select v-model="params.business_id" style="width:210px;" size="mini" filterable placeholder="请选择商业">
 				 <el-option key="" label="全部" value=""></el-option>
 				 <el-option v-for="item in business"
 					 :key="item.business_id"
 					 :label="item.business_name"
 					 :value="item.business_id"></el-option>
 			 </el-select>
 		 </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('79,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('79,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="businessList" style="width: 100%" size="mini" :stripe="true" :border="true">
			<el-table-column prop="hospital_name" label="医院名称"></el-table-column>
			<el-table-column prop="business_name" label="商业名称"></el-table-column>
			<el-table-column prop="hb_start_time" label="成本计算开始时间" :formatter="formatterDate"></el-table-column>
			<el-table-column prop="hb_start_money" label="期初未回款金额"></el-table-column>
      <el-table-column prop="hb_fixed_rate" label="固定成本率(%)"></el-table-column>
      <el-table-column prop="hb_floating_rate" label="成本率/月(%)"></el-table-column>
      <el-table-column fixed="right" label="操作" width="60">
        <template slot-scope="scope">
          <el-button v-dbClick v-show="authCode.indexOf('80,') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog title="修改商业成本配置" width="500px" :visible.sync="dialogFormVisible">
			<el-form :model="config" status-icon :rules="configRule" ref="config" label-width="140px" class="demo-ruleForm">
				<el-form-item label="成本计算开始时间" prop="hb_start_time">
					<el-date-picker v-model="config.hb_start_time" style="width:300px;" placeholder="选择成本计算开始时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="期初未回款金额" prop="hb_start_money">
					<el-input v-model="config.hb_start_money" auto-complete="off" style="width:300px;" :maxlength="50" placeholder="请输入期初未回款金额"></el-input>
				</el-form-item>
				<el-form-item label="固定成本率(%)" prop="hb_fixed_rate">
					<el-input v-model="config.hb_fixed_rate" auto-complete="off" style="width:300px;" :maxlength="50" placeholder="请输入固定成本率(如：0-100)"></el-input>
				</el-form-item>
        <el-form-item label="成本率/月(%)" prop="hb_floating_rate">
					<el-input v-model="config.hb_floating_rate" auto-complete="off" style="width:300px;" :maxlength="50" placeholder="请输入成本率/月(如：0-100)"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="add('config')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
      var validateMoney = (rule, value, callback) => {
				var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
				if(!value){
					callback(new Error('请再输入'+rule.labelname));
				}else if (!reg.test(value)) {
        	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
         	callback();
        }
    	};
      var validatePercent = (rule, value, callback) => {
				if(!value){
					callback(new Error('请再输入'+rule.labelname));
				}else if (!/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
          	callback(new Error('请再输入正确的'+rule.labelname));
        } else {
         	callback();
        }
    	};
			return {
				dialogFormVisible:false,
				config:{
					hb_start_time:null,
					hb_start_money:"",
					hb_fixed_rate:"",
          hb_floating_rate:""
				},
				configRule:{
					hb_start_time:[{ required: true, message: '请选择成本计算开始时间', trigger: 'change' }],
					hb_start_money:[{ validator: validateMoney, labelname: '期初未回款金额', trigger: 'blur' }],
          hb_fixed_rate:[{ validator: validatePercent, labelname: '固定成本率', trigger: 'blur' }],
          hb_floating_rate:[{ validator: validatePercent, labelname: '成本率/月', trigger: 'blur' }]
				},
				authCode:"",
				loading:false,
				businessList:[],
				pageNum:10,
				currentPage:1,
				count:0,
				deleteId:null,
				params:{
					business_id:"",
					hospital_id:""
				},
				hospitals:[],
				business:[]
			}
		},
		activated(){
			this.getBusinessList();
			this.getProductBusiness();
			this.getHospitals();
		},
		mounted(){
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
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
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				this.config = scope.row;
        if(this.$refs["config"]){
          this.$refs["config"].clearValidate();
        }
			},
			add(formName){
				var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
						this.loading = true;
            this.jquery('/iae/hospitalbusinessconfig/editBuninessConfig',{
							hb_config_id:_self.config.hb_config_id,
							hb_start_time:_self.config.hb_start_time,
							hb_start_money:_self.config.hb_start_money,
							hb_fixed_rate:_self.config.hb_fixed_rate,
							hb_floating_rate:_self.config.hb_floating_rate,
							hb_business_id:_self.config.business_id,
							hb_hospital_id:_self.config.hospital_id
						},function(res){
              _self.$message({showClose: true,message: '保存成功',type: 'success'});
              _self.loading = false;
              _self.dialogFormVisible = false;
            });
          } else {
            return false;
          }
        });
			},
			getBusinessList(){
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
        this.jquery('/iae/hospitalbusinessconfig/getBuninessConfig',{
					data:_self.params,
          page:page
        },function(res){
            _self.businessList = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getBusinessList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getBusinessList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getBusinessList();
    	}
		}
	})
</script>
<style>

</style>
