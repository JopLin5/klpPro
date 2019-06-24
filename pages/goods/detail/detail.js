import server from "../../../utils/server.js";
import regeneratorRuntime from "../../../regenerator-runtime/runtime.js";
import WxParse from "../../../wxParse/wxParse.js";
import event from "../../../utils/event.js";
import Util from "../../../utils/util.js";
import Store from "../../../utils/Store.js";
import mySwiper from "../../../dist/Swiper";
const app = getApp();
let from_cat = [];
class detail {

  goods = [];
  Store = null;
  VideoContext = null;
  loadding = false;
  _p = 0;
  data = {
    userShareInfo: { user_id: 0 },
    goods_list: new Array(12),
    loaded: false,
    galleryHeight: app.globalData.screenHeight,
    is_collect: -1,
    goods_num: 1,
    pre_show: false,
    animation: "",
    showModalStatus: false,
    method: "",
    is_used: false,
    dhshow: true,
    dhhide: false,
    curr_id: -1,
    msg: false,
    top: 0,
    play_sign: true,
    options: {},
    tip: "",
    code: "",
    goodsId: "",
    last_id: 0,
    canbuy: true,
    distribut_id: 0,
    the_goods: {},
    cat4: -1,
    statusBarHeight: 0,
    nodes: [],
    buy_now: "open-type='getUserInfo' bindgetuserinfo='showModal'",
    is_play: false,
    activeTab: 0,
    coverdisplay: "block",
    src: ""
  };
  wxParseImgTap = function (e) {
    var goods_id = this.data.the_goods.goods_id;
    var nowImgUrl = e.target.dataset.src;
    let te = this.Store.get_text("as" + this.data.the_goods.goods_id + "as");
    let temp_rich = this.renderHtml(te);
    let images = temp_rich[123].imageUrls;
    wx.previewImage({
      current: nowImgUrl,
      urls: images
    });
  }
  back = function () {
    this.$navigateBack(1).
      catch(function (e) {
        console.log("失败");
        wx.switchTab({
          url: "/pages/index/index"
        })
      })
  }
  pre_share = function (e) {
    this.setData({ pre_show: true });
    console.log('分享前置');
  }
  totip = function () {
    this.setData({
      top: (app.globalData.screenHeight / 2)
    });
  }
  cover = function (e) {
    if (this.data.loaded == false) {
      this.setData({
        loaded: true
      });
    }
  }
  onUnload() {
    this.goods = [];
    event.remove(this);
    this.stopVideo();
  }
  regi_pinyou = function () {
    this.$route('/pages/shopregister/register/index');
  }
  play = function (e) {
    let is_play = this.data.is_play;
    this.VideoContext = this.VideoContext || wx.createVideoContext("video-goods-123");
    if (!is_play) {
      console.log("播放视频");
      this.VideoContext.play();
      is_play = true;
      this.setData({
        coverdisplay: "none",
        is_play: is_play
      });
    } else {
      console.log("暂停视频");
      this.VideoContext.pause();
      is_play = false;
      this.setData({
        is_play: is_play
      });
    }
    console.log(is_play)
  }
  played = function () {
    let self = this;
    if (self.data.is_play && self.data.coverdisplay != 'none') {
      self.setData({ coverdisplay: "none" });
    }
  }
  onEndCount = function () {
    this.setData({
      canbuy: false
    });
  }

