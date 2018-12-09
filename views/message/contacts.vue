<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>信息管理</el-breadcrumb-item>
			<el-breadcrumb-item>联系人管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="联系人" prop="contacts_name">
		    <el-input v-model="params.contacts_name" @keyup.13.native="reSearch(false)" style="width:210px;" size="mini" placeholder="联系人"></el-input>
		  </el-form-item>
			<el-form-item label="联系人类型" prop="contact_type">
				<el-select v-model="params.contact_type" style="width:210px;" filterable size="mini" placeholder="请选择">
					<el-option key="" label="全部" value=""></el-option>
					<el-option key="佣金品种" label="佣金品种" value="佣金品种"></el-option>
					<el-option key="高打品种" label="高打品种" value="高打品种"></el-option>
					<el-option key="调货" label="调货" value="调货"></el-option>
					<el-option key="业务员" label="业务员" value="业务员"></el-option>
				</el-select>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('35') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf('35') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf('32') > -1" @click="addShow" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="contacts" style="width: 100%" size="mini" :stripe="true">
			<el-table-column prop="contacts_name" label="联系人"></el-table-column>
			<el-table-column prop="contact_type" label="联系人类型"></el-table-column>
			<el-table-column prop="contacts_phone" label="电话"></el-table-column>
			<el-table-column prop="account_name" label="持卡人姓名"></el-table-column>
			<el-table-column prop="account_number" label="收款卡号"></el-table-column>
			<el-table-column prop="account_address" label="开户行"></el-table-column>
			<el-table-column prop="contact_remark" label="备注"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
	    <template slot-scope="scope">
		    <el-button v-show="authCode.indexOf('34') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
        <el-button v-show="authCode.indexOf('33') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog :title="title == 1?'新增联系人':'修改联系人'" width="600px" :visible.sync="dialogFormVisible">
			<el-form :model="contact" status-icon :rules="contactsRule" ref="contact" :inline="true" label-width="90px" class="demo-ruleForm">
				<el-form-item label="联系人类型" prop="contact_type">
					<el-checkbox-group v-model="contact.contact_type">
						<el-checkbox label="佣金品种"></el-checkbox>
						<el-checkbox label="高打品种"></el-checkbox>
				    <el-checkbox label="调货"></el-checkbox>
						<el-checkbox label="业务员"></el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item label="联系人" prop="contacts_name">
					<el-input v-model="contact.contacts_name" style="width:175px;" auto-complete="off" :maxlength="20" placeholder="请输入联系人姓名"></el-input>
				</el-form-item>
				<el-form-item label="手机号码" prop="contacts_phone">
					<el-input v-model="contact.contacts_phone" style="width:175px;" auto-complete="off" :maxlength="11" placeholder="请输入联系人手机号码"></el-input>
				</el-form-item>
				<el-form-item label="持卡人姓名" prop="account_name">
					<el-input v-model="contact.account_name" style="width:175px;" auto-complete="off" :maxlength="20" placeholder="请输入持卡人姓名"></el-input>
				</el-form-item>
				<el-form-item label="收款卡号" prop="account_number">
					<el-input v-model="contact.account_number" style="width:175px;" auto-complete="off" :maxlength="11" placeholder="请输入收款卡号"></el-input>
				</el-form-item>
				<el-form-item label="开户行" prop="account_address">
					<el-input v-model="contact.account_address" style="width:453px;" auto-complete="off" :maxlength="20" placeholder="请输入开户行"></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="contact_remark">
					<el-input v-model="contact.contact_remark" style="width:453px;" auto-complete="off" :maxlength="500" placeholder="请输入备注"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="add('contact')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validatePhone = (rule, value, callback) => {
        if (value && !/^1[3|4|5|7|8][0-9]{9}$/.test(value)) {
          	callback(new Error('请再输入正确的手机号码'));
        } else {
         	callback();
        }
    	};
			return {
				title:1,
				dialogFormVisible:false,
				loading:false,
				authCode:"",
				contact:{
					contacts_name:"",
					contacts_phone:"",
					contact_remark:"",
					account_name:"",
					account_number:"",
					account_address:"",
					contact_type:['佣金品种'],
				},
				contactsRule:{
					contacts_name:[{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
					contacts_phone:[{ validator: validatePhone, trigger: 'blur' }],
				},
				contacts:[],
				pageNum:10,
				currentPage:1,
				count:0,
				params:{
					contacts_name:""
				}
			}
		},
		activated(){
			this.getContactsList();
		},
		mounted(){
			this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        this.title=2;
        this.contact = scope.row;
				this.contact.contact_type = this.contact.contact_type?this.contact.contact_type.split(","):[];
				var _self = this;
				setTimeout(function(){
					_self.$refs["contact"].clearValidate();
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
        this.jquery('/iae/contacts/deleteContacts',{
          contacts_id:scope.row.contacts_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.getContactsList();
          _self.dialogFormVisible = false;
        });
			},
			addShow(){
				this.contact={
					contacts_name:"",
					contacts_phone:"",
					contact_remark:"",
					account_name:"",
					account_number:"",
					account_address:"",
					contact_type:['佣金品种'],
				};
				this.title=1;
				this.dialogFormVisible = true;
			},
			add(formName){
				var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
						this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/contacts/saveContacts',_self.contact,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getContactsList();
              });
            }else{
              this.jquery('/iae/contacts/editContacts',_self.contact,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
              });
            }
          } else {
            return false;
          }
        });
			},
			searchContactsList(){
				this.currentPage = 1;
				this.getContactsList();
			},
			getContactsList(){
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
        this.jquery('/iae/contacts/getContacts',{
					data:_self.params,
          page:page
        },function(res){
            _self.contacts = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getContactsList();
			},
			handleSizeChange(val) {
    		this.currentPage = 1;
        this.getContactsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getContactsList();
    	}
		}
	})
</script>
<style>

</style>
