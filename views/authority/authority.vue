<template>
  <div class="authority_div">
    <el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item>系统管理</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
		</el-breadcrumb>
    <div class="authority_content" :style="{height:height+'px'}">
      <div class="custom-tree-container">
        <div class="block">
          <el-tree :data="data" node-key="id" ref="tree" @node-click="nodeClick" :expand-on-click-node="false">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <span>
                <el-button type="text" v-dbClick v-show="data.authority_type != 3 && authCode.indexOf('7') > -1" icon='el-icon-circle-plus' size="mini" @click.stop="() => append(data)"></el-button>
                <el-button type="text" v-dbClick v-show="authCode.indexOf('9') > -1" icon='el-icon-delete' size="mini" @click.stop="() => remove(node, data)"></el-button>
              </span>
            </span>
          </el-tree>
        </div>
      </div>
      <div class="authority_form" :style="{height:height+'px',width:formWidth+'px'}">
        <el-form :model="authorityData" :rules="rules" ref="authorityData" label-width="100px" class="demo-ruleForm">
          <el-form-item label="权限名称" prop="authority_name">
            <el-input v-model="authorityData.authority_name" maxlength='20'></el-input>
          </el-form-item>
          <el-form-item label="权限类型" prop="authority_type">
            <el-radio v-model="authorityData.authority_type" label="1">显示菜单</el-radio>
            <el-radio v-model="authorityData.authority_type" label="2">功能菜单</el-radio>
            <el-radio v-model="authorityData.authority_type" label="3">按钮</el-radio>
          </el-form-item>
          <el-form-item label="按钮类型" prop="button_type" v-show="authorityData.authority_type == 3">
            <el-radio v-model="authorityData.button_type" label="6">查询</el-radio>
            <el-radio v-model="authorityData.button_type" label="1">增加</el-radio>
            <el-radio v-model="authorityData.button_type" label="2">删除</el-radio>
            <el-radio v-model="authorityData.button_type" label="3">修改</el-radio>
            <el-radio v-model="authorityData.button_type" label="4">权限控制</el-radio>
            <el-radio v-model="authorityData.button_type" label="5">导出</el-radio>
          </el-form-item>
          <el-form-item label="菜单路径" prop="authority_path" v-show="authorityData.authority_type == 2">
            <el-input v-model="authorityData.authority_path" maxlength='50'></el-input>
          </el-form-item>
          <el-form-item label="权限编码" prop="authority_code">
            <el-input v-model="authorityData.authority_code" maxlength='20'></el-input>
          </el-form-item>
          <el-form-item label="是否开放" prop="authority_open">
            <el-switch v-model="authorityData.authority_open" active-value="1" inactive-value="0"></el-switch>
          </el-form-item>
          <el-form-item label="权限描述" prop="authority_describe">
            <el-input v-model="authorityData.authority_describe" maxlength='100'></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-dbClick size="mini" :loading="loading" v-show="authCode.indexOf('8') > -1" @click="submitForm('authorityData')">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        loading:false,
        height:0,
        formWidth:0,
        authCode:"",
        authorityData:{
          authority_name:'',
          authority_describe:'',
          authority_code:'',
          authority_path:'/',
          authority_open:'1',
          authority_type:'1',
          button_type:'1'
        },
        rules: {
          authority_name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
          authority_path: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
          authority_code: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }]
        },
        data:null
      }
    },
    activated(){
      this.getAuthoritys();
    },
    mounted(){
      this.height = $(window).height() - 105;
      this.formWidth = $(window).width()-301;
			var that = this;
			$(window).resize(function(){
					that.height = $(window).height() - 105;
          that.formWidth = $(window).width()-301;
			});
      this.authCode = JSON.parse(sessionStorage["user"]).authority_code;
    },
    methods: {
      nodeClick(data,node,com){
        var that = this;
        this.authorityData = data;
        var _self = this;
				setTimeout(function(){
					_self.$refs["authorityData"].clearValidate();
				});
      },
      getAuthoritys(){
        var _self = this;
        this.jquery('/iae/authority/getAuthoritys',null,function(res){
          _self.data = res.message;
        });
      },
      append(data) {
        const newChild = {
          label: '权限',
          authority_name:'权限',
          authority_describe:'',
          authority_code:'',
          authority_path:'/',
          authority_type:'1',
          button_type:'1',
          authority_open:'1',
          authority_parent_id:data.authority_id
        };
        var _self = this;
        this.jquery('/iae/authority/saveAuthoritys',newChild,function(res){
          newChild.id = res.message.insertId;
          newChild.authority_id = res.message.insertId;
          data.children.push(newChild);
        });
      },
      remove(node, data) {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      },
      submitForm(formName) {
        var _self = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true;
            this.jquery('/iae/authority/editAuthoritys',this.authorityData,function(res){
              _self.authorityData.label =  _self.authorityData.authority_name;
              _self.loading = false;
              _self.$message({showClose: true,message: '修改成功',type: 'success'});
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    }
  };
</script>
<style scoped="scoped">
  .authority_div{
    height: 100%;
  }
  .authority_content > div{
    display: inline-block;
    vertical-align: top;
  }
  .authority_content{
    font-size: 0px;
  }
  .authority_form{
    background: #fff;
    padding-top: 30px;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .authority_form > form{
    width: 650px;
  }
  .custom-tree-container{
    background: #fff;
    border-right: 1px solid #eff2f6;
    width: 280px;
    height: 100%;
    padding-top: 10px;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
