var server = require('../../../utils/server');
var event = require('../../../utils/event');
import Util from '../../../utils/util.js';
var app = getApp();
var pp = 0;
var logp = 0;
var moneyp = 0;
var leaderedp =0;
var leaderingdp = 0;
class index{
  data = {
    active: 0,
    my_shop: [],
    leadering:[],//推广经理列表申请
    winHeight: 0,
    my_push_leadering_empty:false,
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
  wx: wx.redirectTo({
    url: 'goods/index?id=' + id + '&money=' + money,
    success: function (res) { },
    fail: function (res) { },
    complete: function (res) { },
  })
};

  getinfo=function(e){
    console.log(e);
    let index = e.currentTarget.dataset.index;
    let info={};
        info = this.data.leadering[index];
        info._index = index;
        info.from =1;
    let query = server.urlEncode(info);;

    wx.navigateTo({
      url: '/pages/myspread/info/index?' + query,
    })
  };
  onShareAppMessage=function(e){
    var user_info = wx.getStorageSync('userinfo');
    console.log(e);
    let time = (Date.parse(new Date()) / 1000)+2*3600;
    let shop=this.data.my_shop;
      shop=this.data.my_shop;
    let title = shop.store_name + "【推广经理注册邀请】链接从发送起2小时内有效";
    let query = server.urlEncode({ from_id: user_info.user_id, store_name: shop.store_name, shop_id: shop.log_id, logo: shop.store_logo, time: time, 'name': shop.store_name});
    return {
      title: title,
      path: '/pages/register/index?'+ query,
      imageUrl:'/images/yaoqinghan.png'
    }
  }
  // 滚动切换标签样式
  switchTab = function(e) {
    let self=this;
    let index = e.detail.current > -1 ? e.detail.current:e.target.dataset.num;
    this.setData({
      active: index,
      bottomHeightFlag: true,
      id: 'id_' + index
    });

    if (this.data.active == 0) {
      if (this.data.shops.length < 1) {
        pp = 0
        this.getTuiGUanf(++pp);
      }
      this.get_wxml('#shop', function (re) {
        self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
      });
    }
    if (this.data.active ==1) {
      if (this.data.leadering.length < 1) {
        leaderingdp = 0;
        this.getLeaderingList(++leaderingdp);
      }
      this.get_wxml('#leaderingdp', function (re) {
        self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
      });
    }
  };
 
  onGotoshop = function(e) {
    var shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: "../shopdetail/index?from=2&id=" + shopId+'&people_id='+this.data.people_id
    });
  }
  onPullDownRefresh = function() {
   
    if (this.data.active == 0) {
      pp = 0;
      this.getTuiGUanf(++pp);
    }
    if (this.data.active == 1) {
      leaderedp = 0;
      this.getLeaderingList(++leaderedp);
    } 
  }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad = function(options) {
    var that = this;
    let my_shop = server.de(options);
    this.setData({
      my_shop: my_shop,
      height: app.globalData.screenHeight+'px',
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
    this.getTuiGUanf(++pp);
  }

  getTuiGUanf = function(p = 1) {
    if (!server.check_login()) {
      return;
    }
    var self = this;
  
    server.postJSON(
      '/store/shop_manager_list/', {
        p: p
      },
      function(res) {
    
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
          if (p == 1) {
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


  getLeaderingList = function (p = 1) {
    if (!server.check_login()) {
      return;
    }
    var self = this;
    server.postJSON(
      '/store/manger_rebate_apply/', {
        p: p
      },
      function (res) {
        if (res.data.status == 1) {
          var leadering = [];
          if (p == 1) {
            leadering = res.data.result;
            self.setData({
              leadering: leadering,
              my_push_leadering_empty: false
            });
          } else {
            leadering = self.data.leadering;
            leadering.concat(res.data.result);
            self.setData({
              leadering: leadering,
              my_push_leadering_empty: false
            });
          }

        } else {
          if(p==1){
            self.setData({
              leadering:[],
              my_push_leadering_empty: true
            });
          }else{
            self.setData({
              my_push_leadering_empty: true
            });
          }
 
          --leaderingdp;
        }
        self.get_wxml('#leaderingdp', function (re) {
          self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
        });
      }
    );

  }
  onReachBottom = function() {
    if (!server.check_login()) {
      return;
    }
    if (this.data.active ==1) {
      this.getCashlog(++moneyp);
    }
    if (this.data.active == 100) {
      this.getTuiGuanLog(++logp);
    }
    if (this.data.active == 0) {
      this.getTuiGUanf(++pp);
    }
    if(this.data.active ==2){
      this.getLeaderedList(++leaderedp)
    }
    if(this.data.active ==3){
      this.getLeaderingList(++leaderingdp)
    }
  }
  onshow = function() {
  
  }
  off = function(e) {
    var self = this;
    console.log(e);
    var log_id = e.currentTarget.dataset.id || 0;
    var index = e.currentTarget.dataset.index || 0;
    
    wx.showModal({
      title: '确定注销吗?',
      content: '确定注销此推广经理的身份吗？',
      success(res) {
        if (res.confirm) {
      
          server.postJSON(
            '/Store/rebase_cancel/', {
              log_id: log_id
            },
            function (re) {
            
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
    })


  }

}
Page(new index())