  nowplay = function () {
    console.log('nowplay');
    console.log(this.data.is_play);
    let self = this;
    this.VideoContext = this.VideoContext || wx.createVideoContext("video-goods-123");
    self.setData({ is_play: true });
    setTimeout(function () {
      self.setData({ play_sign: false });
    }, 2000);
  }
  Scroll = Util.rate(function (e, take_time, direction) {
    console.log(direction);
    if (direction.direction > 1) {
      this._Scroll()
    }
  }, 50, 0, function (e, direction) {
    direction.direction = e.detail.scrollTop - direction.Y;
    direction.Y = e.detail.scrollTop
  });
  _Scroll = function () {
    if (this.data.the_goods.goods_id != this.data.activeTab) {
      let tt = [];
      try {
        let te = this.Store.get_text("as" + this.data.the_goods.goods_id + "as");
        let temp_rich = this.renderHtml(te);
        tt = temp_rich[123].nodes
      } catch (ee) {
        tt = []
      }
      this.setData({
        mynodes: tt || [],
        activeTab: this.data.the_goods.goods_id
      })
    } else { }
  }
  stopVideo = function () {
    if (this.VideoContext) {
      this.VideoContext.pause();
      this.VideoContext.exitFullScreen();
      this.setData({
        is_play: false
      })
    }
  }
  onHide = function () {
    this.stopVideo()
  }
  onGotoshop = function (e) {
    var shopId = e.currentTarget.dataset.shopid;
    let the_goods = this.data.the_goods;
    the_goods.store.num = parseInt(the_goods.store.num) + 1;
    this.setData({
      the_goods
    });
    this.$route("../../shopdetail/index", {
      id: shopId
    })
  }
  videoPlay = function (e) {
    var self = this;
    var url = e.currentTarget.dataset.src;
    var params = Util.parseUrl(url);
    var rate = 0;
    if (params.length > 1) {
      rate = params["width"] / params["height"]
    }
    this.setData({
      direction: rate > 1 ? 90 : 0,
      curr_id: e.currentTarget.dataset.id
    });
    var videoContext = wx.createVideoContext("myvideo-" + e.currentTarget.dataset.id, this);
    videoContext.requestFullScreen({
      direction: rate > 1 ? 90 : 0
    });
    videoContext.play()
  };
  gotokefu = function (e) {
    var url = "https://live.klpfood.com/mobile/index?code=" + this.data.the_goods.code;
    this.$route("/pages/kefu/index", {
      url: url
    })
  }
  propClick = function (e) {
    var pos = e.currentTarget.dataset.pos;
    var index = e.currentTarget.dataset.index;
    this.checkPrice(index, pos)
  }
  bindMinus = function (e) {
    var num = this.data.goods_num;
    if (num > 1) {
      num--
    }
    this.setData({
      goods_num: num
    })
  }
  gotolist = function () {
    event.emit("settype", "", 1);
    this.$route("/pages/goods/list/list")
  }
  bindManual = function (e) {
    var num = e.detail.value;
    this.setData({
      goods_num: num
    })
  }
  bindPlus = function (e) {
    var num = this.data.goods_num;
    num++;
    this.setData({
      goods_num: num
    })
  }
  touchmove = Util.rate(function (e, take_time) {
    this.weswiper.touchmove(e, take_time)
  }, 2);
  touchstart = function (e) {
    this.weswiper.touchstart(e)
  }
  touchend = function (e) {
    this.weswiper.touchend(e)
  }
  onLoad = function (options) {
    console.log(options);
    options = server.de(options);
    console.log("onload请求参数");
    console.log(options);
    console.log("结束");
    this.setData({
      src: options.src || ""
    });
    let self = this;
    this.Store = new Store();
    this.windowWidth = app.globalData.screenWidth;
    let goodsId = options.id || options.scene;
    let cat4 = options.cat4 || -1;
    if (options.cat) {
      from_cat = JSON.parse(options.cat)
    } else {
      from_cat = []
    }
    let distribut_id = options.distribut_id || 0;
    if (distribut_id > 0) {
      wx.setStorageSync("distribut_from", distribut_id)
    } else {
      distribut_id = wx.getStorageSync("distribut_from") || 0
    }
    this.setData({
      options: options,
      goodsId: goodsId,
      goods_list: [],
      cat4: cat4,
      galleryHeight: (app.globalData.screenHeight),
      statusBarHeight: app.globalData.statusBarHeight,
      distribut_id: distribut_id
    });
    new mySwiper({
      animationViewName: "animationData",
      slideLength: 1,
      initialSlide: 0,
      speed: 100,
      circle: 0,
      timingFunction: "linear",
      onInit(myswiper) { },
      onTouchStart(myswiper, event) { },
      onTouchMove(myswiper, event) { },
      onTouchEnd(myswiper, event) { },
      onSlideChangeStart(myswiper) {
        let the_goods = self.filter_the_goods(self.goods[myswiper.activeIndex]);
        the_goods.click_count = Util.add(the_goods.click_count, 1);
        self.goods[myswiper.activeIndex].click_count = the_goods.click_count;
        self.setData({
          the_goods: the_goods,
          coverdisplay: "block",
          is_play: false,
          play_sign: true,
          top: 0
        });
        self.update_views(the_goods.goods_id)
      },
      onSlideChangeEnd(myswiper) { },
      onTransitionStart(myswiper) { },
      onTransitionEnd(myswiper) { },
      onSlideMove(myswiper) { },
      onSlideNextEnd(myswiper) { },
      onSlidePrevStart(myswiper) {
        console.log("滑动左边:" + myswiper.activeIndex);
        self._updateVisibleData(myswiper.activeIndex)
      },
      onSlideNextStart(myswiper) {
        console.log("滑动右边:" + myswiper.activeIndex);
        self._updateVisibleData(myswiper.activeIndex)
      },
      onSlidePrevEnd(myswiper) { }
    });
    app.login().then(function () {
      self.getGoodsById(options, self.data.goodsId, distribut_id, 1, self.weswiper, cat4).then(function (list) {
        self.goods = self.goods.concat(list);
        self.weswiper.slideLength = self.goods.length;
        self.setData({
          the_goods: list[0]
        });
        self._updateVisibleData(0)
      });
      self.getshareInfo(self.data.goodsId)
    })
  }

