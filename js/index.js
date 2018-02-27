import Vue from "vue/dist/vue.js";
import router from "../router/router.js";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI)

new Vue({
	el:"#app",
	template:"<keep-alive><router-view></router-view></keep-alive>",
	router,
//	store,
});
