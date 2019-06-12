import server from'../../../utils/server';
import event from '../../../utils/event';
import Timer from '../../../utils/timer.js';
var rloading;
var app=getApp();
class index{
	data={
    avatarUrl:'',
    nickName:'',
    time:'获取验证码',
    is_login:1,
    is_distribut:1,
    is_loading:false,
    is_update:true,
    is_shop:1,
    isShow:true,
    totalTopHeight:64
	};
  navigateTosb=function (e) {
  var shopId = e.currentTarget.dataset.id || 69;
  wx.navigateTo({
    url: '/pages/about1/about?id=' + shopId
  });
};
	onLoad=function (options) {
    this.getSysyteminfo();
	};
  onReady = function () {
   
  }
  imageerror = function (e) {
   this.setData({
     avatarUrl: '../../../images/avantar.png'
   });
  };
   //同步微信	
  update=function(e){
    if (!this.data.is_update){
      return;
    }
    var self=this;
    this.setData({ is_loading:true});
    server.postJSON(
      '/User/update_info',
      {avatarUrl: e.detail.userInfo.avatarUrl, nickName: e.detail.userInfo.nickName },
       function (re) {
        self.setData({ is_loading: false });
        if (re.data.status>0){
          wx.setStorageSync('userinfo', re.data.result);
          self.setData({
            avatarUrl: re.data.result.head_pic ? re.data.result.head_pic : '',
            nickName: re.data.result.name ? re.data.result.name : '',
            is_update:false
          });
        server.Toast_success(re.data.msg);
      }else{
        server.Toast_error(re.data.msg);
      }
      }
    );
  };
  loginout=function(){
    var self=this;
    server.postJSON(
      '/User/loginout',
     {},
     function(){
       app.remive_login_timer();
       wx.hideLoading();
       wx.setStorageSync('session_id', '');
       wx.setStorageSync('userinfo', ''); 
       wx.setStorageSync('distribut_id', '');
       app.globalData.is_login = false;
       self.setData({
         avatarUrl: '',
         nickName: '',
         time: '获取验证码',
         is_login: 0,
         is_distribut: 0,
         is_shop:0
       });
     }
    );

  };
  
  login=function (e) {
    let self=this;
    server.loading('登陆中');
    app.register_login(0,e).then(function (re){
      let userinfo = re.result;
      self.setData({
        is_distribut: userinfo.is_distribut || 0,
        is_login: userinfo ? 1 : 0,
        avatarUrl: userinfo ? userinfo.head_pic : '',
        nickName: userinfo ? userinfo.name : '',
        is_shop: userinfo.is_shop||0
      });
      server.hide_cast();
    });
  };

  navigateToCollect=function(){
wx.navigateTo({
			url: '../../myspread/index'
		});
  };
  navigateToOrder=function(){
    var user_info = wx.getStorageSync('userinfo');
    if (!server.check_login()) {
      return;
    }
wx.navigateTo({
			url: '../../order/list/list'
		});
  };
	navigateToAddress=function () {
    var user_info = wx.getStorageSync('userinfo');
    if (!server.check_login()) {
      return;
    }
		wx.navigateTo({
			url: '../../address/list/list'
		});
	};
	onShow=function () {
    var userinfo = wx.getStorageSync('userinfo');
    this.setData({
      memhot: app.globalData.memhot||{},
      is_distribut: userinfo.is_distribut||0,
      is_login: userinfo?1:0,
      avatarUrl: userinfo?userinfo.head_pic:'',
      nickName: userinfo?userinfo.name:'',
      is_shop: userinfo.is_shop||0
		});
	}
}
Page(new index());