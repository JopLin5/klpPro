import server from '../../../utils/server.js';
import Util from '../../../utils/util.js';
import event from '../../../utils/event.js';
const app = getApp()
var scrollTop = 0;
var timestamp = 0;
class index{
  loadding=false;
  data = {
    clientHeight: 0,
    goods_list: {},
    entries: [],
    cats: [{
      path: '',
      name: ''
    }],
    topheight: 82,
    height: '618rpx',
    typeshow: true,
    searchfocus: false,
    active: 0, //页面
    afix: false,
    _num: 0, //分类,
    isShow: true,
    pixelRatio: 0,
    goodsheight: 0
  };
  OnShow=function(){
    this.setData({
      typeshow: true
    });
   
  }
  //分类切换
  tabb = function (e) {
    var num = e.currentTarget.dataset.num || e.detail.current;
    this.setData({
      _num: num
    });
  }
  //获取分类
  get_next_cat = function (id = []) {
    let that = this;
    server.postJSON('/Goods/next_cat', {
      id: id
    }, function (res) {
      if (res.data.status != 1) return;
      let temp = res.data.result;
      let cat = that.data.cat.concat(temp);
      that.setData({
        cats: cat
      });
    });
  }
  //页面切换
  changePage = function (e) {
    var self = this;
    let num = e.detail.current;
    if ((self.data.cats.length - e.detail.current)<3){
        //加载下一级全部分类
      this.get_next_cat(self.data.cats[self.data.cats.length - 1].key);
    }
    this.setData({active: num});
    if (self.data.goods_list[num] == undefined || self.data.goods_list[num].list == undefined || self.data.goods_list[num].list.length < 1) {
      self.getGoods(this.data.active, 1, '', self.data.cats[this.data.active], true);
      return;
    }
  }
  listenerPhoneInput = function () {
    this.settype();
  }
  myRoute = function (e) {
    var url = e.currentTarget.dataset.url;
    wx.switchTab({
      url: url
    });
  }
  // 显示分类
  settype = function () {
    console.log('123');
    if (this.data.mset == undefined || this.data.mset == '') {
      return;
    }
    var self = this;
    this.setData({
      typeshow: true,
      scroll: false,
      searchfocus: true
    })
    this.get_wxmls(['#swiper_cat', '#cat_2'], function (t) {
      if (t == null || t[0] == null) return;
      self.setData({ height: (t[1].top - t[0].top) + 'px' });
    });
  }
  mode = function () {
    this.setData({
      afix: false,
      typeshow: false,
      searchfocus: false
    })
  }
  bindKeyInput = function (e) {
    this.setData({searchInput: e.detail.value})
  }

