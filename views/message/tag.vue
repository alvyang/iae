<template>
	<div style="box-sizing: border-box;padding: 0px 10px;">
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>信息管理</el-breadcrumb-item>
			<el-breadcrumb-item>标签管理</el-breadcrumb-item>
		</el-breadcrumb>
		<el-form :inline="true" :model="params" ref="params" size="mini" class="demo-form-inline search">
		  <el-form-item label="标签名称" prop="tag_name">
		    <el-input v-model="params.tag_name" @keyup.13.native="reSearch(false)" style="width:210px;" size="mini" placeholder="标签名称"></el-input>
		  </el-form-item>
			<el-form-item label="标签类型" prop="tag_type">
				<el-select v-model="params.tag_type" style="width:210px;" placeholder="请选择">
					<el-option key="" label="请选择" value=""></el-option>
					<el-option key="1" label="医院科室" value="1"></el-option>
					<el-option key="2" label="药品分类" value="2"></el-option>
					<el-option key="0" label="运营方式" value="0"></el-option>
					<el-option key="3" label="其它" value="3"></el-option>
				</el-select>
			</el-form-item>
		  <el-form-item>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',94,') > -1" @click="reSearch(false)" size="mini">查询</el-button>
				<el-button type="primary" v-dbClick v-show="authCode.indexOf(',94,') > -1" @click="reSearch(true)" size="mini">重置</el-button>
		    <el-button type="primary" v-dbClick v-show="authCode.indexOf(',97,') > -1" @click="addShow" size="mini">新增</el-button>
		  </el-form-item>
		</el-form>
		<el-table :data="tags" style="width: 100%" size="mini" :height="tableHeight"  :stripe="true">
			<el-table-column prop="tag_name" label="标签名称"></el-table-column>
			<el-table-column prop="tag_type" label="标签类型" :formatter="formatTagType"></el-table-column>
			<el-table-column prop="tag_quote_num" label="引用次数"></el-table-column>
			<el-table-column fixed="right" label="操作" width="100">
	    <template slot-scope="scope">
		    <el-button v-show="authCode.indexOf(',96,') > -1" v-dbClick @click.native.prevent="deleteRow(scope)" icon="el-icon-delete" type="primary" size="mini"></el-button>
        <el-button v-show="authCode.indexOf(',95,') > -1" v-dbClick @click.native.prevent="editRow(scope)" icon="el-icon-edit-outline" type="primary" size="mini"></el-button>
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
		<el-dialog :title="title == 1?'新增标签':'修改标签'" width="500px" :visible.sync="dialogFormVisible">
			<el-form :model="tag" status-icon :rules="tagRule" ref="tag" label-width="90px" class="demo-ruleForm">
				<el-form-item label="标签类型" prop="tag_type">
					<el-select v-model="tag.tag_type" style="width:350px;" placeholder="请选择">
				    <el-option key="" label="请选择" value=""></el-option>
						<el-option key="1" label="医院科室" value="1"></el-option>
						<el-option key="2" label="药品分类" value="2"></el-option>
						<el-option key="0" label="运营方式" value="0"></el-option>
						<el-option key="3" label="其它" value="3"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="标签名称" prop="tag_name">
					<el-input v-model="tag.tag_name" style="width:350px;" auto-complete="off" :maxlength="20" placeholder="请输入标签名称"></el-input>
				</el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" v-dbClick @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-dbClick size="small" :loading="loading" @click="add('tag')">确 定</el-button>
      </div>
    </el-dialog>
	</div>
