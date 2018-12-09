<template>
  <div>
    <el-tag
      :key="tag"
      v-for="tag in dynamicTags"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)">
      {{tag}}
    </el-tag>

    <el-cascader
      v-if="inputVisible"
      v-model="inputValue"
      placeholder="搜索标签"
      size="small"
      :options="tags"
      @change="handleInputConfirm"
      filterable></el-cascader>
    <el-button v-else class="button-new-tag" size="small" @click="showInput">选择标签</el-button>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        tags:[],
        dynamicTags: [],
        dynamicTagIds:[],
        inputVisible: false,
        inputValue: []
      };
    },
    props:['tag_ids'],
    mounted(){
      this.dynamicTags=[];
      this.dynamicTagIds=this.tag_ids?this.tag_ids.split(","):[];
      this.inputVisible=false;
      this.inputValue=[];
      this.getTags();
    },
    methods: {
      getTags(){
        var _self = this;
				this.jquery("/iae/tag/getAllTags",{tag_ids:_self.tag_ids},function(res){//查询添加过的生产企业
					_self.tags = res.message.tagAll;
          _self.dynamicTags = res.message.tag;
				});
      },
      handleClose(tag) {
        //下拉列表设置为不可选
        for(var i = 0 ; i < this.tags.length;i++){
          for(var j = 0 ; j < this.tags[i].children.length;j++){
            if(this.tags[i].children[j].label == tag){
              this.tags[i].children[j].disabled = false;
              this.dynamicTagIds.splice(this.dynamicTagIds.indexOf(this.tags[i].children[j].value+""), 1);
              break;
            }
          }
        }
        this.$emit('emitTagIds',this.dynamicTagIds.join(","));
        this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
      },
      showInput() {
        this.inputVisible = true;
      },
      handleInputConfirm(val) {
        let inputValue = this.inputValue;
        if (inputValue) {
          //下拉列表设置为不可选
          for(var i = 0 ; i < this.tags.length;i++){
            for(var j = 0 ; j < this.tags[i].children.length;j++){
              if(this.tags[i].children[j].value == inputValue[1]){
                this.tags[i].children[j].disabled = true;
                this.dynamicTagIds.push(inputValue[1]);
                this.dynamicTags.push(this.tags[i].children[j].label);
                break;
              }
            }
          }

        }
        this.inputVisible = false;
        this.$emit('emitTagIds',this.dynamicTagIds.join(","));
        this.inputValue = [];
      }
    }
  }
</script>
<style scoped="scoped">
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
