<template>
	<div>
		<div class="main_top">
			<el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" :router="routerFlag"
				@select="handleSelect"
			  background-color="#545c64"
			  text-color="#fff"
			  active-text-color="#ffd04b">
			  <!-- <el-menu-item index="/main/home">首页</el-menu-item> -->
				<template v-for="a in authList">
					<el-menu-item v-if="a.children.length == 0 || a.authority_type == '2'" :index="a.authority_path">{{a.authority_name}}</el-menu-item>
					<el-submenu v-else :index="a.authority_id+''">
						<template slot="title">{{a.authority_name}}</template>
						<el-menu-item v-for="sa in a.children"  :index="sa.authority_path">{{sa.authority_name}}</el-menu-item>
					</el-submenu>
				</template>
			</el-menu>
			<div class="login_out" v-show="username">
				<el-dropdown @command="handleCommand">
		      <span class="el-dropdown-link">
		       	<a style="position:relative;">
							<div style="text-align:right;display:inline-block;">
								{{username}}
							</div>
							<div class="time">
								有效日期：{{startTime}} 到 {{endTime}}
							</div>
						</a>
						<i class="el-icon-arrow-down el-icon--right"></i>
		      </span>
		      <el-dropdown-menu slot="dropdown">
		        <el-dropdown-item command="login_out">退出登陆</el-dropdown-item>
		        <el-dropdown-item command="modify_password">修改密码</el-dropdown-item>
		      </el-dropdown-menu>
		    </el-dropdown>
			</div>
		</div>
		<div style="height: 60px;"></div>
		<div class="main_content" :style="{height:height+'px'}">
			<keep-alive exclude="drugs_edit">
				<router-view class="view"></router-view>
			</keep-alive>
		</div>
	</div>
</template>
<script>
	export default({
		data(){
			return {
				activeIndex2:"/main/sales",
				routerFlag:true,
				username:"",
				startTime:"",
				endTime:"",
				height:0,
				authList:[]
			}
		},
		activated(){
			this.activeIndex2 = "/main/sales";
			this.getAuthorityList();
			var temp = JSON.parse(sessionStorage["user"]);
			this.startTime = new Date(temp.start_time).format("yyyy-MM-dd");
			this.endTime = new Date(temp.end_time).format("yyyy-MM-dd");
			this.username = temp.realname;
		},
		mounted(){
			this.height = $(window).height() - 60;
			var that = this;
			$(window).resize(function(){
					that.height = $(window).height() - 60;
			});
		},
		methods:{
			handleSelect(key, keyPath) {
				this.activeIndex2 = key;
      },
			getAuthorityList(){
				var _self = this;
				var user = JSON.parse(sessionStorage["user"])
				var authCode = user.authority_code;
				this.jquery('/iae/authority/getAuthoritysList',{
					authority_code:authCode,
				},function(res){
					_self.authList = res.message[0].children;
				});
			},
			handleCommand(command) {
				if(command == "login_out"){
					this.$router.push({path:"/login"});
				}else if(command == "modify_password"){
					this.$router.push({path:"/main/password"});
				}
      }
		}
	})
</script>
<style>
	.time{
		display: inline-block;
    position: absolute;
    right: 0px;
    width: 200px;
		text-align: right;
    top: -9px;
		right:4px;
    font-size: 9px;
	}
	.el-table--mini td{
		padding: 4px 0 !important;
	}
	.el-table__body .el-button--mini{
		padding: 4px 10px;
	}
	.login_out{
		position: fixed;
		float: right;
		top:0px;
		right: 0px;
		line-height: 61px;
		padding-right: 20px;
		color: #fff;
		text-decoration: none;
		cursor: pointer;
	}
	.login_out .el-dropdown{
		color: #fff;
		height: 40px;
	}
	.main_top{
		position: fixed;
		width: 100%;
		height: 60px;
		z-index: 10;
	}
	.view{
		background-color: #f4f4f4;
	}
	.main_content{
		padding: 10px;
		box-sizing: border-box;
	}
	/* .el-dialog__header{
		margin-bottom: 20px;
	} */
	.main_content .el-date-editor--daterange{
		width: 210px !important;
	}
	.main_content .el-date-editor--daterange > input{
		width: 37% !important;
	}
	.main_content .el-date-editor .el-range__close-icon{
		width: 13px !important;
	}
	.main_content .el-range-editor.el-input__inner{
		padding: 3px 5px !important;
	}
	.el-table .cell{
		white-space: nowrap;
	}
	.allot_policy{
    background-color: #fff;
    border-bottom: 1px solid #ebeef5;
    height: 30px;
    line-height: 30px;
    padding:10px 10px;
    font-size: 14px;
    color:#606266;
  }
	.el-dialog__body{
		padding-top: 0 !important;
		padding-bottom: 0 !important;
	}
	.main_content .import_record .el-dialog__body{
		padding-bottom:30px !important;
	}
	.el-collapse-item__content > div{
		display: inline-block;
		width: 30%;
	}
	.el-collapse-item__content > div > span{
		display: inline-block;
		width: 56px;
		text-align: right;
		padding-right: 10px;
	}
	.sum_money{
		background-color: #fff;
		border-bottom: 1px solid #ebeef5;
		height: 30px;
		line-height: 30px;
		padding-left: 10px;
		font-size: 14px;
		color:#606266;
	}
	.sum_money a{
		color: #f24040;
	}
</style>
