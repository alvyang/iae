<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>积分管理</el-breadcrumb-item>
			<el-breadcrumb-item>销往单位销售政策管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
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
			<el-form-item label="单位类型" prop="hospital_type">
				<el-select v-model="params.hospital_type" style="width:210px;" size="mini" placeholder="请选择">
					<el-option key="销售单位" label="销售单位" value="销售单位"></el-option>
					<el-option key="调货单位" label="调货单位" value="调货单位"></el-option>
				</el-select>
		  </el-form-item>
			<el-form-item label="业务员" prop="contactId">
        <el-select v-model="params.contactId" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option v-for="item in contacts"
            :key="item.contacts_id"
            :label="item.contacts_name"
            :value="item.contacts_id">
          </el-option>
        </el-select>
      </el-form-item>
			<el-form-item label="是否维护政策" prop="hospitalSaleFlag">
        <el-select v-model="params.hospitalSaleFlag" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="是" label="是" value="是"></el-option>
					<el-option key="否" label="否" value="否"></el-option>
        </el-select>
      </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',180,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',180,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		  </el-form-item>
		</el-form>
		<div class="allot_policy">
      <el-button @click.native.prevent="editBatchRow()" v-dbClick v-show="authCode.indexOf(',181,') > -1" type="primary" size="mini">批量修改</el-button>
    </div>
		<el-table :data="hospitalSalePolicys" style="width: 100%" :height="tableHeight" size="mini" :stripe="true"
			@selection-change="selectionChange">
			<el-table-column type="selection" width="55"></el-table-column>
			<el-table-column prop="hospital_name" label="医院名称" width="200px"></el-table-column>
			<el-table-column prop="hospital_type" label="医院类型" width="150px;"></el-table-column>
			<el-table-column prop="contacts_name" label="业务员" width="100px"></el-table-column>
			<el-table-column prop="policy_percent" label="政策点数" width="100px"></el-table-column>
			<el-table-column prop="hospital_sale_policy" label="政策公式" :formatter="formatterFormula"></el-table-column>
			<el-table-column prop="hospital_sale_policy_remark" label="备注" width="150px"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
	    <template slot-scope="scope">
        <el-button v-show="authCode.indexOf(',181,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
	      layout="total, sizes, prev, pager, next, jumper"
	      :total="count">
	    </el-pagination>
		</div>
		<el-dialog title="修改销售政策" width="500px" :visible.sync="dialogFormVisible">
			<el-form :model="hospitalSalePolicy" status-icon :rules="hospitalSalePolicyRule" style="margin-top:20px;text-align:left;" :height="tableHeight" :inline="true" ref="hospitalSalePolicy" label-width="100px" class="demo-ruleForm">
				<el-form-item label="政策公式" prop="hospital_sale_policy">
					<el-select v-model="hospitalSalePolicy.hospital_sale_policy" style="width:279px;" placeholder="请选择">
						<el-option key="" label="" value=""></el-option>
						<el-option key="1" label="中标价*政策点数" value="1"></el-option>
						<el-option key="2" label="中标价*政策点数-补点/费用票" value="2"></el-option>
						<el-option key="3" label="实收上游积分或上游政策积分*政策点数" value="3"></el-option>
						<el-option key="4" label="实收上游积分或上游政策积分*政策点数-补点/费用票" value="4"></el-option>
						<el-option key="5" label="实收上游积分或上游政策积分-中标价*政策点数" value="5"></el-option>
						<el-option key="6" label="实收上游积分或上游政策积分-中标价*政策点数-补点/费用票" value="6"></el-option>
						<el-option key="7" label="实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分" value="7"></el-option>
						<el-option key="9" label="实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.03-补点/费用票:实收上游积分-补点/费用票" value="9"></el-option>
						<el-option key="10" label="实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.05-补点/费用票:实收上游积分-补点/费用票" value="10"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="政策点数" prop="policy_percent" :maxlength="10">
 				 <el-input v-model="hospitalSalePolicy.policy_percent" style="width:279px;" placeholder="政策点数（如：60）"></el-input>
 			  </el-form-item>
				<el-form-item label="业务员" prop="hospital_sale_contacts_id">
				 <el-select v-model="hospitalSalePolicy.hospital_sale_contacts_id" style="width:279px;" filterable placeholder="请选择">
					 <el-option key="" label="" value=""></el-option>
					 <el-option v-for="item in contacts"
						 :key="item.contacts_id"
						 :label="item.contacts_name"
						 :value="item.contacts_id">
					 </el-option>
				 </el-select>
			 </el-form-item>
			 <el-form-item label="备注" prop="hospital_sale_policy_remark">
				 <el-input v-model="hospitalSalePolicy.hospital_sale_policy_remark" style="width:279px;" placeholder="积分备注"></el-input>
			 </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
				<el-button type="primary" size="small" v-dbClick :loading="loading" @click="editHospitalSalePolicy('hospitalSalePolicy')">确 定</el-button>
			</div>
		</el-dialog>
		<el-dialog title="批量修改销售政策" width="500px" :visible.sync="dialogFormVisibleBatch">
			<el-form :model="hospitalSalePolicy" status-icon :rules="hospitalSalePolicyRule" style="margin-top:20px;text-align:left;" :height="tableHeight" :inline="true" ref="hospitalSalePolicy" label-width="100px" class="demo-ruleForm">
				<el-form-item label="政策公式" prop="hospital_sale_policy">
					<el-select v-model="hospitalSalePolicy.hospital_sale_policy" style="width:279px;" placeholder="请选择">
						<el-option key="" label="" value=""></el-option>
						<el-option key="1" label="中标价*政策点数" value="1"></el-option>
						<el-option key="2" label="中标价*政策点数-补点/费用票" value="2"></el-option>
						<el-option key="3" label="实收上游积分或上游政策积分*政策点数" value="3"></el-option>
						<el-option key="4" label="实收上游积分或上游政策积分*政策点数-补点/费用票" value="4"></el-option>
						<el-option key="5" label="实收上游积分或上游政策积分-中标价*政策点数" value="5"></el-option>
						<el-option key="6" label="实收上游积分或上游政策积分-中标价*政策点数-补点/费用票" value="6"></el-option>
						<el-option key="7" label="实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分" value="7"></el-option>
						<el-option key="9" label="实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.03-补点/费用票:实收上游积分-补点/费用票" value="9"></el-option>
						<el-option key="10" label="实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.05-补点/费用票:实收上游积分-补点/费用票" value="10"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="政策点数" prop="policy_percent" :maxlength="10">
 				 <el-input v-model="hospitalSalePolicy.policy_percent" style="width:279px;" placeholder="政策点数（如：60）"></el-input>
 			  </el-form-item>
				<el-form-item label="业务员" prop="hospital_sale_contacts_id">
				 <el-select v-model="hospitalSalePolicy.hospital_sale_contacts_id" style="width:279px;" filterable placeholder="请选择">
					 <el-option key="" label="" value=""></el-option>
					 <el-option v-for="item in contacts"
						 :key="item.contacts_id"
						 :label="item.contacts_name"
						 :value="item.contacts_id">
					 </el-option>
				 </el-select>
			 </el-form-item>
			 <el-form-item label="备注" prop="hospital_sale_policy_remark">
				 <el-input v-model="hospitalSalePolicy.hospital_sale_policy_remark" style="width:279px;" placeholder="积分备注"></el-input>
			 </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" v-dbClick @click="dialogFormVisibleBatch = false">取 消</el-button>
				<el-button type="primary" size="small" v-dbClick :loading="loading" @click="editBatchHospitalSalePolicy('hospitalSalePolicy')">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validateBatchPercent = (rule, value, callback) => {
				if(!value){
					callback(new Error('请再输入政策点数'));
				}else if (value && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
					callback(new Error('请输入正确的政策点数'));
				} else {
					callback();
				}
			};
			return {
				title:1,
				dialogFormVisible:false,
				dialogFormVisibleBatch:false,
				loading:false,
				authCode:"",
				hospitals:[],
				hospitalSalePolicys:[],
				hospitalSalePolicy:{
					hospital_sale_policy:"",
					hospital_sale_contacts_id:"",
					policy_percent:"",
					hospital_sale_policy_remark:"",
				},
				hospitalSalePolicyRule:{
					policy_percent:[{validator:validateBatchPercent,trigger: 'blur' }],
					hospital_sale_policy:[{required:true,message: '请选择政策公式',trigger: 'change' }],
				},
				contacts:[],
				hospitalIds:[],
				pageNum:20,
				currentPage:1,
				count:0,
				params:{
					hospitalsId:"",
					hospital_type:"",
					contactId:"",
					hospitalSaleFlag:"",
				},
				tableHeight:0,
			}
		},
		updated(){
			this.tableHeight = $(window).height() - 220 - $(".search").height();
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 220 - $(".search").height();
			});
    },
		activated(){
			this.getHospitals();
			this.getContacts();
			this.getHospitalSalePolicyList();
		},
		mounted(){
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
			editBatchRow(){
        if(this.hospitalIds.length > 0){
						this.hospitalSalePolicy={
							hospital_sale_policy:"",
							hospital_sale_contacts_id:""
						}
            this.dialogFormVisibleBatch = true;
        }
      },
			selectionChange(val){
        this.hospitalIds = [];
        for(var i = 0 ; i < val.length ;i++){
          this.hospitalIds.push(val[i].hospital_id);
        }
      },
			formatterFormula(row, column, cellValue, index){
        var message = "";
        switch (cellValue) {
          case "1":
            message = "中标价*政策点数";
            break;
          case "2":
            message = "中标价*政策点数-补点/费用票";
            break;
          case "3":
            message = "实收上游积分或上游政策积分*政策点数";
            break;
          case "4":
            message = "实收上游积分或上游政策积分*政策点数-补点/费用票";
            break;
          case "5":
            message = "实收上游积分或上游政策积分-中标价*政策点数";
            break;
          case "6":
            message = "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票";
            break;
          case "7":
            message = "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分";
            break;
          case "8":
            message = "固定政策（上游政策修改后，需几时调整下游政策）";
            break;
          case "9":
            message = "实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.03-补点/费用票:实收上游积分-补点/费用票";
            break;
          case "10":
            message = "实收上游积分或上游政策积分>中标价*政策点数?实收上游积分-中标价*0.05-补点/费用票:实收上游积分-补点/费用票";
            break;
          default:

        }
        return message;
      },
			getHospitals(){
				var _self = this;
				this.jquery('/iae/hospitals/getAllHospitals',{hospital_type:''},function(res){
						_self.hospitals = res.message;
				});
			},
			getContacts(){
	      var _self = this;
	      this.jquery('/iae/contacts/getAllContacts',{group_id:0,contact_type:['业务员','调货']},function(res){
	        _self.contacts = res.message;
	      });
	    },
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				var temp = JSON.stringify(scope.row);
        this.hospitalSalePolicy = JSON.parse(temp);
				this.hospitalSalePolicy.front_message = temp;
				var _self = this;
				setTimeout(function(){
					_self.$refs["contact"].clearValidate();
				});
			},
			editHospitalSalePolicy(formName){
				var _self = this;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/hospitalSalePolicy/editHospitalSalePolicy',_self.hospitalSalePolicy,function(res){
								_self.dialogFormVisible = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getHospitalSalePolicyList();
							});
						} else {
							return false;
						}
				});
			},
			editBatchHospitalSalePolicy(formName){
				var _self = this;
				_self.hospitalSalePolicy.hospitalIds = this.hospitalIds;
				this.$refs[formName].validate((valid) => {
						if (valid) {
							this.loading = true;
							_self.jquery('/iae/hospitalSalePolicy/editBatchHospitalSalePolicy',_self.hospitalSalePolicy,function(res){
								_self.dialogFormVisibleBatch = false;
								_self.loading = false;
								_self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.getHospitalSalePolicyList();
							});
						} else {
							return false;
						}
				});
			},
			searchContactsList(){
				this.currentPage = 1;
				this.getHospitalSalePolicyList();
			},
			getHospitalSalePolicyList(){
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
        this.jquery('/iae/hospitalSalePolicy/getHospitalSalePolicy',{
					data:_self.params,
          page:page
        },function(res){
            _self.hospitalSalePolicys = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getHospitalSalePolicyList();
			},
			handleSizeChange(val) {
    		this.currentPage = 1;
        this.getHospitalSalePolicyList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getHospitalSalePolicyList();
    	}
		}
	})
</script>
<style>

</style>
