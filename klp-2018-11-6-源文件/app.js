import server from './utils/server.js';
import regeneratorRuntime from './regenerator-runtime/runtime.js';
import md5 from './utils/md5.js';
import Timer from './utils/timer.js';
import event from './utils/event.js';
App({
  onLaunch: function(options) {
    this.getSysyteminfo();
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    this.login().catch(function(e) {
      console.log(e)
    })
  },
  getSysyteminfo: function() {
    let that = this;
    try {
      var systemInfo = wx.getSystemInfoSync()
    } catch (e) {
      var systemInfo = wx.getSystemInfoSync()
    }
    that.globalData.model = systemInfo;
    console.log(systemInfo);
    that.globalData.screenWidth = systemInfo.windowWidth;
    that.globalData.screenHeight = systemInfo.screenHeight;
    that.globalData.windowHeight = systemInfo.windowHeight, that.globalData.windowWidth = systemInfo.windowWidth, that.globalData.pixelRatio = 750 / systemInfo.windowWidth;
    let totalTopHeight = 68;
    if ((systemInfo.screenHeight / systemInfo.windowWidth) > 1.9) {
      totalTopHeight = 84
    } else if (/iPhone/.test(systemInfo.model)) {
      totalTopHeight = 64
    }
    that.globalData.totalTopHeight = totalTopHeight;
    if (systemInfo.platform.toLowerCase() == 'android') {
      that.globalData.statusBarHeight = systemInfo.statusBarHeight + 8
    } else {
      that.globalData.statusBarHeight = systemInfo.statusBarHeight + 4
    }
    that.globalData.titleBarHeight = totalTopHeight - that.globalData.statusBarHeight
  },
  onShow: function() {},
  onHide: function() {},
  onShow: function(p) {
    console.log(p)
  },
  login_timer: function() {
    self = this
  },
  remive_login_timer: function() {},
  userInfoFromWx: function() {
    var self = this;
    return new Promise(function(su, err) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                console.log(res.userInfo);
                su(res.userInfo)
              },
              fail: res => {
                su({})
              }
            })
          } else {
            su({})
          }
        },
        fail: res => {
          su({})
        }
      })
    })
  },
  login: function(distribut_from = 0) {
    let self = this;
    let p = function(userinfo) {
      return new Promise(function(resolve, rejust) {
        if (self.globalData.is_login) {
          resolve(self.globalData.data);
          return
        }
        wx.login({
          success: function(res) {
            server.postJSON('/User/silence_login', {
              code: res.code,
              nickName: userinfo.nickName || '',
              avatarUrl: userinfo.avatarUrl || '',
              distribut_from: distribut_from
            }, function(response) {
              if (response.data.status == 1) {
                wx.setStorageSync('session_id', response.data.result.session_id);
                wx.setStorageSync('userinfo', response.data.result);
                self.globalData.data = response.data;
                self.globalData.is_login = true;
                resolve(response.data)
              } else {
                resolve(response.data)
              }
            })
          }
        })
      })
    };
    return self.userInfoFromWx().then(p)
  },
  check_login_AND_register: function(e, distribut_from = 0) {
    let self = this;
    return new Promise((success, error) => {
      if (self.globalData.is_login) {
        success(self.globalData.data);
        return
      }
      server.postJSON('/User/check_login', {}, function(re) {
        if (re.data.result == 1) {
          success()
        } else {
          self.register_login(distribut_from, e).then(function(data) {
            success(data);
          })
        }
      })
    })
  },
  register_login: function(distribut_from = 0, e) {
    var self = this;
    return new Promise(function(resolve, rejust) {
      wx.login({
        success: function(res) {
          server.postJSON('/User/loginv2', {
            code: res.code,
            encryptedData: e.detail.encryptedData || '',
            signature: e.detail.signature || '',
            iv: e.detail.iv || '',
            distribut_from: distribut_from
          }, function(response) {
            if (response.data.status == 1) {
              wx.setStorageSync('session_id', response.data.result.session_id);
              wx.setStorageSync('userinfo', response.data.result);
              self.globalData.data = response.data;
              self.globalData.is_login = true;
              resolve(self.globalData.data)
            } else {}
          })
        }
      })
    })
  },
  onError: function(err) {
    console.log(err)
  },
  globalData: {
    tab: 0,
    tabbot: {},
    redhot: {},
    memhot: {},
    cat: [],
    is_login: false,
    Jpush: null,
    timer: {},
    timer_id: {},
    msg: [],
    avatarUrl: null,
    screenWidth: null,
    pixelRatio: null,
    windowHeight: null,
    windowWidth: null,
    screenHeight: null,
    order: '',
    statusBarHeight: 10,
    totalTopHeight: 88,
    titleBarHeight: 0,
    model: {},
    data: {}
  },
});
require('./init.js');