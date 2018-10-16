const mixin = {
  methods: {
    getIntervalMonth(d1, d2){
      var months;
      months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      return months <= 0 ? 0 : months
    },
    add(num1,num2,num){//加法
        var r1,r2,m,n;
        try{r1=num1.toString().split(".")[1].length}catch(e){r1=0}
        try{r2=num2.toString().split(".")[1].length}catch(e){r2=0}
        m = Math.pow(10,Math.max(r1,r2));
        n = (r1>=r2)?r1:r2;
        num = num?num:n;
        var a = (num1*m + num2*m)/m;
        num = Math.pow(10,num);
        return Math.round(a*num)/num;
    },
    sub(num1,num2,num){//减法
        var r1,r2,m,n;
        try{r1=num1.toString().split(".")[1].length}catch(e){r1=0}
        try{r2=num2.toString().split(".")[1].length}catch(e){r2=0}
        n = (r1>=r2)?r1:r2;
        num = num?num:n;
        m = Math.pow(10,Math.max(r1,r2));
        var a = (num1*m - num2*m)/m
        num = Math.pow(10,num);
        return Math.round(a*num)/num;
    },
    mul(num1,num2,num){//乘法
        var m = 0;
        try{m+=num1.toString().split(".")[1].length}catch(e){}
        try{m+=num2.toString().split(".")[1].length}catch(e){}
        var a = (Number(num1.toString().replace(".",""))*Number(num2.toString().replace(".","")))/Math.pow(10,m);
        num = num?num:m;
        num = Math.pow(10,num);
        return Math.round(a*num)/num;
    },
    div(arg1,arg2,num){//除法
        var t1=0,t2=0,r1,r2;
        try{t1=arg1.toString().split(".")[1].length}catch(e){}
        try{t2=arg2.toString().split(".")[1].length}catch(e){}
        r1=Number(arg1.toString().replace(".",""));
        r2=Number(arg2.toString().replace(".",""));
        var a = (r1/r2)*Math.pow(10,t2-t1);
        num = num?num:(t2-t1);
        num = Math.pow(10,num);
        return Math.round(a*num)/num;
    },
    jquery(url,data,callback){
      var _self = this;
      $.ajax({
        type: "post",
        url: _self.$bus.data.host + url,
        data:data,
        success: function(res) {
          if(res.code == "111111"){
            _self.$router.push("/login");
          }
          callback(res);
        }
      });
    },
    jqueryGet(url,data,callback){
      var _self = this;
      $.ajax({
        type: "get",
        url: _self.$bus.data.host + url,
        data:data,
        success: function(res) {
          if(res.code == "111111"){
            _self.$router.push("/login");
          }
          callback(res);
        }
      });
    }
  }
}
export default mixin
