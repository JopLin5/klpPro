import server from '../../../utils/server.js';
import event from '../../../utils/event.js';
var app = getApp();
class login{
   
  data= {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false
  }

  onLoad=function() {
}
  getWxcode = function () {
    wx.showLoading({
      title: '',
    })
    return new Promise(function (re, con) {
      wx.login({
        success: function (res) {
          re(res);
        },
        false: function (res) {
          con(res);
        }
      })
    });
  };

  login = function (e) {
    if (!e.detail.userInfo) {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
      return;
    }
    var self = this;
    //是否同意授权
    self.getWxcode().then(function (res) {
      server.postJSON(
        //登陆连接		
        '/User/loginv2',
        { code: res.code, encryptedData: e.detail.encryptedData, signature: e.detail.signature, iv: e.detail.iv },
        function (response) {
          if (response.data.status == 1) {
            wx.setStorageSync('session_id', response.data.result.session_id);
            wx.setStorageSync('userinfo', response.data.result);
            var userinfo = response.data.result;
            self.setData({
              is_login: 1,
              avatarUrl: userinfo ? userinfo.head_pic : '',
              nickName: userinfo ? userinfo.name : '',
              is_distribut: userinfo.is_distribut,
              is_shop: userinfo.is_shop
            });
            event.emit('loginJpush');
            wx.navigateBack({
              delta: 1,
            })
          } else {
            // that.register('');
          }

        }
      );
    }, function (res) {
      server.Toast_error('登录失败');
    }).catch(function () {
      server.Toast_error('登录失败');
      wx.hideToast();
      wx.hideLoading();
    });

  };
}
Page(new login());