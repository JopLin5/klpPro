import server from '../../utils/server.js';
import Util from '../../utils/util.js';
import regeneratorRuntime from '../../regenerator-runtime/runtime.js';
var app = getApp()
var cPage = 0;
var sPage = 0;
class cart{
  loadding = false;
  data = {
    carts: [],
    goodsList: [],
    empty: false,
    swipeable: true,
    minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
    selectedAllStatus: false,
    total: 0,
    goods_list: [],
    entries: [],
    active: 0,
    winHeight: 0,
    col_empty: false,
    totalTopHeight: 64
  };

  shop_list = function (keyWord) {
    var self = this;
    server.postJSON('/store/collect_store_list',
      {
        keyWord:keyWord
      }, function (res) {
        var num = res.data.result.length;
        if (res.data.status == 1) {
          self.setData({
            entries: res.data.result
          });
        } else {
          self.setData({
            entries: []
          });
        }
      });
  }
  onLoad = function (option) {
    cPage=0;
    sPage=0;
    this.getGoods(cPage+1, '', '', true);
    var that = this;
    this.getSysyteminfo();
    that.setData({ winHeight: app.globalData.windowHeight - (198 / app.globalData.pixelRatio), active: 0 })
  };
  see = function (e) {
    var goodsId = e.currentTarget.dataset.id;
    this.$route("../goods/detail/detail", { from: 2, id: e.currentTarget.dataset.id });
  };
  onShow = function () {
    let user_info = wx.getStorageSync('userinfo');
    let self = this;
    if (user_info == '') {
      app.login().then(function () {
        self._onShow();
      });
    } else {
      self._onShow();
    }


  };
  onChange = function (event) {
    let that = this;
    var index = event.target.dataset.num || event.detail.current;
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    this.setData({active: index});
    if (index ==0) {
      this.getGoods(cPage+1, '', '', true);
    }
    if (index ==1) {
      this.shop_list('');
    }
  };
  _onShow = function () {
    if (this.data.active == 0) {
      this.getGoods(cPage+1, '', '', true);
    }else
    if (this.data.active == 1) {
      this.shop_list('');
    }
  }
  
  // 店铺详情跳转
  detail = function (e) {
    this.$route('../shopdetail/index', e.currentTarget.dataset);
  }
  showDetail = function (e) {
    this.$route("../goods/detail/detail", e.currentTarget.dataset);
  };

  colletion_scroll = Util.rate(function (e, take_time, direction) {
    
    if (direction.direction > 1 && direction.left < 100) {
      this.getGoods(cPage+1);
    }
  },30, 0, function (e, direction) {
    direction.left = e.detail.scrollHeight - (e.detail.scrollTop + this.data.screenHeight);
    direction.direction = e.detail.scrollTop - direction.Y;
    direction.Y = e.detail.scrollTop;
  });

  getGoods = function (pageIndex = 1, keyWord = '', cat, reload = false) {
    if (reload) {
      pageIndex = 1;
      cPage =0;
    }

    let that = this;
    let last_id = 0;
    if (this.loadding == true) {
      return;
    }
    this.loadding = true;
    server.postJSON('/User/my_collection/',
      {
        p: pageIndex,
        keyWord: keyWord,
        cat: cat,
        last_id: last_id
      }, function (res) {
        if (res.data.status != 1) {
          that.setData({
            col_empty: true
          });
          if (reload) {
            that.setData({
              goods_list: []
            });
          }
          return;
        }
        ++cPage;
        var newgoods = res.data.result
        var ms = [];
        if (reload) {
        } else {
          ms = that.data.goods_list;
        }
        for (var i in newgoods) {
          ms.push(newgoods[i]);
        }

        that.setData({
          col_empty: false,
          goods_list: ms
        });
      }, function () {
        that.loadding = false;
      });

  };
}
Page(new cart())