import Vue from "vue/dist/vue.js";
import VueRouter from "vue-router";
Vue.use(VueRouter);
//一级页面
import Main from "../views/main.vue";
import Drugs from "../views/drugs/drugs.vue";
import DrugsEdit from "../views/drugs/drugsEdit.vue";
import Home from "../views/home.vue";
import Report from "../views/report.vue";
import DistributionReport from "../views/reportdistribution.vue";
import Contacts from "../views/contacts/contacts.vue";
import ContactsEdit from "../views/contacts/contactsEdit.vue";
import config from "../data/config.json";

const router = new VueRouter({
	routes:[{
		path:"/",
		redirect:to => {
			return "/main";
		}
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
			path:"report",
			component:Report
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
