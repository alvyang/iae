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
import PurchaseEdit from "../views/purchase/purchaseEdit.vue";
import PurchaseDrugs from "../views/purchase/purchaseDrugs.vue";
import ReturnMoney from "../views/purchase/ReturnMoney.vue";
//销售记录页面
import Sales from "../views/sales/sales.vue";
import SalesDrugs from "../views/sales/salesDrugs.vue";
import SalesEdit from "../views/sales/salesEdit.vue";
//销售渠道页面
import Hospital from "../views/hospital/hospital.vue";
import HospitalEdit from "../views/hospital/hospitalEdit.vue";
//联系人页面
import Contacts from "../views/contacts/contacts.vue";
import ContactsEdit from "../views/contacts/contactsEdit.vue";
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
		children:[{path:"",redirect: 'drugs'},
			// {path:"home",component:Home,},
			{path:"drugs",component:Drugs},
			{path:"drugsedit",component:DrugsEdit},
			{path:"authority",component:Authority},
			{path:"role",component:Role},
			{path:"user",component:User},
			{path:"group",component:Group},
			{path:"hospital",component:Hospital},//医院管理
			{path:"hospitaledit",component:HospitalEdit},
			{path:"contacts",component:Contacts},//联系人管理
			{path:"contactsedit",component:ContactsEdit},
			{path:"label",component:Label},//标签管理
			{path:"labeledit",component:LabelEdit},
			// {path:"purchase",component:Purchase},
			// {path:"purchasedrugs",component:PurchaseDrugs},
			// {path:"purchaseedit",component:PurchaseEdit},
			// {path:"returnmoney",component:ReturnMoney},
			// {path:"sales",component:Sales},
			// {path:"salesdrugs",component:SalesDrugs},
			// {path:"salesedit",component:SalesEdit},
			// {path:"password",component:password},

		]
	}]
});

export default router
