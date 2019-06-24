import server from'../../utils/server.js';
import Util from '../../utils/util.js';
import event from'../../utils/event.js';
import CommonPage from '../../CommonPage.js';
import ImgLoader from '../../img-loader/img-loader.js';
var cPage_left=0;
var cPage_right=0;
var cPage_three= 0;
var cPage_3=0;
var cPage_4 =0;
var cPage_left_last_id = 0;
var cPage_right_last_id = 0;
var cPage_three_last_id = 0;
var cPage_3_last_id = 0;
var cPage_4_last_id = 0;
var keyWord='';
var doaction=0;
var timestamp=0;
var scrollTop=0;
var searchHeight=340;
var app=getApp();
var imgLoader;
class index{
 
  cPage_left_loadding =false;
  cPage_right__loadding = false;
  cPage_three__loadding = false;
	data={
    goods_list_left:[],
    goods_list_right: [],
    goods_list_three: [],
    goods_list_3: [],
    goods_list_4: [],
    _num:0,
    cPage_left_last_id:-1,
    cPage_right_last_id:-1,
    cPage_three_last_id:-1,
    winHeight: app.globalData.screenHeight,
    isShow: true
  };

  // 品牌详情跳转
  detail=function (e) {
    var shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: "../shopdetail/index?id=" + shopId
    });
}
  showAc=function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../activity/info/index?id=" + id
    });
  }
  shop_list = function (keyWord){
  }
  gotolist=function(){
    event.emit('settype', '', 1);
    this.$route('/pages/goods/list/list');
  }
  goToAticle=function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/acticel/index?id='+id,
    })
  }
	onLoad=function (options) {
    cPage_left = 0;
    cPage_right = 0;
    cPage_three = 0;
    cPage_left_last_id = 0;
    cPage_right_last_id = 0;
    cPage_three_last_id = 0;
    cPage_3_last_id = 0;
    cPage_4_last_id = 0;
    this.getGoods_left(1, '', 1, true);
    var distribut_id = options.distribut_id || 0;
    if (distribut_id > 0) {
      wx.setStorageSync('distribut_from', distribut_id);
    }else{
      wx.setStorageSync('distribut_from', 0); 
    }
	};
  load=function(e){
    console.log(e);
  }

  //tab选择
  tabb = function (e) {
    let that=this;
    scrollTop=0;
    console.log(e);
    if(e.detail.source!='touch'){
      this.setData({ _num: this.data._num});
      return;
    }
    let index =e.detail.current;
    if (index==1) {
      if (this.data.goods_list_right.length<1){
        this.setData({ _num: 1 });
        this.getGoods_right(1, this.data.keyWord,0, true);
        return;
      }
      this.setData({ _num: 1});
      return;
    } 
    if (index== 0) {
      if (this.data.goods_list_left.length < 1){
        this.setData({ _num:0 });
        this.getGoods_left(1, this.data.keyWord,1, true);
        return;
      }
      
      this.setData({ _num: 0});
    
      return;
    }
    if (index== 2) {
      if (this.data.goods_list_three.length < 1) {
        this.setData({ _num:2 });
        this.getGoods_three(1, this.data.keyWord,2, true);
        return;
      }
      this.setData({ _num: 2});
     
      return;
    }
  };
  count_num = function (list,index){
     //浏览次数
    let goods = {};
     switch (list) {
       case 0:
         goods=this.data.goods_list_left;
         goods[index].click_count = parseInt(goods[index].click_count)+1;
         this.setData({ goods_list_left: goods});
         break;
       case 1:
         goods = this.data.goods_list_right;
         goods[index].click_count = parseInt(goods[index].click_count) + 1;
         this.setData({ goods_list_right: goods });
         break;
       case 2:
         goods = this.data.goods_list_three;
         goods[index].click_count = parseInt(goods[index].click_count) + 1;
         this.setData({ goods_list_three: goods });
         break;
       default:
     }
   }
	showDetail=function (e) {
		let goodsId = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let list =parseInt(e.currentTarget.dataset.list);
    if (!/^[0-9]*$/.test(goodsId)) {
      return;
    }
    this.count_num(list, index);
    this.$route("/pages/goods/detail/detail", e.currentTarget.dataset);
	};
  //获取分页
  getGoods_left = function (pageIndex, keyWord='',cat4='',reload=false) {
    var that = this;
    if (this.cPage_left_loadding == true) {
      return;
    }
    this.cPage_left_loadding = true;
    server.postJSON('/index/favourite/',
      {
        p: pageIndex,
        keyWord: keyWord,
        cat4:cat4,
        last_id: cPage_left_last_id
      }, function (res) {
    
        if (res.data.status!=1){
          that.setData({
            empty_left: true
          }); 
      
          return;
        }
        ++cPage_left
        var newgoods = res.data.result;
        var ms = [];
        if (reload){
        }else{
          ms = that.data.goods_list_left;
        }
        for (var i in newgoods) {
          ms.push(newgoods[i]);
        }
        cPage_left_last_id = newgoods[i].goods_id;
        that.setData({
          empty_left: false,
          goods_list_left: ms
        });
      },function(){
        that.cPage_left_loadding = false;
      });

  };
  //第二个
  getGoods_right = function (pageIndex, keyWord = '', cat4 = '', reload = false) {
   
    var that = this;
    if (this.cPage_right_loadding == true) {
      return;
    }
    this.cPage_right_loadding = true;
    server.postJSON('/index/favourite/',
      {
        p: pageIndex,
        keyWord: keyWord,
        cat4: cat4,
        last_id: cPage_right_last_id
      }, function (res) {
      
        if (res.data.status != 1) {
          that.setData({
            empty_right: true
          });
      
          return;
        }
        ++cPage_right;
        var newgoods = res.data.result
        var ms = [];
        let old_last_id =-1;
        if (reload) {
        } else {
          ms = that.data.goods_list_right;
          old_last_id = ms && ms[ms.length - 1].goods_id
        }
        for (var i in newgoods) {
          ms.push(newgoods[i]);
        }
        cPage_right_last_id = newgoods[i].goods_id;
        that.setData({
          empty_right: false,
          goods_list_right: ms,
          cPage_right_last_id:newgoods[i].goods_id
        });
      },function(){
        that. cPage_right_loadding=false;
      });

  };
  //第三个
  //获取分页
  getGoods_three = function (pageIndex, keyWord = '', cat4 = '', reload = false) {
    let that = this;
    if (this.cPage_three_loadding == true) {
      return;
    }
    this.cPage_three_loadding = true;
    server.postJSON('/index/favourite/',
      {
        p: pageIndex,
        keyWord: keyWord,
        cat4: cat4,
        last_id: cPage_three_last_id
      }, function (res) {
     
        if (res.data.status != 1) {
          that.setData({
            empty_three: true
          });
         
          return;
        }
        ++cPage_three;
        var newgoods = res.data.result
        var ms = [];
        let old_last_id=-1
        if (reload) {
        } else {
          ms = that.data.goods_list_three;
          old_last_id = ms && ms[ms.length-1].goods_id
        }
        for (var i in newgoods) {
          ms.push(newgoods[i]);
         
        }
        cPage_three_last_id = newgoods[i].goods_id;
        that.setData({
          empty_three: false,
          goods_list_three: ms,
          cPage_three_last_id: old_last_id
        });
      },function(){
        that.cPage_three_loadding=false;
      });

  };
  nextPage=function(){
    switch (this.data._num ){
      case 0:
        this.getGoods_left(cPage_left+1, this.data.keyWord, 1);
        break;
      case 1:
        this.getGoods_right(cPage_right+1, this.data.keyWord, 0);
        break;
      case 2:
        this.getGoods_three(cPage_three+1, this.data.keyWord, 2);
        break;
      default:
     
    }
  }
  loadImages = Util.rate(function (e, take_time,direction){
    // console.log(e);
    if (direction.direction > 1 && direction.left<200){
      this.nextPage();
    }
  },5,0, function (e, direction){
    direction.left = e.detail.scrollHeight - (e.detail.scrollTop + this.data.screenHeight);
    direction.direction= e.detail.scrollTop - direction.Y;
    direction.Y = e.detail.scrollTop;
  });

  onShareAppMessage = function (e) {
    var user_info = wx.getStorageSync('userinfo');

    var title = '';

    if (user_info == '') {
      title = '登录再转发更好哦';
    } else{
      title = '来自' + userShareInfo.name+'分享';
    }
    if (userShareInfo != undefined && Object.keys(userShareInfo).length > 0) {
      query = server.urlEncode({
        distribut_id: user_info.user_id
      });
    }

    var obj = {
      title: title,
      path: '/pages/index/index/?' + query
    };
    return obj;
  }
}
Page(new index());