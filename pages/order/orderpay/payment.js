var server = require('../../../utils/server');
Page({
  data: {
    orderId: '',
    deadLine: '',
    hiddenmodalput: true,
    is_shop: 0,
    Length: 6,        //输入框个数  
    isFocus: false,    //聚焦  
    Value: "",        //输入的内容  
    ispassword: true, //是否密文显示 true为密文， false为明文
    _from: '',
    title: ''
  },
  onShow: function () {
    var app = getApp();
    var order = app.globalData.order;
    var newDate = new Date();

    newDate.setTime((parseInt(order.add_time) + 30 * 60) * 1000);
    var year = newDate.getFullYear();
    var month = newDate.getMonth() + 1;
    var day = newDate.getDate();
    var hour = newDate.getHours();
    var minute = newDate.getMinutes();
    var second = newDate.getSeconds();
    var deadLine = year + '年' + month + '月' + day + '日 ' + hour + ':' + minute + ':' + second;
    order.order_amount = parseFloat(order.order_amount).toFixed(2);
    var userinfo = wx.getStorageSync('userinfo');
    this.setData({ order: order, deadLine: deadLine, is_shop: userinfo.is_shop });
  },
  gettime: function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  },
  pay: function () {
    var app = getApp();
    var order = app.globalData.order;
    var orderId = order.order_id;
    let p = new Promise(function (succ, error) {
      server.postJSON('/Cart/getWXPayInfo/', { order_id: orderId }, function (res) {
        succ(res.data.result);
      });
    });
    p.then(function (wxdata) {
      wx.requestPayment({
        'nonceStr': wxdata.nonceStr + "",
        'package': wxdata.package,
        'signType': wxdata.signType,
        'timeStamp': wxdata.timeStamp + "",
        'paySign': wxdata.sign,
        'success': function (res) {
          wx.showToast({ title: '支付成功', icon: 'success', duration: 1500 })
          wx.redirectTo({
            url: '../list/list'
          })
        },
        'fail': function (res) {
          wx.showToast({ title: '支付失败', icon: 'error', duration: 1500 });
          wx.redirectTo({
            url: '../list/list'
          });
        }
      })
    });

  },
  cancel: function () {
    this.setData({ _from:'', Value:'', title: '', hiddenmodalput: true });
  },
  pre_klp_pay: function () {
    this.setData({ _from:1, Value:'', title: '输入我的钱包密码', hiddenmodalput: false });
  },
  pre_shop_pay: function () {
    this.setData({ _from:0, title: '输入店铺钱包密码', hiddenmodalput: false });
  },
  klp_pay: function (password) {//用户钱包支付
    var app = getApp();
    var order = app.globalData.order;
    var orderId = order.order_id;
    let p = new Promise(function (succ, error) {
      var p = server.postJSON('/Cart/wallet_pay/', { password: password, order_id: orderId, all: order.order_amount }, function (res) {
        succ(res.data);
      });
    });
    p.then(function (data) {
      server.Toast_error(data.msg, null, 5000);
      if (data.status == 1) {
        wx.redirectTo({
          url: '../list/list'
        });
        return;
      }

    });
  },
  shop_pay: function (password) {
    var app = getApp();
    var order = app.globalData.order;
    var orderId = order.order_id;
    let p = new Promise(function (succ, error) {
      var p = server.postJSON('/Cart/shop_wallet_pay/', { password: password, order_id: orderId, all: order.order_amount }, function (res) {
        succ(res.data);
      });
    });
    p.then(function (data) {
      server.Toast_error(data.msg, null, 5000);
      if (data.status == 1) {
        wx.redirectTo({
          url: '../list/list'
        });
        return;
      }

    });
  },
  Focus(e) {
    var that = this;
    console.log('focus');
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue,
    })
  },
  Tap() {
    console.log('123');
    var that = this;
    let Y=that.data.isFocus?false:true;
    that.setData({
      isFocus:Y,
    })
  },
  formSubmit(e) {
    if (this.data._from ==1) {
      this.klp_pay(this.data.Value);
    } else if (this.data._from ==0) {
      this.shop_pay(this.data.Value);
    }

  },
  resetPassword(){
      wx.navigateTo({
        url: '/pages/init/reset/reset?_from='+this.data._from,
      })
  }
})
