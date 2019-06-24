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
    shops: [],
    leadering:[],//推广经理列表申请
    winHeight: 0,
    empty:false,
    manager:{}
  }


  getinfo=function(e){
    console.log(e);
    let type = e.currentTarget.dataset.ty;
    let index = e.currentTarget.dataset.index;
    let info={};
    info = this.data.leadering[index];
    info._index = index;
    info.from =0;
    let query = server.urlEncode(info);;

    wx.navigateTo({
      url: '/pages/myspread/info/index?' + query,
    })
  };
  onShareAppMessage=function(e){

    console.log(e);
    let time = (Date.parse(new Date()) / 1000)+2*3600;
    let manager=this.data.manager;
    let query = server.urlEncode({ store_name: manager.store_name, shop_id: manager.store_id, logo: manager.store_logo, time: time, name: manager.manager_name, manager_id: manager.is_manager});
    console.log(query);
    return {
      title: manager.manager_name + "【品友注册邀请】链接从发送起2小时内有效",
      path: '/pages/shopregister/register/index?'+ query,
      imageUrl:'/images/yaoqinghan.png'
    }
  }



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad = function(options) {
    let manager = server.de(options);
    this.setData({
      height: app.globalData.screenHeight,
      manager: manager
    });
    pp = 0;
    this.getTuiGUanf(++pp);
  }

  getTuiGUanf = function (p = 1, log_id=0) {
    if (!server.check_login()) {
      return;
    }
    var self = this;
    server.postJSON(
      '/store/manager_em_list/', {
        p: p,
        log_id: log_id
      },
      function(res) {
        if (res.data.status == 1) {
          var shops = [];
          if (p == 1) {
            shops = res.data.result;
            self.setData({
              shops: shops,
              empty: false
            });
          } else {
            shops = self.data.shops;
            shops.concat(res.data.result);
            self.setData({
              shops: shops,
              empty: false
            });
          }
       
        } else {
          self.setData({ empty:true});
          --pp;
        }
      }
    );
  }

  scroll = function() {
    this.getTuiGUanf(++pp);
  }

  off = function(e) {
    var self = this;
    console.log(e);
    var log_id = e.currentTarget.dataset.id || 0;
    var index = e.currentTarget.dataset.index || 0;

    wx.showModal({
      title: '确定注销吗',
      content: '确定注销平台的品友身份吗？',
      success(res) {
        if (res.confirm) {
          server.loading('请求中');
          server.postJSON(
            '/Store/cancel_user_rebate/', {
              log_id: log_id
            },
            function (re) {
              server.hide_cast();
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