  selecttype = function (e) {
    var select = {};
    switch (this.data._num) {
      case 0:
        select = this.data.mset.mi;
        break;
      case 1:
        select = this.data.mset.food;
        break;
      case 2:
        select = this.data.mset.rest;
        break;
    }
    try{

    
    var _class = e.currentTarget.dataset.class;
    var _index = e.currentTarget.dataset.key;
    if (_class == '1') {

      if (select['state'] == _index) {
        select['state'] = -1;
      } else {
        select['state'] = _index;
      }
      var index = e.currentTarget.dataset.index;
      select['two']['optoins'] = select.cat[index]['options'];
      select['two']['state'] = -1;
      select['two']['three_state'] = -1;
    } else if (_class == '2') {
      if (select['two']['state'] == _index) {
        select['two']['state'] = -1;
        select['two']['three_state'] = -1;
      } else {
        var one = e.currentTarget.dataset.one;
        select['state'] = one;
        select['two']['state'] = _index;
      }

    } else if (_class == '3') {
      var tindex = e.currentTarget.dataset.tkey;
      var one = e.currentTarget.dataset.one;
      select['state'] = one;
      select['two']['state'] = tindex;
      if (select['two']['three_state'] == _index) {
        select['two']['three_state'] = -1;
      } else {
        select['two']['three_state'] = _index;
      }
    }
    } catch (_error) {
      console.error(_error);
    }
    this.setData({
      mset: this.data.mset
    });
  }
  shop_list = function (keyWord) {
    var self = this;
    server.postJSON('/Activity/activity_list', {
      keyWord: keyWord
    }, function (res) {
      wx.hideLoading();
      if (res.data.status == 1) {
        self.setData({
          entries: res.data.result
        });
      } else {
        server.Toast_error('没有找到店铺，更新列表', null, 2500);
      }
    });
  }
  search = function (e) {
    let self = this;
    let keyWord = this.data.keyWord || '';
    wx.navigateTo({
      url: '../search/list?keyword=' + keyWord,
    })
  };
  sure = function () {
    let select = {};
    let channel = -1;
    switch (this.data._num) {
      case 0:
        channel = 1;
        select = this.data.mset.mi;
        break;
      case 1:
        channel = 0;
        select = this.data.mset.food;
        break;
      case 2:
        channel = 2;
        select = this.data.mset.rest;
        break;
    }
    let cat = {};
    cat.path = [];
    cat.name = '';
    if (select['state'] < 0) {
      server.Toast_error('请选择详细分类');
       return;
    }
    let first = Util.get_array_elem(select.cat, 'id', select['state']);
    cat.name = first.name;
    cat.path.push(first.id);
    if (select['two']['state'] > -1) {
      let sec = Util.get_array_elem(first.options, 'id', select['two']['state']);
      cat.name = cat.name + '>' + sec.name;
      cat.path.push(sec.id);
      if (select['two']['three_state'] > -1) {
        let three = Util.get_array_elem(sec.options, 'id', select['two']['three_state']);
        cat.name = cat.name + '>' + three.name;
        cat.path.push(three.id);
      }
    }
    this.setData({
      typeshow: false,
      active: 0,
      goods_list: []
    });
    this.get_cat(cat.path, channel);
  }
  //获取分类
  get_cat = function (id = [], channel = -1) {
    let that = this;
    let p=new Promise(function(sucess,error){
      server.postJSON('/Goods/cat', {
        cats: id,
        channel: channel
      }, function (res) {
        if (res.data.status != 1) return;
        let cat = res.data.result;
        that.getGoods(0, 1, '', cat[0], true);
        that.setData({
          cats: cat,
          winHeight: app.globalData.screenHeight + 'px'
        });
      });
    });
   

  }
  showt = function () {
    wx.navigateBack({
      delta: 1
    })
  }
  delexit = function () {
    this.settype();
    let select = this.data.mset.food;
    select['state'] = -1;
    select['two']['state'] = -1;
    select['two']['three_state'] = -1;
    let select1 = this.data.mset.mi;
    select1['state'] = -1;
    select1['two']['state'] = -1;
    select1['two']['three_state'] = -1;
    let select2 = this.data.mset.rest;
    select2['state'] = -1;
    select2['two']['state'] = -1;
    select2['two']['three_state'] = -1;
    this.setData({
      typeshow: true,
      mset: this.data.mset
    });
    this.get_cat();
  }
  del = function () { this.setData({ keyWord: '' }); }
  //关键字
  onchage = function (e) {
    this.setData({ keyWord: e.detail.value });
  };
  loadcate = function (e) {
    var self = this;
    let cat = app.globalData.cat;
    if (cat != undefined && cat != '') {
      let mset = {};
      try {
        mset['food'] = {};
        mset['food']['cat'] = cat.food;
        mset['food']['state'] = -1;
        mset['food']['two'] = {};
        mset['food']['two']['state'] = -1;
        mset['food']['two']['three_state'] = -1;
        mset['food']['two']['optoins'] = cat.food && cat.food[0] && cat.food[0]['options'];
        //====================
        mset['mi'] = {};
        mset['mi']['cat'] = cat.material;
        mset['mi']['state'] = -1;
        mset['mi']['two'] = {};
        mset['mi']['two']['state'] = -1;
        mset['mi']['two']['three_state'] = -1;
        mset['mi']['two']['optoins'] = cat.material && cat.material[0] && cat.material[0]['options'];
        //==========================
        mset['rest'] = {};
        mset['rest']['cat'] = cat.rest;
        mset['rest']['state'] = -1;
        mset['rest']['two'] = {};
        mset['rest']['two']['state'] = -1;
        mset['rest']['two']['three_state'] = -1;
        mset['rest']['two']['optoins'] = cat.rest && cat.rest[0] && cat.rest[0]['options'];
      } catch (e) { }
      this.setData({
        mset: mset
      });
    }
  }
  chacat = function () {
    return new Promise(function (success, error) {
      if (app.globalData.cat.length > 1) {
        success();
        return;
      }
      server.postJSON('/Goods/goodsCategoryListv2',
        {}, function (res) {
          if (res.data.status != 1) {
            throw '获取分类失败';
          }
          app.globalData.cat = res.data.result;
          console.info('获取分类');
          success();
        }).catch(function (e) {
          console.error(e);
          wx.redirectTo({
            url: "/pages/index/index",
          })
        });
    });
  }
  onReady = function () {
    this.getSysyteminfo();
    let goodsheight = this.data.totalTopHeight + 58 / this.data.pixelRatio;
    this.setData({ goodsheight: goodsheight });
  }
  onLoad = function (options) {
    var self = this;
    this.chacat().then(function () {
      self.loadcate();
    }).then(function () {
      self.settype();
    });
    event.on('settype', this, function(index, num) {
      this.settype();
    });
    //加载分类商品
    // this.get_cat();
  };

