import Vue from "vue/dist/vue.js";
import router from "../router/router.js";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '../css/global.css';
import $ from 'jquery'
Vue.use(ElementUI)
import VueBus from './vue-bus.js'
Vue.use(VueBus);
import mixin from './mixin.js'
Vue.mixin(mixin)

Vue.directive('dbClick', {
  inserted(el, binding) {
    el.addEventListener('click', e => {
      if(!el.disabled) {
        el.disabled = true;
        let timer = setTimeout( () => {
          el.disabled = false;
        },1000)
      }
    })
  }
});

Date.prototype.format = function(fmt) {
     var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt;
}

new Vue({
	el:"#app",
	template:"<keep-alive><router-view></router-view></keep-alive>",
	router,
//	store,
});