  addCollect = function (e) {
    let self = this;
    app.check_login_AND_register(e).then(function () {
      self._addCollect(e)
    })
  };
  _addCollect = function (e) {
    var self = this;
    var goods_id = e.currentTarget.dataset.id;
    var ctype = e.currentTarget.dataset.ctype;
    self.goods[self.myswiper.activeIndex].is_collect = -self.goods[self.myswiper.activeIndex].is_collect;
    self.data.the_goods.is_collect = self.goods[self.myswiper.activeIndex].is_collect;
    self.setData({
      the_goods: self.data.the_goods
    });
    server.getJSON("/Goods/collectGoods/goods_id/" + goods_id + "/type/" + ctype, function (res) {
      var data = res.data;
      if (data.status > 0) { } else { }
    })
  }
  videoerror = function (e) {
    console.log(e)
  }
  end = function (e) {
    console.log(e)
  }
  gotoCart = function (e) {
    wx.switchTab({
      url: "../../cart/cart",
      fail: function (e) {
        console.log(e)
      }
    })
  }
  dh = function () {
    this.setData({
      dhshow: false,
      dhhide: true
    })
  }
  dh1 = function () {
    this.setData({
      dhshow: true,
      dhhide: false
    })
  }
  getGoodsById = function (options = {}, goodsId, distribut_from, pp = 1, myswiper = null, cat4 = "") {
    if (this.loadding == true) {
      true
    }
    this.loadding = true;
    let self = this
    let _data = {
      id: goodsId,
      p: pp,
      row: 10,
      cat4: cat4,
      from_cat: from_cat || [],
      distribut_from: distribut_from
    };
    _data = Object.assign(options, _data);
    return new Promise(function (success, error) {
      server.postJSON("/Goods/goods_info_list_V5/", _data, function (res) {
        if (res.data.status != 1) {
          myswiper.circle = 0;
          return
        }
        self._p = pp;
        var goodsInfo = res.data.result;
        let gallery = [];
        let tttt = new Date().getTime();
        for (let i = 0; i < goodsInfo.length; i++) {
          gallery = goodsInfo[i]["gallery"];
          goodsInfo[i].pp = pp;
          goodsInfo[i]["gallery"] = [];
          for (var y in gallery) {
            if (y > 0) break;
            goodsInfo[i]["gallery"][y] = gallery[y]
          }
          const tt = goodsInfo[i].goods_content;
          if (tt != undefined && tt != null && tt != "") {
            self.Store.save_cache_text("as" + goodsInfo[i].goods_id + "as", tt)
          }
          goodsInfo[i]["_index"] = tttt + i;
          goodsInfo[i]["item_id"] = "item_" + tttt + i;
          goodsInfo[i].goods_content = ""
        }
        success(goodsInfo)
      }, function () {
        self.loadding = false
      })
    })
  }
  info = function (e) {
    let data = e.currentTarget.dataset;
    wx.showModal({
      title: "温馨提示",
      showCancel: data.url ? true : false,
      content: data.info,
      confirmText: data.url ? "更多" : "取消",
      success: function (res) {
        if (res.confirm && data.url) {
          wx.navigateTo({
            url: data.url
          })
        }
      }
    })
  }
  renderHtml = function (content) {
    try {
      if (content == undefined || content == null || content == "") {
        return null
      }
      return WxParse.wxParse("123", "html", content || this.parserContent, this, 0)
    } catch (e) {
      console.warn("kinerHtmlParser:", "没有任何内容需要转换", e)
    }
  }
  checkPrice = function (goods_index, index = -1, pos = -1) {
    const goods = this.data.goods_list[goods_index];
    var spec = "";
    this.setData({
      price: goods.shop_price
    });
    if (goods.goods_spec_list == null || goods.goods_spec_list == undefined || goods.goods_spec_list == "") {
      return
    }
    for (var i = 0; i < goods.goods_spec_list.length; i++) {
      for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
        if (goods.goods_spec_list[i][j].isClick == 1) {
          if (spec == "") spec = goods.goods_spec_list[i][j].item_id;
          else spec = spec + "_" + goods.goods_spec_list[i][j].item_id
        }
      }
    }
    var specs = spec.split("_") || [];
    for (var i = 0; i < specs.length; i++) {
      specs[i] = parseInt(specs[i])
    }
    specs.sort();
    spec = "";
    for (var i = 0; i < specs.length; i++) {
      if (spec == "") spec = specs[i];
      else spec = spec + "_" + specs[i]
    }
    console.log(spec);
    if (goods["spec_goods_price"][spec] == undefined || goods["spec_goods_price"][spec] == "" || goods["spec_goods_price"][spec] == null) {
      server.Toast_error("商家未设置此规格");
      return
    }
    if (index > -1 && pos > -1) for (var i = 0; i < goods.goods_spec_list[index].length; i++) {
      if (i == pos) goods.goods_spec_list[index][pos].isClick = 1;
      else goods.goods_spec_list[index][i].isClick = 0
    }
    var price = goods["spec_goods_price"][spec].price;
    console.log(price);
    this.setData({
      price: price,
      goods: goods
    })
  }
  reqiestbuy = function () {
    let self = this;
    this.stopVideo();
    let goods = this.data.the_goods;
    let pomise = new Promise(function (success, error) {
      server.postJSON("/Goods/check", {
        goods_id: goods.goods_id,
        goods_num: self.data.goods_num
      }, function (res) {
        if (res.data.status == 1) {
          success()
        } else {
          server.Toast_error(res.data.msg);
          return
        }
      })
    });
    pomise.then(function () {
      self.bug()
    })
  }
  bug = function () {
    var goods = this.data.the_goods;
    var spec = ""
    if (goods.goods_spec_list != null) {
      for (var i = 0; i < goods.goods_spec_list.length; i++) {
        for (var j = 0; j < goods.goods_spec_list[i].length; j++) {
          if (goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "") spec = goods.goods_spec_list[i][j].item_id;
            else spec = spec + "_" + goods.goods_spec_list[i][j].item_id
          }
        }
      }
    }
    var specs = spec.split("_") || [];
    for (var i = 0; i < specs.length; i++) {
      specs[i] = parseInt(specs[i])
    }
    specs.sort();
    spec = "";
    for (var i = 0; i < specs.length; i++) {
      if (spec == "") spec = specs[i];
      else spec = spec + "_" + specs[i]
    }
    var that = this;
    var goods_id = goods.goods_id;
    var goods_spec = spec;
    var goods_num = that.data.goods_num;
    let query = server.urlEncode({
      "goods_id": goods_id,
      "goods_spec": goods_spec,
      "goods_num": goods_num
    });
    wx.navigateTo({
      url: "../../../../../../order/buynow/checkout?" + query
    });
    return
  }
  addCart = function (e) {
    let self = this;
    app.check_login_AND_register(e).then(function () {
      self._addCart()
    })
  }
  _addCart = function () {
    var user_info = wx.getStorageSync("userinfo");
    if (!server.check_login()) {
      return
    }
    var goods = this.data.the_goods;
    var spec = "";
    if (goods.goods_spec_list != null) {
      for (var i = 0; i < goods.goods_spec_list.length; i++) {
        for (var j = 0; j < goods.goods_spec_list[i].length; j++) {
          if (goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "") {
              spec = goods.goods_spec_list[i][j].item_id
            } else {
              spec = spec + "_" + goods.goods_spec_list[i][j].item_id
            }
          }
        }
      }
    }
    var that = this;
    var goods_id = goods.goods_id;
    var goods_spec = spec;
    var goods_num = that.data.goods_num;
    server.postJSON("/Cart/addCart", {
      goods_id: goods_id,
      goods_spec: goods_spec,
      goods_num: goods_num
    }, function (res) {
      if (res.data.status == 1) {
        server.Toast_error("已加入购物车")
      } else {
        server.Toast_error(res.data.msg)
      }
    })
  }
  getshareInfo = function (goods_id = 0) {
    let self = this;
    server.postJSON("/Rebase/rebase_relation", {
      goods_id: goods_id
    }, function (info) {
      self.setData({ userShareInfo: info.data.result });
    })
  }
  onShareAppMessage = function (e) {
    var user_info = wx.getStorageSync("userinfo");
    let goods_id = this.data.the_goods.goods_id || this.data.options.id;
    let store_id = this.data.the_goods.store_id;
    var title = "";
    if (user_info == "") {
      title = "登录再转发更好哦"
    } else {
      title = this.data.the_goods.goods_name
    }
    let from = ["1", "2"].includes(this.data.options.from + "") ? 3 : this.data.options.from;
    let queryOb = Object.assign(this.data.options, {
      id: goods_id,
      cat4: from == 3 ? store_id : this.data.cat4,
      from: from
    });
    if (this.data.userShareInfo != undefined && Object.keys(this.data.userShareInfo).length > 0) {
      title = title + this.data.userShareInfo.name;
      queryOb.distribut_id = user_info.user_id
    }
    let query = server.urlEncode(queryOb);
    console.log("分享参数");
    console.log(query);
    var obj = {
      title: title,
      path: "/pages/goods/detail/detail?" + query
    };
    if (goods_id > 0) {
      obj.imageUrl = this.data.the_goods.gallery[0]._imge
    } else {
      obj.imageUrl = "/images/Group7.jpg"
    }
    return obj
  }
  showModal = function (e) {
    let self = this;
    app.check_login_AND_register(e).then(function () {
      self.buychoice()
    })
  };
  buychoice = function () {
    if (this.data.the_goods.store.store_state != 1) {
      server.Toast_error(this.data.the_goods.store.store_close_info || "此店是新店，商品仅供展示，12小时后才可购买哦");
      return
    }
    let animation = wx.createAnimation({
      duration: 200,
      timingFunction: "ease-out",
      delay: 0
    });
    animation.translateY(300).step();
    this.setData({
      animation: animation.export(),
      showModalStatus: true
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animation: animation.export()
      })
    }.bind(this), 10)
  }
  hideModal = function (e) {
    this.setData({
      showModalStatus: false,
      is_used: false
    })
  };
  previewImage = function (e) {
    if (this.data.the_goods.gallery.length < 1) return "";
    let pic = [];
    for (let i in this.data.the_goods.gallery) {
      pic.push(this.data.the_goods.gallery[i].imge)
    }
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: pic
    })
  }
}
Page(new detail());