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

import Contacts from "../views/contacts/contacts.vue";
import ContactsEdit from "../views/contacts/contactsEdit.vue";

const router = new VueRouter({
	routes:[{
		path:"/",
		redirect:to => {
			return "/main";
		}
	},{
		path:"/login",
		component:Login,
	},{
		path:"/main",
		component:Main,
		children:[{path:"",redirect: 'home'},
			{path:"home",component:Home,},
			{path:"drugs/:type",component:Drugs,},
			{path:"drugsedit/:type",component:DrugsEdit,},
			{path:"hospital",component:Hospital,},
			{path:"hospitaledit",component:HospitalEdit,},
			{path:"purchase",component:Purchase},
			{path:"purchasedrugs",component:PurchaseDrugs},
			{path:"purchaseedit",component:PurchaseEdit},
			{path:"returnmoney",component:ReturnMoney},
			{path:"sales",component:Sales},
			{path:"salesdrugs",component:SalesDrugs},
			{path:"salesedit",component:SalesEdit},
			{path:"contacts",component:Contacts},
			{path:"contactsedit",component:ContactsEdit}]
	}]
});

export default router
