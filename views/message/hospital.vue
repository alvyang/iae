<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>信息管理</el-breadcrumb-item>
			<el-breadcrumb-item>销往单位管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="单位名称" prop="hospital_name">
		    <el-input v-model="params.hospital_name" @keyup.13.native="reSearch(false)" style="width:210px;" size="mini" placeholder="销往单位"></el-input>
		  </el-form-item>
			<el-form-item label="单位类型" prop="hospital_type">
				<el-select v-model="params.hospital_type" style="width:210px;" size="mini" placeholder="请选择">
					<el-option key="销售单位" label="销售单位" value="销售单位"></el-option>
					<el-option key="调货单位" label="调货单位" value="调货单位"></el-option>
				</el-select>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',31,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',31,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',28,') > -1" @click="addShow" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="hospitals" style="width: 100%" size="mini" :stripe="true">
			<el-table-column prop="hospital_name" label="单位名称"></el-table-column>
			<el-table-column prop="hospital_type" label="单位类型"></el-table-column>
			<el-table-column prop="hospital_address" label="单位地址"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
		    <template slot-scope="scope">
			    <el-button v-dbClick v-show="authCode.indexOf(',29,') > -1" @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
         	<el-button v-dbClick v-show="authCode.indexOf(',30,') > -1" @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog :title="title == 1?'新增单位':'修改单位'" width="500px" :visible.sync="dialogFormVisible">
			<el-form :model="hospital" status-icon :rules="hospitalRule" ref="hospital" label-width="80px" class="demo-ruleForm">
				<el-form-item label="单位类型" prop="hospital_type">
					<el-checkbox-group v-model="hospital.hospital_type">
						<el-checkbox label="销售单位">销售单位</el-checkbox>
						<el-checkbox label="调货单位">调货单位</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item label="单位名称" prop="hospital_name">
					<el-input v-model="hospital.hospital_name" auto-complete="off" style="width:350px;" :maxlength="50" placeholder="请输入销售机构名称"></el-input>
				</el-form-item>
				<el-form-item label="单位地址" prop="hospital_address">
					<el-input v-model="hospital.hospital_address" auto-complete="off" style="width:350px;" :maxlength="100" placeholder="请输入机构地址"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick :loading="loading" size="small" @click="add('hospital')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
			var validateName = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请再输入单位名称'));
        } else {
					if(this.title == 1){
						this.jquery("/iae/hospitals/exitsHospitlsName",{hospital:this.hospital},function(res){
							if(res.message.length > 0){
								callback(new Error('该单位名称已存在'));
							}else{
								callback();
							}
						});
					}else{
						callback();
					}
        }
    	};
			return {
				dialogFormVisible:false,
				hospital:{
					hospital_name:"",
					hospital_address:"",
					hospital_type:["销售单位"]
				},
				hospitalRule:{
					hospital_name:[{ validator: validateName,labelname:'单位名称', trigger: 'blur' }],
				},
				title:1,
				authCode:"",
				loading:false,
				hospitals:[],
				pageNum:10,
				currentPage:1,
				count:0,
				deleteId:null,
				params:{
					hospital_name:"",
					hospital_type:""
				}
			}
		},
		activated(){
			this.getHospitalsList();
		},
		mounted(){
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
				this.title=2;
				var temp = JSON.stringify(scope.row);
				this.hospital = JSON.parse(temp);
				this.hospital.front_message = temp;
				this.hospital.hospital_type = this.hospital.hospital_type?this.hospital.hospital_type.split(","):[];
				var _self = this;
				setTimeout(function(){
					_self.$refs["hospital"].clearValidate();
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
				this.jquery('/iae/hospitals/deleteHospitals',{
					hospital_id:scope.row.hospital_id
				},function(res){
					_self.$message({showClose: true,message: '删除成功',type: 'success'});
					_self.getHospitalsList();
					_self.dialogFormVisible = false;
				});
			},
			addShow(){
				this.hospital={
					hospital_name:"",
					hospital_address:"",
					hospital_type:["销售单位"]
				};
				this.title=1;
				this.dialogFormVisible = true;
				var _self = this;
				setTimeout(function(){
					_self.$refs["hospital"].clearValidate();
				});
			},
			add(formName){
				var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
						this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/hospitals/saveHospitals',_self.hospital,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getHospitalsList();
              });
            }else{
              this.jquery('/iae/hospitals/editHospitals',_self.hospital,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
								_self.loading = false;
                _self.dialogFormVisible = false;
								_self.getHospitalsList();
              });
            }
          } else {
            return false;
          }
        });
			},
			searchHospitalsList(){
				this.currentPage = 1;
				this.getHospitalsList();
			},
			getHospitalsList(){
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
        this.jquery('/iae/hospitals/getHospitals',{
					data:_self.params,
          page:page
        },function(res){
            _self.hospitals = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getHospitalsList();
			},
			handleSizeChange(val) {
        this.pageNum = val;
    		this.currentPage = 1;
        this.getHospitalsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getHospitalsList();
    	}
		}
	})
</script>
<style>

</style>