</template>
<script>
	export default({
		data(){
      var validateTag = (rule, value, callback) => {
				var _self = this;
        if (value === '') {
          callback(new Error('请输入标签名称'));
        } else {
					this.jquery('/iae/tag/exitsTag',_self.tag,function(res){
						if (_self.title == 1 && res.message.length > 0) {
		          callback(new Error('该标签已存在'));
		        } else {
		          callback();
		        }
					});
				}
      };
			return {
				title:1,
				dialogFormVisible:false,
				loading:false,
				authCode:"",
				tag:{
					tag_name:"",
					tag_type:""
				},
				tagRule:{
					tag_name:[{validator: validateTag, trigger: 'blur' }],
					tag_type:[{ required: true, message: '请选择标签类型', trigger: 'change' }],
				},
				tags:[],
				pageNum:20,
				currentPage:1,
				count:0,
				params:{
					tag_name:"",
					tag_type:""
				},
				tableHeight:0,
			}
		},
		updated(){
			this.tableHeight = $(window).height() - 170 - $(".search").height();
			var that = this;
      $(window).resize(function(){
					that.tableHeight = $(window).height() - 170 - $(".search").height();
			});
    },
		activated(){
			this.getTagsList();
		},
		mounted(){
			this.authCode = ","+JSON.parse(sessionStorage["user"]).authority_code;
		},
		methods:{
			formatTagType(row, column, cellValue, index){
				if(cellValue == "0"){
					return "运营方式";
				}else if(cellValue == "1"){
					return "医院科室";
				}else if(cellValue == "2"){
					return "药品分类";
				}else if(cellValue == "3"){
					return "其它";
				}
			},
			editRow(scope){//编辑药品信息
				this.dialogFormVisible = true;
        this.title=2;
				var temp = JSON.stringify(scope.row);
        this.tag = JSON.parse(temp);
				this.tag.front_message = temp;
				var _self = this;
				setTimeout(function(){
					_self.$refs["tag"].clearValidate();
				});
			},
			deleteRow(scope){
				if(scope.row.tag_quote_num == "0"){
					this.$confirm('是否删除?', '提示', {
	        	confirmButtonText: '确定',
	        	cancelButtonText: '取消',
	        	type: 'warning'
	      	}).then(() => {
						this.deleteItem(scope);
	      	}).catch(() => {
	      	});
				}else{
					this.$alert('引用数据大于0，不可删除', '提示', {
	          confirmButtonText: '确定',
	          callback: action => {

	          }
	        });
				}
			},
			deleteItem(scope){
				var _self = this;
        this.jquery('/iae/tag/deleteTag',{
          tag_id:scope.row.tag_id
        },function(res){
          _self.$message({showClose: true,message: '删除成功',type: 'success'});
          _self.getTagsList();
          _self.dialogFormVisible = false;
        });
			},
			addShow(){
				this.tag={
					tag_name:"",
					tag_type:""
				};
				this.title=1;
				this.dialogFormVisible = true;
				var _self = this;
				setTimeout(function(){
					_self.$refs["tag"].clearValidate();
				});
			},
			add(formName){
				var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
						this.loading = true;
            if(this.title == 1){
              this.jquery('/iae/tag/saveTag',_self.tag,function(res){
                _self.$message({showClose: true,message: '新增成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getTagsList();
              });
            }else{
              this.jquery('/iae/tag/editTag',_self.tag,function(res){
                _self.$message({showClose: true,message: '修改成功',type: 'success'});
                _self.dialogFormVisible = false;
								_self.loading = false;
								_self.getTagsList();
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
			},
			searchContactsList(){
				this.currentPage = 1;
				this.getTagsList();
			},
			getTagsList(){
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
        this.jquery('/iae/tag/getTags',{
					data:_self.params,
          page:page
        },function(res){
            _self.tags = res.message.data;
            _self.pageNum=parseInt(res.message.limit);
    				_self.count=res.message.totalCount;
        });
			},
			reSearch(arg){
				if(arg){
					this.$refs["params"].resetFields();
				}
				this.currentPage = 1;
				this.getTagsList();
			},
			handleSizeChange(val) {
    		this.currentPage = 1;
				this.pageNum = val;
        this.getTagsList();
    	},
    	handleCurrentChange(val) {
    		this.currentPage = val;
				this.getTagsList();
    	}
		}
	})
</script>
<style>

</style>
