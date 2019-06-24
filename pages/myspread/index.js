var server = require('../../utils/server');
var event = require('../../utils/event');
import Util from '../../utils/util.js';
var app = getApp();
var pp = 0;
var logp = 0;
var moneyp = 0;
var leaderedp =0;
var leaderingdp = 0;
class index{
  data = {
    active: 0,
    shops: [],
    logs: [],
    cashlog: [],
    leadered:[],//已推广员申请
    leadering:[],//推广经理列表申请
    money: 0,
    scrollTop: 0,
    scrollHeight: 0,
    winHeight: 0,
    people_id :0,
    moneyp_empty:false,
    my_push_leadered_empty:false,
    my_push_leadering_empty:false,
    my_shop:{},
    me:{}
    
  }
  //管理员
  gotoadmin=function(e){
    console.log(e);
    let query = server.urlEncode(this.data.shops[e.currentTarget.dataset.index]);
    wx.navigateTo({
      url: "./admin/index?" + query
    }); 
  }
  getsite=function(){
    wx.setClipboardData({
      data: 'www.klpfood.com',
      success(res) {
        server.Toast_error('复制成功,请到浏览器打开');
      }
    })
  }
  seegoods=function(e) {
  var id = e.currentTarget.dataset.id;
  var money = e.currentTarget.dataset.money;
    wx.navigateTo({
    url: 'goods/index?id=' + id + '&money=' + money,
    success: function (res) { },
    fail: function (res) { },
    complete: function (res) { },
  })
};

  getinfo=function(e){
    console.log(e);
    let type = e.currentTarget.dataset.ty;
    let index = e.currentTarget.dataset.index;
    let info={};
    switch (type){
      case 'leadered':
        info = this.data.leadered[index];
        info._index = index;
        info.from=0;
        break;
      case 'leadering':
        info = this.data.leadering[index];
        info._index = index;
        info.from =1;
        break;
    }
    let query = server.urlEncode(info);;

    wx.navigateTo({
      url: '/pages/myspread/info/index?' + query,
    })
  };
  // 滚动切换标签样式
  switchTab = function(e) {
    let self=this;
    let index = e.detail.current > -1 ? e.detail.current:e.target.dataset.num;
    this.setData({
      active: index,
      bottomHeightFlag: true,
    });

    if (this.data.active == 0) {
      if (this.data.shops.length < 1) {
        pp = 0
        this.getTuiGUanf(++pp);
      }
      this.get_wxml('#shop',function(re){
        self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
      });
    }
    if (this.data.active == 1) {
      logp = 0
      this.getTuiGuanLog(++logp);
    }
    if (this.data.active ==2) {
      this.getCash();
      moneyp = 0;
      this.getCashlog(++moneyp);
      this.get_wxml('#money', function (re) {
        self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
      });
    }
  };
  //我是店主
  gotomyshop=function(){
    let query=server.urlEncode(this.data.shops[0]);
    wx.navigateTo({
      url: "./shop/index?"+query
    });
  }
  //我是经理
  gotomanage = function (e) {
    let index = e.currentTarget.dataset.index;
    let query = server.urlEncode(this.data.shops[index]);
    wx.navigateTo({
      url: "./manager/index?" + query
    });
  }
  //我是推广员
  gotoem = function (e) {
    let index=e.currentTarget.dataset.index;
    let query = server.urlEncode(this.data.shops[index]);
    wx.navigateTo({
      url: "./em/index?" + query
    });
  }
  onGotoshop = function(e) {
    var shopId = e.currentTarget.dataset.shopid;
    if (shopId<1){
      return;
    }
    var userinfo = wx.getStorageSync('userinfo');
    wx.navigateTo({
      url: "../shopdetail/index?from=2&id=" + shopId + '&people_id=' + userinfo.user_id
    });
  }
  onPullDownRefresh = function() {
  
    if (this.data.active == 0) {//推广店铺
      pp = 0;
      this.getTuiGUanf(++pp);
    }
    if (this.data.active ==1) {
      logp = 0;
      this.getTuiGuanLog(++logp);
    }
    if (this.data.active == 2) {//钱包
      this.getCash();
      moneyp = 0;
      this.getCashlog(++moneyp);
    } 
  }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad = function(options) {
    var user_info = wx.getStorageSync('userinfo');
    var that = this;
    this.setData({
      height: app.globalData.screenHeight,
      me: user_info
    });
    event.on('tgy',this,function(index){
      let ii=this.data.leadered;
      ii.splice(index,1);
      this.setData({ leadered: ii});
    });
    //经理
    event.on('tgjl', this, function (index) {
      let ii = this.data.leadering;
      ii.splice(index, 1);
      this.setData({ leadering: ii });
    });
    pp = 0;
    logp = 0;
    moneyp = 0;
    this.getTuiGUanf(++pp);
  }
  getTuiGUanf = function(p = 1) {//推广店铺
    if (!server.check_login()) {
      return;
    }
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON(
      '/store/my_push/', {
        p: p
      },
      function(res) {
        rloading['load'].hidev2();
        if (res.data.status == 1) {
          var shops = [];
          if (p == 1) {
            shops = res.data.result;
            self.setData({
              shops: shops,
            });
          } else {
            shops = self.data.shops;
            shops.concat(res.data.result);
            self.setData({
              shops: shops,
            });
          }
       
        } else {
          if(p==1){
            self.setData({
              shops: [],
            });
          }
          --pp;
        }
        self.get_wxml('#shop', function (re) {
          self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
        });
      }
    );
  }

