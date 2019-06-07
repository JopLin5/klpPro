var server = require('../../../utils/server');
Page({
  data: {result:{}},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var order_id = options.order_id;
    wx.showLoading({title: '加载中',mask:true });
    server.postJSON('/User/getOrderDetail',{id:order_id},function(res){
     var result = res.data.result;
     setTimeout(function () {wx.hideLoading()}, 50);
     that.setData({result:result});
    });
    
  },
  
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  seeKuaidi:function(e){
    var no=e.currentTarget.dataset.no||'';
    if (no==''){
        return;
    }
    wx.setClipboardData({
      data: no,
      success: function (res) {
        server.Toast_success('复制成功');
      }
    });
  },
  gotokefu:function (e) {
    var url = encodeURIComponent('https://live.klpfood.com/mobile/index?code=' + this.data.result.code);
    wx.navigateTo({
      url: '/pages/kefu/index?url=' + url,
    })
  }
})