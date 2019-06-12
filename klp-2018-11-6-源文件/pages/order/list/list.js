import server from "../../../utils/server.js";
import Util from "../../../utils/util.js";
import CommonPage from "../../../CommonPage.js";
var app = getApp();
var all_orders_Page = 0;
var receive_orders_Page = 0;
var pay_orders_Page = 0;
var send_orders_Page = 0;
var finish_orders_Page = 0;

var receive_orders_empty=false;
var pay_orders_empty = false;
var send_orders_empty = false;
var finish_orders_empty = false;
var all_orders_empty = false;
var ctype = "NO";
var types = ["NO", "WAITRECEIVE", "WAITPAY", "WAITSEND", "FINISH"];
class list{
  data = {
    all_orders:[],
    receive_orders:[],
    pay_orders:[],
    send_orders:[],
    finish_orders:[],
    tab: 0,
    winHeight:''
  };
  tabClick = function(e) {
    let self=this;
    var index = e.currentTarget.dataset.index || e.detail.current;
    this.setData({
      tab: index
    });
    switch (types[index]) {
      case 'NO':
        if (this.data.all_orders.length < 1) {
        this.getOrderLists(types[index], ++all_orders_Page,0);
        }
        break;
      case 'WAITRECEIVE':
        if (this.data.receive_orders.length < 1) {
          this.getOrderLists(types[index], ++receive_orders_Page,1);
        }
        break;
      case 'WAITPAY':
        if (this.data.pay_orders.length<1){
          this.getOrderLists(types[index], ++pay_orders_Page,2);
      }
        break;
      case 'WAITSEND':
        if (this.data.send_orders.length < 1) {
          this.getOrderLists(types[index], ++send_orders_Page,3);
        }
        break;
      case 'FINISH':
        if(this.data.finish_orders.length<1){
          this.getOrderLists(types[index], ++finish_orders_Page,4);
        }
        break;
      default:

    } 
    this.get_wxml('#' + index,function(re){
      if(re==null)return;
      self.setData({ winHeight: Math.max(re.height, app.globalData.screenHeight)});
    });
  };


//全部待付款
  pay = function(e) {
    var index = e.currentTarget.dataset.index;
    var order = this.data.all_orders[index];
    order["order_id"] = "order_id:" + order["order_id"];
    var app = getApp();
    app.globalData.order = order;
    wx.redirectTo({
      url: "../orderpay/payment"
    });
  };

//带支付
  waitpay = function (e) {
    var index = e.currentTarget.dataset.index;
    var order = this.data.pay_orders[index];
    order["order_id"] = "order_id:" + order["order_id"];
    var app = getApp();
    app.globalData.order = order;
    wx.redirectTo({
      url: "../orderpay/payment"
    });
  };
  confirm = function(e) {
    var index = e.currentTarget.dataset.index;
    var order = this.data.receive_orders[index];
    var that = this;
    wx.showModal({
      title: "提示",
      showCancel: true,
      content: "确定收货吗？",
      success: function(res) {
        if (res.confirm) {
          server.postJSON(
            "/User/orderConfirm/",
            {
              order_id: order["order_id"]
            },
            function(res) {
              res = res.data;
              if (res.status > 0) {
                var ms = that.data.receive_orders;
                 ms.splice(index, 1);
                var all_orders= that.change_order_status(that.data.all_orders, order["order_id"],4);
                that.setData({
                  receive_orders: ms,
                  all_orders: all_orders
                });
              } else {
                server.Toast_error(res.msg, null, 3000);
              }
            }
          );
        }
      }
    });
  };
  allconfirm = function (e) {
    var index = e.currentTarget.dataset.index;
    var order = this.data.all_orders[index];
    var that = this;
    wx.showModal({
      title: "提示",
      showCancel: true,
      content: "确定收货吗？",
      success: function (res) {
        if (res.confirm) {
          server.postJSON(
            "/User/orderConfirm/",
            {
              order_id: order["order_id"]
            },
            function (res) {
              res = res.data;
              if (res.status > 0) {
                var ms = that.data.all_orders;
                ms[index]['order_status']=4;
                var receive_orders = that.remove_order_item(that.data.receive_orders, order["order_id"]);
                that.setData({
                  receive_orders: receive_orders,
                  all_orders: ms
                });
              } else {
                server.Toast_error(res.msg, null, 3000);
              }
            }
          );
        }
      }
    });
  };
  change_order_status=function(orders,order_id,status){
    orders =orders||[];
    for (let i = 0; i < orders.length; i++) {
      if (orders[i]['order_id'] == order_id){
        orders[i].order_status = status;
      }
    }
    return orders;
  }
  remove_order_item = function (orders, order_id){
    orders = orders || [];
    for (let i = 0; i < orders.length; i++) {
      if (orders[i]['order_id'] == order_id) {
        orders.splice(i,1);
      }
    }
    return orders;
  }
  //全部
  cancel = function(e) {
    var index = e.currentTarget.dataset.index;
    var order = this.data.all_orders[index];
    var that = this;
    wx.showModal({
      title: "提示",
      showCancel: true,
      content: "确定取消订单吗？",
      success: function(res) {
        if (res.confirm) {
          server.postJSON(
            "/User/cancelOrder/",
            {
              order_id: order["order_id"]
            },

            function(res) {
              res = res.data;
              if (res.status > 0) {
                var ms = that.data.all_orders;
                  ms[index]["order_status"] = 3; 
                var pay_orders = that.remove_order_item(that.data.pay_orders, order["order_id"]);
                that.setData({
                  all_orders: ms,
                  pay_orders: pay_orders
                });
              } else {
                server.Toast_error(res.msg, null, 3000);
              }
            }
          );
        }
      }
    });
  };
//取消贷付款
  cancelpay = function (e) {
    var index = e.currentTarget.dataset.index;
    var order = this.data.pay_orders[index];
    var that = this;
    wx.showModal({
      title: "提示",
      showCancel: true,
      content: "确定取消订单吗？",
      success: function (res) {
        if (res.confirm) {
          server.postJSON(
            "/User/cancelOrder/",
            {
              order_id: order["order_id"]
            },

            function (res) {
              res = res.data;
              if (res.status > 0) {
                var ms = that.data.pay_orders;
                var all_orders = that.change_order_status(that.data.all_orders, order["order_id"],3);
                ms.splice(index, 1);
                that.setData({
                  pay_orders: ms,
                  all_orders: all_orders
                });
              } else {
                server.Toast_error(res.msg, null, 3000);
              }
            }
          );
        }
      }
    });
  };
  details = function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../details/index?order_id=" + id
    });
  };
  onReachBottom = function() {
    var index = this.data.tab;
    switch (types[index]) {
      case 'NO':
        this.getOrderLists(types[index], ++all_orders_Page,0);
        break;
      case 'WAITRECEIVE':
          this.getOrderLists(types[index], ++receive_orders_Page,1);
        break;
      case 'WAITPAY':
          this.getOrderLists(types[index], ++pay_orders_Page,2);
        break;
      case 'WAITSEND':
          this.getOrderLists(types[index], ++send_orders_Page,3);
        break;
      case 'FINISH':
          this.getOrderLists(types[index], ++finish_orders_Page,4);
        break;
      default:

    }
  };
  onPullDownRefresh = function() {
    var index = this.data.tab;
   
    switch (types[index]) {
      case 'NO':
        all_orders_Page = 0;
        this.getOrderLists(types[index], ++all_orders_Page,0);
        break;
      case 'WAITRECEIVE':
        receive_orders_Page = 0;
        this.getOrderLists(types[index], ++receive_orders_Page,1);
        break;
      case 'WAITPAY':
        pay_orders_Page = 0;
        this.getOrderLists(types[index], ++pay_orders_Page,2);
        break;
      case 'WAITSEND':
        send_orders_Page = 0;
        this.getOrderLists(types[index], ++send_orders_Page,3);
        break;
      case 'FINISH':
        finish_orders_Page = 0;
        this.getOrderLists(types[index], ++finish_orders_Page,4);
        break;
      default:

    }

  };

  getOrderLists = function(ctype, page,index=0) {
    var that = this;
    let rloading = server.loadv2(this, '.J_loading');
    return new Promise(function(succ,error){
      server.getJSON(
        "/User/getOrderList/type/" + ctype + "/page/" + page,
        function (res) {
          rloading['load'].hidev2();
          var datas = res.data.result;
          if (res.data.status < 1) {
            switch (ctype) {
              case 'NO':
                if (page == 1) {
                  that.setData({ all_orders: [] });
                }
                that.setData({ all_orders_empty: true });
                --all_orders_Page;
                break;
              case 'WAITRECEIVE':
                if (page == 1) {
                  that.setData({ receive_orders: [] });
                }
                that.setData({ receive_orders_empty: true });
                --receive_orders_Page;
                break;
              case 'WAITPAY':
                if (page == 1) {
                  that.setData({ pay_orders: [] });
                }
                that.setData({ pay_orders_empty: true });
                --pay_orders_Page;
                break;
              case 'WAITSEND':
                if (page == 1) {
                  that.setData({ send_orders: [] });
                }
                that.setData({ send_orders_empty: true });
                --send_orders_Page;
                break;
              case 'FINISH':
                if (page == 1) {
                  that.setData({ finish_orders: [] });
                }
                that.setData({ finish_orders_empty: true });
                --finish_orders_Page;
                break;
              default:

            }
            return;
          }

          switch (ctype) {
            case 'NO':
              var ms = that.data.all_orders || [];
              break;
            case 'WAITRECEIVE':
              var ms = that.data.receive_orders || [];
              break;
            case 'WAITPAY':
              var ms = that.data.pay_orders || [];
              break;
            case 'WAITSEND':
              var ms = that.data.send_orders || [];
              break;
            case 'FINISH':
              var ms = that.data.finish_orders || [];
              break;
            default:

          }
          if (page == 1) {
            ms = [];
          }
          for (var i in datas) {
            ms.push(datas[i]);
          }

          switch (ctype) {
            case 'NO':
              that.setData({ all_orders: ms });
              break;
            case 'WAITRECEIVE':
              that.setData({ receive_orders: ms });
              break;
            case 'WAITPAY':
              that.setData({ pay_orders: ms });
              break;
            case 'WAITSEND':
              that.setData({ send_orders: ms });
              break;
            case 'FINISH':
              that.setData({ finish_orders: ms });
              break;
            default:
          }
          succ(index)
        }
      );
    }).then(function (index){
      let yy = '#tt' + index;
      that.get_wxml(yy, function (re) {
        if (re == null) return;
        that.setData({ winHeight: Math.max(re.height, app.globalData.screenHeight) });
      });
    });
  
  };
  onShow = function() {};
  onLoad = function() {
    all_orders_Page = 0;
    receive_orders_Page = 0;
    pay_orders_Page = 0;
    send_orders_Page = 0;
    finish_orders_Page = 0;
    this.data.orders = [];
    let self=this;
    this.getOrderLists(ctype, ++all_orders_Page,0);

  };
}

Page(new list());
