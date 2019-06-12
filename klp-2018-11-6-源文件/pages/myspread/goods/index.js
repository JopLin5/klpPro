var server = require('../../../utils/server');
Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var id = options.id;
    var money = options.money||0;
    wx.showLoading({title: '加载中',mask:true });
    server.postJSON('/User/get_push_log_goods',{id:id},function(res){
     var result = res.data.result;
     setTimeout(function () {wx.hideLoading()}, 50);
      that.setData({ result: result, money: money});
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
    var id = e.currentTarget.dataset.id|| '';
    if (no==''){
      server.Toast_error('暂无快递信息');
      return;
    }
    var yy = server.urlEncode(e.currentTarget.dataset);
    wx.navigateTo({
      url: '../kuaidi/index?' + yy,
    })
  }
})