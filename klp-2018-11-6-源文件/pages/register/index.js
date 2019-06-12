var is_on=0;
var server = require('../../utils/server');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      logo:'',
      class_id:0,
      name:"",
      idcard:"",
      phone:"",
      address:"",
      store_name:'',
      focus:false,
      from_id:0

  },
    onShow:function(){
          is_on=0;
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (op) {
    console.log(op);
    op=server.de(op);
    var time = op.time;
    var now = Date.parse(new Date()) / 1000;
    if (time==undefined ||time < now) {
      server.loading('链接已经过期', function () {
        // wx.switchTab({
        //   url: "/pages/index/index"
        // });
      });
      return;
    }
      this.setData({
          logo:op.logo||'',
        shop_id: op.shop_id||0,
        store_name: op.store_name||'',
        from_id: op.from_id||0
      });
  },
  userNameInput: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  userIdcardInput: function (e) {
    this.setData({
      idcard: e.detail.value
    })
  },
  userPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  }, 
  userAdrInput: function (e) {
    this.setData({
      address: e.detail.value
    })
  },
  submit:function(e){
     if(is_on!=0){
       server.Toast_error('不要重复点击');
       return;
     }
     is_on=1;
     var that=this;
     var name=that.data.name;
     var idcard=that.data.idcard
     var phone=that.data.phone
     var address=that.data.address
     if(name==""){
       wx.showModal({
         title: '温馨提示',
         content: '请输入完整姓名'
       }) 
       is_on =0;
     }
     else if (phone.length <= 10) {
       wx.showModal({
         title: '温馨提示',
         content: '请输入有效的手机号'
       })
       is_on = 0;
     } else if (this.data.shop_id ==undefined || this.data.shop_id == "") {
       wx.showModal({
         title: '温馨提示',
         content: '信息错误请重新获取'
       })
       is_on = 0;
     }
     else{
       var self = this;
       wx.showLoading({
         title: '加载中',
       })
       wx.login({
         success: function (res) {
       server.postJSON(
         '/store/rebate_apply_for_m/', { from_id: self.data.from_id, code: res.code, store_id: self.data.shop_id, name: name, cart: idcard, phone: phone, address: '', encryptedData: e.detail.encryptedData, signature: e.detail.signature, iv: e.detail.iv, avatarUrl: e.detail.userInfo.avatarUrl, nickName: e.detail.userInfo.nickName  },
         function (res) {
           wx.hideLoading();
           if (res.data.status == 1) {
             server.Toast_error(res.data.msg,function(){
               wx.navigateTo({
                 url: '/pages/init/index',
               });
             });
            
           }else{
             server.Toast_error((res.data.msg));
           }
         }
       );
     }

       });
     }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})