var is_on=0;
var server = require('../../../utils/server');
var app=getApp();
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
    op = server.de(op);
    let from_id = op.manager_id||0;
    this.setData({ from_id: from_id});
  },
  //用户信息
  userinfo:function(e){
    let self=this;
    server.loading('请求中');
    app.check_login_AND_register(e).then(function(){
      self.setData({ name: e.detail.userInfo.nickName });
      server.hide_cast();
    });
  },
  phone:function(e){
    let self=this;
    if (this.data.name==""){
      server.Toast_error('先填充昵称');
      return;
    }
    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    let pp= new Promise(function(suc,err){
      wx.checkSession({
        success() {
          // session_key 未过期，并且在本生命周期一直有效
          suc();
        },
        fail() {
          // session_key 已经失效，需要重新执行登录流程
          app.login().then(function(){
            suc();
          });
        }
      })
    });
    pp.then(function(){
      server.postJSON('/User/get_Wx_phone', { data: encryptedData,iv:iv},function(re){
        if (re.data.status!=1){
          return;
        }
        let res=re.data.result
        self.setData({ phone: res.phoneNumber});
      });
    });
   console.log(e);
  },

  userNameInput:function(e){
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
       is_on = 0;
     }
     else if (phone.length <= 10) {
       wx.showModal({
         title: '温馨提示',
         content: '请输入有效的手机号'
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
         '/Rebase/rebate_apply_for_p/', { from_id: self.data.from_id, code: res.code, store_id: self.data.shop_id, name: name, cart: idcard, phone: phone, address: '', encryptedData: e.detail.encryptedData, signature: e.detail.signature, iv: e.detail.iv, avatarUrl: e.detail.userInfo.avatarUrl, nickName: e.detail.userInfo.nickName  },
         function (res) {
           wx.hideLoading();
           if (res.data.status == 1) {
             server.Toast_error(res.data.msg,function(){
               wx.navigateBack({
                 delta: 1
               })
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