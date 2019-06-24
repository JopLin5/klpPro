var server = require('../../../utils/server');
var event = require('../../../utils/event.js');
var i=0;
class list{
  data={
    options: '',
    edit:false,
    current: 0,
    province: [],
    city: [],
    region: [],
    town: [],
    provinceObjects: [],
    cityObjects: [],
    regionObjects: [],
    townObjects: [],
    areaSelectedStr: '必选',
    maskVisual: 'hidden',
    provinceName: '请选择',
  };
  add = function () {
    wx.navigateTo({
      url: '../add/add'
    });
  };
  onLoad=function (option) {
    console.log(option);
    this.setData({options:option});
  };
  onShow=function(option) {
    this.loadData();
  };
  //选择配送地址
  selectAddr = function(e) {
    console.log(e);
    if (!e.currentTarget.dataset.id) return;
    if (this.data.options.from!='order'){
            return;
    }
    var address_id = e.currentTarget.dataset.id;
    event.emit('OrderAddressChanged', address_id, 1232);
    wx.navigateBack({
      delta: 1
    });
  };
  manage = function(e) {
    this.setData({
      manage: !e.currentTarget.dataset.manage
    });
  };
  setDefault = function(e) {
    // 设置为默认地址
    var that = this;
    // 取得下标
    var index = parseInt(e.currentTarget.dataset.index);
    // 遍历所有地址对象设为非默认
    var addressObjects = that.data.addressObjects;
    for (var i = 0; i < addressObjects.length; i++) {
      // 判断是否为当前地址，是则传true
      addressObjects[i].is_default = i == index
    }
    var address_id = addressObjects[index].address_id;
    server.loading('请求中');
    server.getJSON('/User/setDefaultAddress/address_id/' + address_id, function (res) {
      server.hide_cast();
      if (res.data.status == 1) {
        that.setData({
          addressObjects: addressObjects
        });
      }
    });


  };
  edit = function (e) {
    var that = this;
    // 取得下标
    var index = parseInt(e.currentTarget.dataset.index);
    // 取出id值
    var objectId = this.data.addressObjects[index].address_id;
    wx.navigateTo({
      url: '../edit/index?address_id=' + objectId
    });
  };
  del = function(e) {
    var that = this;
    // 取得下标
    var index = parseInt(e.currentTarget.dataset.index);
    // 找到当前地址AVObject对象
    var address = that.data.addressObjects[index];
    var address_id = address.address_id;
    // 给出确认提示框
    wx.showModal({
      title: '确认',
      content: '要删除这个地址吗？',
      success: function (res) {
        if (res.confirm) {
          server.loading('请求中');
          server.getJSON('/User/del_address/' + "/id/" + address_id, function (res) {
            server.hide_cast();
            if (res.data.status>0){
              server.Toast_success(res.data.msg);
              that.loadData();
            }else{
              server.Toast_error(res.data.msg);
            }

          })
        }
      }
    })

  };
  toorder=function (e) {
    var manage = e.currentTarget.dataset.manage;
    if (manage) {
      return;
    }
    var address_id = e.currentTarget.dataset.id;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    //是否返回
    if (options.r == "pages/order/checkout/checkout"
      ||
      options.r == "pages/order/buynow/checkout"
    ) {
      prevPage.setData({
        address_id: address_id,
        address_back: 1
      })
      wx.navigateBack();
      return;
    }
  };
  loadData=function() {
    // 加载网络数据，获取地址列表
    var that = this;
    server.loading('请求中');
    server.getJSON('/User/getAddressList/', function (res) {
      server.hide_cast();
      var addressList = res.data.result;
      if (i==0&&(addressList == "" || addressList == null)){
        i=1;
        that.add();
           return;
      }
      that.setData({
        addressObjects: addressList
      });
    });
  };
  
}
Page(new list());