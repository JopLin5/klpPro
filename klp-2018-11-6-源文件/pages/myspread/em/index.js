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
    my_push_leadering_empty:false,
    en:{}
  }

  onPullDownRefresh = function() {
    if (this.data.active ==1) {
      this.getCash();
      moneyp = 0;
      this.getCashlog(++moneyp);
    } else
    if (this.data.active == 100) {
      logp = 0
      this.getTuiGuanLog(++logp);
    }
    if (this.data.active == 0) {
      pp = 0;
      this.getTuiGUanf(++pp);
    }
    if (this.data.active ==2) {
      leaderedp = 0;
      this.getLeaderedList(++leaderedp);
    }
    if (this.data.active == 3) {
      leaderingdp = 0;
      this.getLeaderingList(++leaderingdp);
    }
  }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad = function(options) {
    let en = server.de(options);
    this.setData({
      height: app.globalData.screenHeight,
      en: en
    });

    pp = 0;
    logp = 0;
    moneyp = 0;
    this.getTuiGUanf(++pp);
  }

  getTuiGUanf = function(p = 1) {
    if (!server.check_login()) {
      return;
    }
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON(
      '/store/manage_em/', {
        p: p,
        id: this.data.en.log_id
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
          self.setData({ winHeight: (re.height > app.globalData.screenHeight ? re.height : app.globalData.screenHeight) + 'px' });
        });
      }
    );
  }
  onReachBottom = function() {
    if (!server.check_login()) {
      return;
    }
    this.getTuiGUanf(++pp);
    
  }
}
Page(new index())