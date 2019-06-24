import server from '../../utils/server.js';
import Util from '../../utils/util.js';
import regeneratorRuntime from '../../regenerator-runtime/runtime.js';
var app = getApp()
var cPage=0;
var sPage = 0;
class cart {
  loadding=false;
  data={
    carts: [],
    goodsList: [],
    empty: false,
    swipeable:true,
    minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
    selectedAllStatus: false,
    total:0,
    goods_list:[],
    entries:[],
    active:0,
    winHeight:0,
    isShow:true,
    totalTopHeight:64
  };

  onLoad=function (option) {
    var that = this;
    this.getSysyteminfo();
    that.setData({ winHeight: app.globalData.windowHeight -(198/app.globalData.pixelRatio), active:0})
  };

  bindMinus=function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var cart_id = parseInt(e.currentTarget.dataset.cartid);
    var num = this.data.carts[cart_id]['goods'][index].goods_num;
    // 如果只有1件了，就不允许再减了
    if (num <= 1) {
       return;
    }
    num--;
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 购物车数据
    var carts = this.data.carts;
    carts[cart_id]['goods'][index].goods_num = num;
    // 按钮可用状态
    var minusStatuses = this.data.minusStatuses;
    minusStatuses[index] = minusStatus;
    // 将数值与状态写回
    this.setData({
      carts: carts,
      minusStatuses: minusStatuses
    });
    // update database
    //carts[index].save();
    this.saveNum(carts[cart_id]['goods'][index].id, num);
    this.sum();
  };
  saveNum=function(cart_id,num){
    server.postJSON('/Cart/updateNum/',{
      id: cart_id,
      num:num
    }, function (res) {

    });
  };

  bindPlus=function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var idx = parseInt(e.currentTarget.dataset.cartid);
    var num = this.data.carts[idx]['goods'][index].goods_num;
    // 自增
    num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 购物车数据
    var carts = this.data.carts;
    carts[idx]['goods'][index].goods_num = num;
    // 按钮可用状态
    var minusStatuses = this.data.minusStatuses;
    minusStatuses[index] = minusStatus;
    // 将数值与状态写回
    this.setData({
      carts: carts,
      minusStatuses: minusStatuses
    });
    this.saveNum(carts[idx]['goods'][index].id, num);
    this.sum();
  };
  bindManual=function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var idx = parseInt(e.currentTarget.dataset.cartid);
    var carts = this.data.carts;
    var num = e.detail.value;
    carts[idx]['goods'][index].goods_num = num;
    // 将数值与状态写回
    this.setData({
      carts: carts
    });
    this.saveNum(carts[idx]['goods'][index].id, num);
    this.sum();
  };
  bindCheckbox=function (e) {
    /*绑定点击事件，将checkbox样式改变为选中与非选中*/
    //拿到下标值，以在carts作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    var idx = parseInt(e.currentTarget.dataset.idx);
    //原始的icon状态
    var selected = this.data.carts[idx]['goods'][index].selected;
    var carts = this.data.carts;
    // 对勾选状态取反
    carts[idx]['goods'][index].selected = !selected;
    // 写回经点击修改后的数组
    this.setData({
      carts: carts,
    });
    this.sum();
  };
  bindSelectAll= function () {
    // 环境中目前已选状态
    var selectedAllStatus = !this.data.selectedAllStatus;
    // 购物车数据，关键是处理selected值
    var carts = this.data.carts || [];
    // 遍历
    for (var i in carts) {
      for (var y in carts[i]['goods']){
        carts[i]['goods'][y].selected =selectedAllStatus;
      }
    }
    this.setData({
      selectedAllStatus: selectedAllStatus,
      carts: carts,
    });
    this.sum();
  };
  bindCheckout=function () {
    // 遍历取出已勾选的cid
    // var buys = [];
    var cartIds = [];
    var carts = this.data.carts||[];

    for (var i in carts) {
      for (var y in carts[i]['goods']) {
        if (carts[i]['goods'][y].selected) {
          cartIds.push(carts[i]['goods'][y].id);
        }
      }
    }
    if (cartIds.length <= 0) {
      wx.showToast({
        title: '请勾选商品',
        icon: 'success',
        duration: 1000
      })
      return;
    }
    let pomise = new Promise(function (success, error) {
      server.postJSON('/Goods/checkCart', { cartIds }, function (res) {
        if (res.data.status == 1) {
          success();
        } else {
          server.Toast_error(res.data.msg);
          return;
        }
      });
    });
    pomise.then(function () {
      wx.navigateTo({
        url: '../../../../order/checkout/checkout?cartIds=' + cartIds
      });
    });

  };
  getCarts=function () {
    var minusStatuses = [];
    var that = this;
   var  distribut_from = wx.getStorageSync('distribut_from') ||0;
    server.postJSON(
      '/Cart/cartList/',
      {distribut_from:distribut_from},
      function (res) {
        var carts = res.data.result || [];
        if (res.data.status<1) {
          that.setData({ empty: true });
          return;
        }
        var selectedAllStatus = that.data.selectedAllStatus;
        var goods_num=0;
        var shop_num=0;
        for (var i in carts){
          shop_num = shop_num+1;
          goods_num = goods_num + carts[i].goodnum;
          for (var y in carts[i]['goods']){
            carts[i]['goods'][y]['selected'] =selectedAllStatus
            carts[i]['goods'][y]['goods_name'] = Util.iGetInnerText(carts[i]['goods'][y]['goods_name']);
          }
        }
        that.setData({ carts: carts,empty:false});
        that.sum();
      }
    );
  };

  see = function (e) {
    var goodsId = e.currentTarget.dataset.id;
    this.$route("../goods/detail/detail", { from: 2, id: e.currentTarget.dataset.id});
  };
  onShow=function () {
    let  user_info = wx.getStorageSync('userinfo');
    let  self=this;
    if (user_info == '') {
        app.login().then(function(){
        self._onShow();
      });
    }else{
      self._onShow();
    }
   

  };
  _onShow=function(){
    this.getCarts();
    this.sum();
  }
  sum=function () {
    var carts = this.data.carts;
    // 计算总金额
    var total = 0;
    var good={};
    for (var i in carts) {
      for ( var y in carts[i]['goods']){
        good = carts[i]['goods'][y];
        var goods_price = good.goods_price*100;
        total += good.selected ? good.goods_num * goods_price : 0;
      }

    }
    total = total / 100;
    // 写回经点击修改后的数组
    this.setData({
      carts: carts,
      total: total.toFixed(2)
    });
  };
  deleteCart= function (e) {
    if (!server.check_login()) {
      return;
    }
    var index = parseInt(e.currentTarget.dataset.index);
    var idx = parseInt(e.currentTarget.dataset.cartid);
    var id = this.data.carts[idx]['goods'][index]['id'];
    var that = this

    server.getJSON('/Cart/delCart/id/' + id, function (res) {
      that.data.carts[idx]['goods'].splice(index,1);
      if (that.data.carts[idx]['goods'].length==0){
        that.data.carts.splice(idx,1);
      }
      that.setData({ carts: that.data.carts});
    });

  };
  // 店铺详情跳转
  detail = function (e) {
    this.$route('../shopdetail/index', e.currentTarget.dataset);
  }
  showDetail = function (e) {
    this.$route("../goods/detail/detail", e.currentTarget.dataset);
  };

  colletion_scroll = Util.rate(function (e, take_time, direction) {
    // console.log(e);
    if (direction.direction > 1 && direction.left < 100) {
      this.getGoods(++cPage);
    }
  },50, 0, function (e, direction) {
    direction.left = e.detail.scrollHeight - (e.detail.scrollTop + this.data.screenHeight);
    direction.direction = e.detail.scrollTop - direction.Y;
    direction.Y = e.detail.scrollTop;
  });

  getGoods = function (pageIndex=1, keyWord='', cat, reload = false) {
    if (reload) {
      pageIndex = 1;
      cPage = 1;
    }
    
    let that = this;
    let last_id = 0;
    if (this.loadding==true){
      return;
    }
    this.loadding=true;
    server.postJSON('/User/my_collection/',
      {
        p: pageIndex,
        keyWord: keyWord,
        cat: cat,
        last_id: last_id
      }, function (res) {
        if (res.data.status != 1) {
          that.setData({
            empty:true
          });
          if (reload){
            that.setData({
              goods_list:[]
            });
          }
          if (cPage == 1) {
          } else {
            cPage--;
          }
          return;
        }
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
          empty: false,
          goods_list: ms
        });
      },function(){
        that.loadding = false;
      });

  };
}
Page(new cart())