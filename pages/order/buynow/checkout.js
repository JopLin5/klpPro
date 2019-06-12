var server = require('../../../utils/server');
var tool = require('../../../utils/util');
var event = require('../../../utils/event.js');
var timeout = null
var exit=0;
Page({
  data: {
    amount: 0,
    hasAddress: false,
    carts: [],
    options:'',
    address:{},
    height: 0,
    orders: [],
    ids: null,
    yunPrice: 0,
    address_back: 0,
    index: 0,
    code: '',
    allGoodsPrice: 0,
    is_used: false
  },
  addressObjects: [],
  onShow: function () {
    var options = this.data.options;
    var address_id = this.data.address?(this.data.address.address_id||0):0;
    this.calculation(options.goods_id, options.goods_spec, address_id, options.goods_num);
  },
  onLoad: function (options){
    this.setData({ options: options});
    event.on('OrderAddressChanged', this, function (address_id) {
      var address = this.data.address||[];
      address['address_id'] = address_id;
      this.setData({
        address: address
      });
    });
 },
  onUnload: function () {
    event.remove(this);
  },
  //计算订单信息
  calculation: function (goods_id, goods_spec, address_id, goods_num) {
    var that = this;
    server.loading('请求中');
    server.postJSON('/cart/buyNow2/',
     { goods_id: goods_id, goods_spec: goods_spec, address_id: address_id, goods_num: goods_num},           function (res) {
       server.hide_cast();
        if (res.data.status != 1) {
          server.Toast_error(res.data.msg,function(){
          wx.navigateBack();
          });
          return;
        }
        exit=1;
        var yunPrice = parseInt(res.data.result.shipping_price.fee * 100);
        yunPrice = yunPrice / 100.0;
        var address = res.data.result.address;
        that.setData({
          address: address,
          msg: res.data.result.shipping_price.msg,
          yunPrice: yunPrice,
          hasAddress: true,
          orders: res.data.result,
          store: res.data.result.store,
          code: res.data.result.shippingList[0] ? res.data.result.shippingList[0].shipping_code:''
        });
        that.sum();
      });
  },
  addaddress: function (e) {
    var address_id = e.currentTarget.dataset.address_id||0;
    var param = new Array();
    param["select_address_id"] = address_id;
    param["from"] ='order';
    var param_query = server.urlEncode(param,null,false);
    if(this.data.address){
      wx.navigateTo({
        url: '../../../../../../address/list/list?' + param_query
      });
      return;
    }
    wx.navigateTo({ url: '../../../../../../address/add/add?' + param_query});
  },
  pickChange: function (e) {
    var that = this;
    var index = e.detail.value;
    var code = this.data.orders.shippingList[index].shipping_code;
    if (this.data.address==null||this.data.address.address_id < 0) {
      wx.navigateTo({ url: '../../../../../../address/add/add' });
      return;
    }
    server.postJSON('/cart/calculate_freight2/', { 
      address_id: this.data.address.address_id,
      shippingcode: code,
      goods_id: this.data.orders.goods_id,
      goods_num: this.data.orders.goods_num,
      goods_spec: this.data.orders.goods_spec
       }, function (res) {
         var yunPrice = parseInt(res.data.result* 100);
      yunPrice = yunPrice / 100.0;
      that.setData({
        msg: res.data.msg,
        yunPrice: yunPrice,
        code:code,
        index: index
      })

    });

  },
  sum: function () {
    var user_info = wx.getStorageSync('userinfo');
    if(!server.check_login()){
      return;
    }
    var distribut_from = wx.getStorageSync('distribut_from')|| 0;
    var that = this;
    var goods = that.data.orders.cartList;
    var total = 0;
    for (var i in goods) {
        total = total + tool.mul(goods[i].goods_price, goods[i].goods_num);
    }
    total = total.toFixed(2);
    that.setData({
      allGoodsPrice: total
    });
  },
  createOrder: function (e) {
    var that = this;
    if(exit != 1){
      server.Toast_error('你已经提交过了');
      return;
    }
    exit = 0;
    var distribut_from = wx.getStorageSync('distribut_from') || 0;
    //地址
    var address_id = this.data.address && this.data.address.address_id||0;
    var remark = e.detail.value.remark || '';
    //商品
    var goods_id=this.data.orders.goods_id;
    var goods_num= this.data.orders.goods_num;
    var  goods_spec= this.data.orders.goods_spec||'';
    //快递 
    var shipping_code = this.data.code;
    if (address_id == undefined || address_id < 1 ) {
      wx.navigateTo({url: '../../../../../../address/add/add' });
      return;
    }
    if (goods_id == '' || goods_id== undefined) {
      server.Toast_error('商品异常');
        return;
    }
    if (goods_num == undefined || goods_num < 1 ) {
      server.Toast_error('商品数量必须大于0');
      return;
    }
    

    that.setData({
      is_used: true
    });

    let rloading = server.loadv2(this, '.J_loading');
    
    server.postJSON('/cart/buyNow3/',
      {
        address_id: address_id,
        distribut_from: distribut_from,
        shipping_code: shipping_code,
        goods_id:goods_id,
        goods_num:goods_num,
        goods_spec: goods_spec,
        remark: remark
      },
      function (res) {
        rloading['load'].hidev2();
        if (res.data.status != 1) {
          server.Toast_error(res.data.msg);
          tool.reportAnalytics(
            {
              address_id: address_id,
              shipping_code: shipping_code,
              goods_id: goods_id,
              goods_num: goods_num,
              goods_spec: goods_spec,
              remark: remark
            },
            res.data
          );  
           return;
        } else {
          var app = getApp();
          app.globalData.order = res.data.result;
          wx.redirectTo({
            url: '../orderpay/payment?order_id=' +1
          });
        }
      });

  }
})