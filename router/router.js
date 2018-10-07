import Vue from "vue/dist/vue.js";
import VueRouter from "vue-router";
Vue.use(VueRouter);

import Login from "../views/login.vue";
//一级页面
import Main from "../views/main.vue";
import Home from "../views/home.vue";
//药品页面
import Drugs from "../views/drugs/drugs.vue";
import DrugsEdit from "../views/drugs/drugsEdit.vue";
//进货记录页面
import Purchase from "../views/purchase/purchase.vue";
import PurchaseDrugs from "../views/purchase/purchaseDrugs.vue";
// import PurchaseEdit from "../views/purchase/purchaseEdit.vue";
// import ReturnMoney from "../views/purchase/ReturnMoney.vue";
//调货记录页面
import Allot from "../views/allot/allot.vue";
import AllotDrugs from "../views/allot/allotDrugs.vue";
//销售记录页面
import Sales from "../views/sales/sales.vue";
import SalesDrugs from "../views/sales/salesDrugs.vue";
// import SalesEdit from "../views/sales/salesEdit.vue";
//销售渠道页面
import Hospital from "../views/message/hospital.vue";
//联系人页面
import Contacts from "../views/message/contacts.vue";
//商业
import Business from "../views/message/business.vue";
//标签管理
import Tag from "../views/message/tag.vue";
//银行账号管理
import Account from "../views/bank_account/account.vue";
import AccountDetail from "../views/bank_account/accountDetail.vue";
import BusinessCommission from "../views/bank_account/businesscommission.vue";
import ReturnMoney from "../views/bank_account/returnmoney.vue";
//标签管理
import Label from "../views/label/label.vue";
import LabelEdit from "../views/label/labelEdit.vue";
//权限管理
import Authority from "../views/authority/authority.vue";
import Role from "../views/authority/role.vue";
import Group from "../views/authority/group.vue";
import User from "../views/authority/user.vue";

//修改密码
import password from "../views/password.vue";

//报表管理
import Report from "../views/report/report.vue";
import ReportSaleLine from "../views/report/reportSaleLine.vue";//销售折现图
import ReportTagBar from "../views/report/reportTagBar.vue";//标签销售柱状图
//返款管理
import Refundsale from "../views/refunds/refundsale.vue";
import Refundpurchase from "../views/refunds/refundpurchase.vue";

//库存
import Stock from "../views/stock/stock.vue";

const router = new VueRouter({
	routes:[{
		path:"/",
		redirect:to => {
			return "/login";
		}
	},{
		path:"/login",
		component:Login,
	},{
		path:"/main",
		component:Main,
		children:[{path:"",redirect: 'sales'},
			{path:"home",component:Home},
			{path:"drugs",component:Drugs},
			{path:"drugsedit",component:DrugsEdit},
			{path:"authority",component:Authority},
			{path:"role",component:Role},
			{path:"user",component:User},
			{path:"group",component:Group},
			{path:"hospital",component:Hospital},//医院管理
			{path:"contacts",component:Contacts},//联系人管理
			{path:"business",component:Business},//商业管理
			{path:"tag",component:Tag},//标签管理
			{path:"account",component:Account},//银行账号管理
			{path:"accountdetail",component:AccountDetail},//流水账管理
			{path:"returnmoney",component:ReturnMoney},//医院回款管理
			{path:"businesscommission",component:BusinessCommission},//商务提成管理
			{path:"label",component:Label},//标签管理
			{path:"labeledit",component:LabelEdit},
			{path:"purchase",component:Purchase},
			{path:"purchasedrugs",component:PurchaseDrugs},
			{path:"allot",component:Allot},
			{path:"allotdrugs",component:AllotDrugs},
			{path:"sales",component:Sales},
			{path:"salesdrugs",component:SalesDrugs},
			{path:"report",component:Report},
			{path:"reportsaleline",component:ReportSaleLine},
			{path:"reporttagbar",component:ReportTagBar},
			{path:"refundsale",component:Refundsale},
			{path:"refundpurchase",component:Refundpurchase},
			{path:"stock",component:Stock},
			{path:"password",component:password},
		]
	}]
});

export default router
