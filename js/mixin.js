const mixin = {
  methods: {
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
    }
  }
}
export default mixin