  getTuiGuanLog = function(p = 1) {//推广记录
    if (!server.check_login()) {
      return;
    }
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON(
      '/store/my_push_log/', {
        p: p
      },
      function(res) {
        rloading['load'].hidev2();
        if (res.data.status == 1) {
          var logs = [];
          if (p == 1) {
            logs = res.data.result;
            self.setData({
              logs: logs,
              my_push_log_empty:false
            });
          } else {
            logs = self.data.logs;
            logs.concat(res.data.result);
            self.setData({
              logs: logs,
              my_push_log_empty: false
            });
          }
 
        } else {
          self.setData({
            my_push_log_empty: true
          });
          --logp;
        }
        self.get_wxml('#log', function (re) {
          self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
        });
      }
    );
  }

  onReachBottom = function() {
    if (!server.check_login()) {
      return;
    }
   
    if (this.data.active == 0) {
      this.getTuiGUanf(++pp);
    }
    if (this.data.active == 1) {
      this.getTuiGuanLog(++logp);
    }
    if(this.data.active ==2){
      this.getCashlog(++moneyp)
    }
  }
  getCash = function() {
    if (!server.check_login()) {
      return;
    }
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON(
      '/store/getCash/', {},
      function(res) {
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
  onshow = function() {
    if (this.data.active == 2) {
      moneyp = 0;
      this.getCash();
      this.getCashlog(++moneyp);
    }
  }
  off = function(e) {
    var self = this;
    console.log(e);
    var log_id = e.currentTarget.dataset.id || 0;
    var index = e.currentTarget.dataset.index || 0; 
    var from = e.currentTarget.dataset.from || 0; 
    let url = from > 0 ? '/Store/cancel_user_rebate/' :'/Store/cancel_e/';
    wx.showModal({
      title: '确定注销吗?',
      content: from > 0 ? '确定注销品友身份吗？' :'确定注销超级品友身份吗？',
      success(res) {
        if (res.confirm) {
          let rloading = server.loadv2(this, '.J_loading');
          server.postJSON(
            url, {
              log_id: log_id
            },
            function (re) {
              rloading['load'].hidev2();
              if (re.data.status > 0) {
                let shops = self.data.shops;
                shops.splice(index, 1);
                self.setData({
                  shops: self.data.shops
                });
              } else {
                server.Toast_error(re.data.msg);
              }
            }
          );
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });

  }
  getCashlog = function(p = 1) {//钱包流水
    if (!server.check_login()) {
      return;
    }
    var self = this;
    server.postJSON(
      '/store/cash_log/', {
        p: p
      },
      function(res) {
        if (res.data.status == 1) {
          var cashlog = [];
          if (p == 1) {
            cashlog = res.data.result;
            self.setData({
              cashlog: cashlog,
              moneyp_empty: false
            });
          } else {
            cashlog = self.data.cashlog;
            cashlog.concat(res.data.result);
            self.setData({
              cashlog: cashlog,
              moneyp_empty: false
            });
          }
  
        } else {
          self.setData({
            moneyp_empty: true
          });
          --moneyp;

        }
        self.get_wxml('#money', function (re) {
          self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
        });
      }
    );
  }

  // 提现
  withdraw = function() {
    if (!server.check_login()) {
      return;
    }
    wx.navigateTo({
      url: "/pages/withdraw/index?money=" + this.data.money
    })
  }
}
Page(new index())