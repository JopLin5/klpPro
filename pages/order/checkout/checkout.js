var server = require('../../../utils/server');
var tool = require('../../../utils/util');
var event = require('../../../utils/event.js');
var timeout = null
var exit=0;
Page({
  data: {
    amount: 0,
    hasAddress: false,
    cartIds: [],
    address: [],
    height: 0,
    orders: [],
    msg:'',
    ids: null,
    yunPrice: 0,
    address_id: 0,
    address_back: 0,
    index: 0,
    code: '',
    allGoodsPrice: 0,
    is_used: false,
    all_total:0.00
  },
  addressObjects: [],

  onShow: function () {
    this.calculate(this.data.cartIds, this.data.address_id);
  },
  calculate: function (cartIds, address_id){
    var that = this;
    if (cartIds.length < 1) {
      wx.showToast({
        title: '没商品',
        icon: 'success',
        duration: 1000
      })
      return;
    }
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON('/cart/cart2/', {cartIds,address_id }, function (res) {
      rloading['load'].hidev2();
      if (res.data.status != 1) {
        server.Toast_error(res.data.msg);
        return;
      }
      exit = 1;
      var address_id = '';
      if (res.data.result.address) {
        address_id = res.data.result.address.address_id
      }
      that.setData({
        cartIds: cartIds,
        hasAddress: true,
        address: res.data.result.address,
        address_id: address_id,
        orders: res.data.result,
      });
      that.sum();
    });
  },
  onLoad: function (options) {
    var that = this;
    event.on('OrderAddressChanged', this, function (address_id) {
      this.setData({
        address_id: address_id
      });
    });
    var cartIds_string = options.cartIds || '';
    var cartIds = cartIds_string.split(',');
    this.setData({
      cartIds: cartIds
    });
  },

  addaddress: function (e) {
    var address_id = this.data.address_id || 0;
    var param = new Array();
    param["select_address_id"] = address_id;
    param["from"] = 'order';
    var param_query = server.urlEncode(param, null, false);
    if (address_id>0) {
      wx.navigateTo({
        url: '../../../../../../address/list/list?' + param_query
      });
      return;
    }
    wx.navigateTo({ url: '../../../../../../address/add/add?' + param_query });
  },
  pickChange: function (e) {
    var that = this;
    var index= e.detail.value;
    var store_id=e.currentTarget.dataset.store;
    var code = that.data.orders.shippingList[store_id][index].shipping_code;
    var goods = that.data.orders.cartList[store_id].goods;
    var ids=[];
    for (var i in goods){
      ids[i] = goods[i].id;
    }
    if(ids==false){
      wx.showToast({
        title: '商品为空',
        icon: 'success',
        duration: 1000
      })
      return;
    }
    if (that.data.address_id < 0) {
      wx.showToast({
        title: '选择地址',
        icon: 'success',
        duration: 1000
      })
      return;
    }
    server.postJSON('/cart/calculate_freight2/', { address_id: that.data.address_id, shippingcode: code, cartIds: ids }, function (res) {
      if (res.data.status!=1){
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1000
        })
        return;
      }
      var yunPrice = parseInt(res.data.result * 100);
      var msg = yunPrice==0?res.data.msg:'';
      yunPrice = yunPrice / 100.0;
      var order = that.data.orders;
      order['cartList'][store_id]['shipping_name'] = that.data.orders.shippingList[store_id][index]['name'];
      order['cartList'][store_id]['shipping_code'] = that.data.orders.shippingList[store_id][index]['shipping_code'];
      order['cartList'][store_id]['shipping_price']['msg'] = msg;
      order['cartList'][store_id]['shipping_price']['fee'] = yunPrice;
      that.setData({
        orders:order
      })
      that.sum();
    });

  },
  sum: function () {
    var that = this;
    var orders = that.data.orders;
    var stores = orders.cartList;
    var total = 0;
    var yunPrice=0;
    for (var i in stores) {
      stores[i]['total']=0;
      for(var j in stores[i].goods){
        var goods_price = parseInt(stores[i].goods[j].goods_price.replace(".", ""));
        var goods_num= parseInt(stores[i].goods[j].goods_num)
        var price =goods_price * goods_num;
        stores[i]['total'] = stores[i]['total'] + price;
      }
      total +=stores[i]['total'];
      stores[i]['total'] =(stores[i]['total']/100.00).toFixed(2);
      yunPrice+=stores[i]['shipping_price']['fee'];
    }
    orders.cartList = stores;
    total = total / 100.00;
    that.setData({
      orders: orders,
      yunPrice: yunPrice,
      allGoodsPrice: total,
      all_total: total.toFixed(2)
    });
  },
  liuyanChange:function(e){
    var store_id = e.currentTarget.dataset.store;
     var va=e.detail.value;
     var order = this.data.orders;
     order['cartList'][store_id]['remark'] = va;
     this.setData({
       orders: order
     })

  },
  createOrder: function (e) {
    var user_info = wx.getStorageSync('userinfo'); 
    if (!server.check_login()) {
      return;
    }
    var distribut_from = wx.getStorageSync('distribut_from')|| 0;

    if (exit != 1) {
      server.Toast_error('你已经提交过了');
      wx.redirectTo({
        url: '../orderpay/payment'
      });
      return;
    }
    exit = 0;
    var that = this;
    //地址
    var address_id = e.detail.value.address_id;
    
    //商品
    var ids = that.data.orders['cartList'];
    var index = that.data.index;
    var  store=[];
    if (address_id < 1 || address_id == undefined) {
      wx.navigateTo({ url: '../../../../../../address/add/add' });
      return;
    }
    if (ids == '' || ids == undefined) {
      wx.showToast({
        title: '商品异常',
        icon: 'success',
        duration: 1000
      }); return;
    }
    for (var i in ids){
      var ll = ids[i];
      var sss= ll.shipping_code;
      if (ll.shipping_code == '' || ll.shipping_code == 'undefined') {
      wx.showToast({
        title: '选择快递',
        icon: 'success',
        duration: 1000
      }); return;
    }
      store[i] = [];
      store[i]['shipping_code'] = ids[i]['shipping_code'];
      store[i]['remark'] = ids[i]['remark']||'';
      store[i]['cart_ids']=[];
      for (var j in ids[i]['goods']){
        store[i]['cart_ids'].push(ids[i]['goods'][j]['id']);
      }
    }
    that.setData({
      is_used: true
    });
    let rloading = server.loadv2(this, '.J_loading');
    
    server.postJSON('/cart/cart3/',
      {
        address_id: address_id,
        cart_list: store,
        distribut_from: distribut_from
      },
      function (res) {
        rloading['load'].hidev2();
        if (res.data.status != 1) {
          server.Toast_error(res.data.msg);
          tool.reportAnalytics(
            {
              address_id: address_id,
              cart_list: store
            },
            res.data
          ); 
          return;
        } else {
          var App= getApp();
          App.globalData.order = res.data.result;
          wx.redirectTo({
            url: '../orderpay/payment?' + server.urlEncode(res.data.result)
          });
        }
      });

  }
})