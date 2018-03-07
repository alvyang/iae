import Vue from "vue/dist/vue.js";
import VueRouter from "vue-router";
Vue.use(VueRouter);

import Login from "../views/login.vue";
//一级页面
import Main from "../views/main.vue";
import Home from "../views/home.vue";

import Drugs from "../views/drugs/drugs.vue";
import DrugsEdit from "../views/drugs/drugsEdit.vue";

import Purchase from "../views/purchase/purchase.vue";
import PurchaseEdit from "../views/purchase/purchaseEdit.vue";
import PurchaseDrugs from "../views/purchase/purchaseDrugs.vue";

import DistributionReport from "../views/reportdistribution.vue";
import Contacts from "../views/contacts/contacts.vue";
import ContactsEdit from "../views/contacts/contactsEdit.vue";
import config from "../data/config.json";

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
		children:[{
			path:"",
			redirect: 'home'
		},{
			path:"home",
			component:Home,
		},{
			path:"drugs",
			component:Drugs,
		},{
			path:"drugsedit",
			component:DrugsEdit,
		},{
			path:"purchase",
			component:Purchase
		},{
			path:"purchasedrugs",
			component:PurchaseDrugs
		},{
			path:"purchaseedit",
			component:PurchaseEdit
		},{
			path:"distributionreport",
			component:DistributionReport
		},{
			path:"contacts",
			component:Contacts
		},{
			path:"contactsedit",
			component:ContactsEdit
		}]
	}]
});

export default router
