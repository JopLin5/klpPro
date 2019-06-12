var server = require('../../../utils/server');
var event = require('../../../utils/event');
import Util from '../../../utils/util.js';
var app = getApp();
var pp = 0;
var leaderingdp = 0;
class index{
  data = {
    active: 0,
    my_shop: [],
    leadering:[],//推广经理列表申请
    winHeight: 0,
    my_push_leadering_empty:false,
  }


  getinfo=function(e){
    console.log(e);
    let index = e.currentTarget.dataset.index;
    let info={};
        info = this.data.leadering[index];
        info._index = index;
        info.from =1;
    let query = server.urlEncode(info);;

    wx.navigateTo({
      url: '/pages/myspread/admin/info/index?' + query,
    })
  };
  onShareAppMessage=function(e){
    var user_info = wx.getStorageSync('userinfo');
    console.log(e);
    let time = (Date.parse(new Date()) / 1000)+2*3600;
    let shop=this.data.my_shop;
      shop=this.data.my_shop;
    let title = shop.store_name + "【推广经理注册邀请】链接从发送起2小时内有效";
    let query = server.urlEncode({ from_id: user_info.user_id,store_name: shop.store_name, shop_id: shop.store_id, logo: shop.store_logo, time: time, 'name': shop.store_name});
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
        self.setData({ winHeight: ((re.height + 90) > app.globalData.screenHeight ? (re.height + 90): app.globalData.screenHeight) + 'px' });
      });
    }
    if (this.data.active ==1) {
      if (this.data.leadering.length < 1) {
        leaderingdp = 0;
        this.getLeaderingList(++leaderingdp);
      }
      this.get_wxml('#leaderingdp', function (re) {
        self.setData({ winHeight: ((re.height + 90) > app.globalData.screenHeight ? (re.height + 90): app.globalData.screenHeight) + 'px' });
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
      leaderingdp = 0;
      this.getLeaderingList(++leaderingdp);
    } 
  }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad = function(options) {
    var that = this;
    let my_shop = server.de(options);
    console.log(my_shop);
    this.setData({
      my_shop: my_shop,
      height: app.globalData.screenHeight+'px',
    });
    //经理
    event.on('admintgjl', this, function (index) {
      let ii = this.data.leadering;
      ii.splice(index, 1);
      this.setData({ leadering: ii });
    });
    pp = 0;
    leaderingdp = 0;
    this.getTuiGUanf(++pp);
  }

  getTuiGUanf = function(p = 1) {
    if (!server.check_login()) {
      return;
    }
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON(
      '/store/www_rebate_manger_list/', {
        p: p,
        store_id:self.data.my_shop.store_id
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
          if (p == 1) {
            self.setData({
              shops: [],

            });
          } 
          --pp;
        }
        self.get_wxml('#shop', function (re) {
          self.setData({ winHeight: ((re.height + 90) > app.globalData.screenHeight ? (re.height + 90): app.globalData.screenHeight) + 'px' });
        });
      }
    );
  }


  getLeaderingList = function (p = 1) {
    if (!server.check_login()) {
      return;
    }
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON(
      '/store/www_rebate_apply/', {
        p: p,
        store_id: self.data.my_shop.store_id
      },
      function (res) {
        rloading['load'].hidev2();
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
          self.setData({ winHeight: ((re.height + 90) > app.globalData.screenHeight ? (re.height + 90) : app.globalData.screenHeight) + 'px' });
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
    if(this.data.active ==1){
      this.getLeaderingList(++leaderingdp)
    }
  }
  onshow = function() {
  
  }
  off = function(e) {
    let self = this;
    console.log(e);
    let log_id = e.currentTarget.dataset.id || 0;
    let index = e.currentTarget.dataset.index || 0;
    let log=self.data.shops[index];
    wx.showModal({
      title: '确定注销吗?',
      content: '确定注销此推广经理的身份吗？',
      success(res) {
        if (res.confirm) {
          let rloading = server.loadv2(this, '.J_loading');
          server.postJSON(
            '/Store/guanliyuan_cancel_m/', {
              log_id: log_id,
              store_id: log.store_id
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
    })


  }

}
Page(new index())