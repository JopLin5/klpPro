var server = require('../../../utils/server');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'',
    money:0,

  },
  changge:function(){
    var user_info = wx.getStorageSync('userinfo');
        this.setData({
          url: 'https://wapi.klpfood.com/index.php/WXAPI/store/vertify?_=' + Math.floor(Math.random() * 10 + 1) + '&user_id=' +user_info.user_id});
  },
  onShow:function(){
    var user_info = wx.getStorageSync('userinfo');
     this.setData({
       url: 'https://wapi.klpfood.com/index.php/WXAPI/store/vertify?user_id='+ user_info.user_id
     });
  },
  formSubmit:function(e){
    var money = parseFloat(e.detail.value.money);
    if (money<=0){
      return;
    }
    if (money > parseFloat(this.data.money)){
      server.Toast_error('不能大于钱包金额');
      return;
    }
    var self = this;
    server.postJSON(
      '/Store/my_shop_apply/',e.detail.value,
      function (res) {
        rloading['load'].hidev2();
        if (res.data.status == 1) {
          server.Toast_success('成功', function () {
            wx.navigateBack();
          });
          server.Toast_success('成功',);
        
        } else {
          server.Toast_error((res.data.msg));
        }
      }
    );
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (op) {
    this.setData({ money: op.money});
  }
})