  sureToFirstGoods = function () {
    let Y = this.data.goods_list[this.data.active] && this.data.goods_list[this.data.active].list;
    if (!Y) {
      server.Toast_error('列表为空');
      return;
    }
    Y = Y[0];
    if (Y == undefined) {
      server.Toast_error('列表为空');
      return;
    }
    wx.navigateTo({
      url: "../../goods/detail/detail?id=" + Y.goods_id + "&index=0"
    });
  };
  showImg = function () {
    var self = this;
    let group = this.data.goods_list;
    let height = this.data.clientHeight; // 页面的可视高度
    wx.createSelectorQuery().selectAll('.single-goods').boundingClientRect(function (ret) {
      ret.forEach((item, index) => {
        //console.log(item);
        if (-1000 < item.top && item.top <= height + 1000) {
          group[index].show = true; // 根据下标改变状态
        } else {
          group[index].show = false;
        }
      });
      self.setData({
        goods_list: group
      })
    }).exec()
  };
  showDetail = function (e) {
    let goodsId = e.currentTarget.dataset.goodsId;
    var src = e.currentTarget.dataset.goodsSrc;
    src = encodeURIComponent(src);
    let index = e.currentTarget.dataset.index;
    let idx = e.currentTarget.dataset.idx;
    if (!/^[0-9]*$/.test(goodsId)) {
      return;
    }
    this.data.goods_list[index]['list'][idx].click_count = parseInt(this.data.goods_list[index]['list'][idx].click_count) + 1;
    this.setData({ goods_list: this.data.goods_list });
    let cat = JSON.stringify(this.data.cats[this.data.active].path);
    wx.navigateTo({
      url: "../../goods/detail/detail?id=" + goodsId + "&circular=false&from=4&cat=" + cat+'&src=' + src
    });
  };
  //获取分页
  getGoods = function (active = 0, page, keyWord = '', cat = [], reload = false) {
    var self = this;
    if (this.loadding == true) {
      return;
    }
    this.loadding = true;
    server.postJSON('/Goods/get_goods_by_cats', {
      p: page,
      keyWord: keyWord,
      cat: cat.path,
      row: 10,
      last_id: page > 1 ? self.data.goods_list[active].last_id : 0
    }, function (res) {
     
      if (res.data.status == 1) {
        var ms = self.data.goods_list;
        if (page == 1 || reload) {
          ms[active] = {
            'list': res.data.result,
            'last_id': 0,
            'p': 0
          };
          for (let i = 0; i < res.data.result.length; i++) {
            ms[active].last_id = ms[active].last_id > res.data.result[i].goods_id ? ms[active].last_id : res.data.result[i].goods_id
          }
        } else {
          for (let i = 0; i < res.data.result.length; i++) {
            ms[active]['list'].push(res.data.result[i]);
            ms[active].last_id = ms[active].last_id > res.data.result[i].goods_id ? ms[active].last_id : res.data.result[i].goods_id
          }
        }
        ms[active].p = page + 1;
        ms[active].empty = false;
        self.setData({
          goods_list: ms
        });
      } else {
        let ms = self.data.goods_list;
        ms[active] = ms[active] || { 'empty': true, 'list': [] };
        ms[active].empty = true
        if (page == 1 || reload) {
          ms[active].list = [];
        }
        self.setData({
          goods_list: ms
        });
      }
    },function(){
      self.loadding=false;
    });

  };
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
  nextPage=function(){
    let p = typeof (this.data.goods_list[this.data.active]) == 'undefined' ? 1 : this.data.goods_list[this.data.active].p;
    this.getGoods(this.data.active, p, this.data.keyWord, this.data.cats[this.data.active]);
  }
  onPullDownRefresh = function () {
    if (this.data.afix) {
      wx.stopPullDownRefresh();
      return;
    }
    this.getGoods(this.data.active, 1, this.data.keyWord, this.data.cats[this.data.active]);
  };
  onShareAppMessage = function (e) {
    let self = this;
    var user_info = wx.getStorageSync('userinfo');
    var distribut_from = wx.getStorageSync('distribut_from') || 0;
    var title = '';
    if (user_info == '') {
      title = '登录再转发更好哦';
    } else {
      title = '农产品 有机食物 ';
    }
    let query = server.urlEncode({ 'name': '首页' });
    if (user_info.is_distribut > 0) {
      title = title + '来自' + user_info.name + '的分享';
      query = server.urlEncode({ distribut_id: distribut_from });
    }
    console.log(this);
    var obj = {
      title: title,
      path: '/' + self.route + '?' + query
    };
    if (this.data.goods_list.length < 1) {
      obj = { imageUrl: "/images/assets/Group7.jpg" };
    }
    return obj;
  }
}
Page(new index());