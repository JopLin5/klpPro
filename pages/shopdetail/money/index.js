import server from'../../../utils/server';
import event from '../../../utils/event.js';
var moneyp=0;
var app=getApp();
class index{
  /**
    * 生命周期函数--监听页面加载
    */
    data={
      empty:false,
      cashlog:[]
    }
  getsite = function () {
    wx.setClipboardData({
      data: 'www.klpfood.com',
      success(res) {
        server.Toast_error('复制成功,请到浏览器打开');
      }
    })
  }
  onLoad = function (options) {
    moneyp=0;
  }
  withdraw=function(){

    wx.navigateTo({
      url: "../withdraw/index?money=" + this.data.money
    })
  };

  onReachBottom = function () {
    if (!server.check_login()) {
      return;
    }
    this.getCashlog(++moneyp);
  }
  getCash = function () {
    if (!server.check_login()) {
      return;
    }
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON(
      '/User/my_shop_wallet/', {},
      function (res) {
        rloading['load'].hidev2();
        if (res.data.status == 1) {
          self.setData({
            money: res.data.result
          });
        } else {
          //  server.Toast_error((res.data.msg));
        }
      }
    );
  }
  onShow = function () {
      moneyp=0;
      this.getCash();
      this.getCashlog(++moneyp);
  }

  getCashlog = function (p = 1) {
    if (!server.check_login()) {
      return;
    }
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON(
      '/store/shop_cash_log/', {
        p: p
      },
      function (res) {
        rloading['load'].hidev2();
        if (res.data.status == 1) {
          var cashlog = [];
          if (p == 1) {
            cashlog = res.data.result;
            self.setData({
              empty:false,
              cashlog: cashlog
            });
          } else {
            cashlog = self.data.cashlog;
            cashlog=cashlog.concat(res.data.result);
            self.setData({
              empty: false,
              cashlog: cashlog
            });
          }
          self.get_wxml('#money', function (re) {
            self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
          });
        } else {
          self.setData({
            empty: true
          });
          --moneyp;
        }
      }
    );
  }

  // 提现
  withdraw = function () {
    if (!server.check_login()) {
      return;
    }
    wx.navigateTo({
      url: "../withdraw/index?money=" + this.data.money
    })
  }
}
Page(new index());