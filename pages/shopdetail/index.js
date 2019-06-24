var server = require('../../utils/server');
import event from '../../utils/event.js';
import Util from '../../utils/util.js';
const app = getApp();

class index{
  p = 0;
  s_p=0;
  loadding=false;
  data = {
    from: 0,
    shop_id: 0,
    people_id: 0,
    goods_list: {},
    the_store: {},
    stores: [],
    active: 0,
    height: app.globalData.screenHeight + 'px',
    totalTopHeight: 0
  }
  slipChange = function(e) {
    console.log(e);
    if (e.detail.source != 'touch') {
      var store = this.data.stores[this.data.active];
      this.setData({ active: this.data.active, the_store: store,shop_id: store.store_id});
      return;
    }
    var store = this.data.stores[e.detail.current];
    this.setData({
      the_store: store,
      active: e.detail.current,
      shop_id: store.store_id
    });
    if (this.data.goods_list[store.store_id] == undefined || this.data.goods_list[store.store_id].goods_list == undefined ) {
      this.get_shop_goods(store.store_id, 1);
    }
    var diff = this.data.stores.length - e.detail.current;
    if (diff <= 3) {
      //切换界面加载
      this.get_about_shop(this.data.shop_id, this.s_p+1);
    }
  }
  myRoute = function(e) {
    var url = e.currentTarget.dataset.url;
    event.emit('settype', '', 1);
    wx.switchTab({
      url: url
    });
  }
  addCollect = function(e) {
    let self = this;
    let store_id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let rloading = server.loadv2(this, '.J_loading');
    server.getJSON('/Store/collectStore/store_id/' + store_id, function(res) {
      rloading['load'].hidev2();
      var data = res.data;
      if (data.status > 0) {
        self.data.the_store.is_collect = 0 - self.data.the_store.is_collect;
        self.setData({
          the_store: self.data.the_store
        });
      } else {

      }

    })
  }
  gotokefu = function(e) {
    var url = encodeURIComponent('https://live.klpfood.com/mobile/index?code=' + this.data.stores[this.data.active].code);
    wx.navigateTo({
      url: '/pages/kefu/index?url=' + url,
    })
  }
  get_about_shop = function(shop_id, p = 1) {
    var self = this;
    server.postJSON(
      '/store/about_list/', {
        id: shop_id,
        p: p,
        from: this.data.from,
        people_id: self.data.people_id
      },
      function(res) {
        if (res.data.status == 1) {
          ++self.s_p;
          if (p == 1) {
            self.setData({the_store: res.data.result[0],stores: res.data.result});
          } else {
            var ms = self.data.stores;
            for (let i = 0; i < res.data.result.length; i++) {
              ms.push(res.data.result[i]);
            }

            self.setData({stores: ms});
          }

        } else {
        }
      }
    );
  }
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad = function(options) {
    let from = options.from || 0;
    let distribut_id = options.distribut_id || 0;
    if (distribut_id > 0) {
      wx.setStorageSync('distribut_from', distribut_id);
    }

    let shop_id = options.id;
    let people_id = options.people_id || 0;
    this.setData({
      shop_id: shop_id,
      from: from,
      people_id: people_id,
      height:app.globalData.screenHeight+'px'
      });
    this.get_about_shop(shop_id, this.s_p+1);
    this.get_shop_goods(shop_id, 1);
  }
  get_shop_goods = function(shop_id, p = 1) {
    var self = this;
    if(this.loadding==true){
        return;
    }
    this.loadding = true;
    server.postJSON(
      '/Goods/goods_list/', {
        shop_id: shop_id,
        p: p
      },
      function(res) {
        const class_id = '#goods_' + shop_id;
        if (res.data.status == 1) {
          ++self.p;
          var ms = self.data.goods_list;
          if (p == 1) {
            ms[shop_id] = {
              'goods_list': res.data.result
            };
            for (let i = 0; i < res.data.result.length; i++) {
              shop_id = shop_id > res.data.result[i].store_id ? shop_id : res.data.result[i].store_id
            }
          } else {
            for (let i = 0; i < res.data.result.length; i++) {
              ms[shop_id]['goods_list'].push(res.data.result[i]);
              shop_id = shop_id > res.data.result[i].store_id ? shop_id : res.data.result[i].store_id
            }

          }
          ms[shop_id].p = p + 1;
          ms[shop_id].empty = false;
          self.setData({
            shop_id: shop_id,
            goods_list: ms
          });
        } else {
          var ms = self.data.goods_list;
          ms[shop_id] = ms[shop_id] || {};
          ms[shop_id].empty = true;
          self.setData({
            goods_list: ms
          });
          return;
        }
      },function(){
        self.loadding = false;
      }
    );
  }
  showDetail = function(e) {
    var goodsId = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    let store_id = e.currentTarget.dataset.store_id;
    if (!/^[0-9]*$/.test(goodsId)) {
      console.log(goodsId);
      return;
    }
    var src = e.currentTarget.dataset.src;
    //更新浏览次数
    if (this.data.goods_list && this.data.goods_list[store_id] && this.data.goods_list[store_id].goods_list && this.data.goods_list[store_id].goods_list[index]) {
      let i = parseInt(this.data.goods_list[store_id].goods_list[index].click_count);
      this.data.goods_list[store_id].goods_list[index].click_count = i + 1;
      this.setData({
        goods_list: this.data.goods_list
      });
    }
    this.$route("../goods/detail/detail", { id: goodsId, from: 3, src: src, cat4: store_id});
  }
  register = function() {
    var logo = this.data.logo ? this.data.logo : '';
    wx.navigateTo({
      url: "/pages/register/index?logo=" + logo + '&shop_id=' + this.data.shop_id
    })
  }
  loadImages = Util.rate(function (e, take_time, direction) {
    // console.log(e);
    if (direction.direction > 1 && direction.left < 100) {
      this.nextPage();
    }
  }, 10, 0, function (e, direction) {
    direction.left = e.detail.scrollHeight - (e.detail.scrollTop + this.data.screenHeight);
    direction.direction = e.detail.scrollTop - direction.Y;
    direction.Y = e.detail.scrollTop;
  });
  /**
   * 页面上拉触底事件的处理函数
   */
  nextPage= function() {
    console.log(this.data);
    var self = this;
    var store = self.data.stores[self.data.active];
    if (this.data.goods_list[store.store_id] == undefined) {
      return;
    }
    this.get_shop_goods(self.data.shop_id, this.data.goods_list[self.data.shop_id].p);
  }

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage = function() {
    var user_info = wx.getStorageSync('userinfo');
    var distribut_from = wx.getStorageSync('distribut_from') || 0;
    var title = '';
    if (user_info == '') {
      title = '登录再转发更好哦';
    } else {
      title = this.data.store_name;
    }
    let query = server.urlEncode({
      id: goods_id
    });
    if (user_info.is_distribut > 0) {
      title = title + '来自' + user_info.name + '的分享';
      query = server.urlEncode({
        id: goods_id,
        distribut_id: distribut_from
      });
    }
    var obj = {
      title: title
    };
    if (this.data.goods_list.length < 1) {
      obj = {
        imageUrl: "/images/assets/Group7.jpg"
      };
    }
    return obj;
  }
}
Page(new index());