    var server = require('../../../utils/server');
    var tool = require('../../../utils/util');
Page({
  data: {
    list: 0,
    active:0
  },
  onShow: function () {
   
  },
  onLoad: function (options) {
    var that=this;
    server.postJSON('/store/cha_kuaidi', options, function (res) {
      if (res.data.status==1){
        var result = res.data.result;
        that.setData({ steps: result, active: result.length-1 });
        return;
      }else{
        server.Toast_error(res.data.msg);
        return;
      }

    });
  }
})