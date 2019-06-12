import server from '../../utils/server.js';
import event from '../../utils/event.js';
var app=getApp();
class profile{
  data={
    users: [],
    user_id:0,
    followers:[],
    shops:[],
    active:0,
    tab:0,
    from:0
  };
  slipChange=function (e) {
    var that = this;
    console.log('123');
    var curr_user = this.data.users[e.detail.current];
    this.setData({ tab: e.detail.current, user_id: curr_user.user_id, active:0});
    this.push_shop(this.data.user_id);
  }

 //tab下面选择
 tab=function(e) {
   var index = e.target.dataset.num != undefined ? e.target.dataset.num : e.detail.current;
  this.setData({
    active: index
  })

    if (this.data.active == 1) {
      this.follower(this.data.user_id);
      return;
  }
  if (this.data.active ==0) {
    this.push_shop(this.data.user_id);
      return;
  }

};
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad=function(params) {
    var id = params.id;
    var user_id=id;
    let from = params.from||0
    if(id.indexOf(":")>-1){
       let temp=id.split(":");
       user_id=temp[1];
    }
    this.setData({ user_id: user_id, from: from, winHeight: app.globalData.screenHeight+'px' });
    this.push_shop(this.data.user_id);
    this.get_info(id);
    var self = this;
  }
  gototalk=function(){
    let self=this;
    var user = self.data.users[self.data.tab];
    if (user.is_follow=='-1'){
      server.Toast_error('先关注，才能聊天');
           return;
    }
    //是否已关注
    let query={};
    query.id=user.user_id;
    query.nickname = user.nickname;
    query.head = user.head_pic;
    query=server.urlEncode(query);
    wx.navigateTo({
      url: '/pages/chat/chat?' + query,
    })
  }
  //别人关注的人
  follower=function(id,p=1) {
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON('/User/other_folloew', { user_id: id,page:p}, function (res) {
      rloading['load'].hidev2();
      var data = res.data;
      if (data.status > 0) {
        if(p==1){
          self.setData({
            followers: data.result
          });
        }else{
             let ms=self.data.followers;
          for (var i in data.result){
                   ms.push(data.result[i]);
             }
          self.setData({ followers: ms});
        }
  
      } else {
         if(p==1){
           self.setData({
             followers: []
           });
         }else{

         }
      }
      self.get_wxml('#followers', function (res) {
        if (res == null) return;
        self.setData({ winHeight: Math.max(res.height, (app.globalData.screenHeight - 520 / app.globalData.pixelRatio)) + 'px' });
      });
    })
  }
   // 滚动切换标签样式
   switchTab =function(e) {
    this.setData({
      active: e.detail.current,
      bottomHeightFlag:true
    });

  }
  //别人推广的店铺
  push_shop=function (id,p=1) {
    var self = this;
    let rloading = server.loadv2(this, '.J_loading');
    server.postJSON('/Store/other_push', { user_id: id,page:p}, function (res) {
      rloading['load'].hidev2();
      var data = res.data;
      if (data.status > 0) {
        if (p == 1) {
          self.setData({
            shops: data.result,
          });
        
        }else{
          let ms=this.data.shops;
          for (var i in data.result){
            ms.push(data.result[i]);
          }
          self.setData({
            shops: ms,
          });
        }

        
      } else {
         if(p==1){
           self.setData({
             shops: [],
           });
         }
      }
      self.get_wxml('#tuilie', function (re) {
        if (re == null) return;
        self.setData({ winHeight: Math.max(re.height, (app.globalData.screenHeight - 520 / app.globalData.pixelRatio)) + 'px' });
      });
    })
  }
  get_info=function(id){
    var self=this;
    server.postJSON('/User/user_info_list', { user_id: id,from:this.data.from}, function (res) {
      var data = res.data;
      if (data.status > 0) {
        self.setData({
          users: data.result,
        });
      } else {
        server.Toast_error(data.msg);
      }

    })
  }
  //关注follow_user
  follow=function (e) {
    var self = this;
    var follow_id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var my = e.currentTarget.dataset.my || '';
    let rloading = server.loadv2(this, '.J_loading');
    server.getJSON('/User/follow_user/follow_id/' + follow_id, function (res) {
      rloading['load'].hidev2();
      var data = res.data;
      if (data.status > 0) {
        var user=self.data.users[self.data.tab];
        self.data.users[self.data.tab].is_follow = 0 - user.is_follow;
        self.setData({ users: self.data.users});
      } else {

      }

    })
  }
}
Page(new profile());