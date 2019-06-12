import server from '../../../utils/server.js';
import Util from '../../../utils/util.js';
import event from '../../../utils/event.js';
var page =1;
var last_goods_id={};
const app = getApp()
class index{
  data = {
    goods_list: [],
    empty:false,
    keyWord:''
  };
  mode=function(){
     wx.navigateBack({
       
     })
  };
  sureToFirstGoods = function () {
    let Y = this.data.goods_list[0];
    if (Y==undefined) {
      server.Toast_error('列表为空');
      return;
    }
    let url = '';
    if (Y._type == 1) {//商品
      url = "/pages/goods/detail/detail?id=" + Y.goods_id
    } else {//店铺
      url = "/pages/shopdetail/index?id=" + Y.goods_id
    }
    wx.navigateTo({
      url: url
    });
  };
  // 详情跳转
  goto = function (e) {
    let  index = e.currentTarget.dataset.index;
    var src = e.currentTarget.dataset.goodsSrc;
    src = encodeURIComponent(src);
    let tem=this.data.goods_list[index];
    //浏览次数
    this.data.goods_list[index].click_count = parseInt(this.data.goods_list[index].click_count)+1;
    this.setData({ goods_list: this.data.goods_list});
    let url='';
    let data={};
    if (tem._type==1){//商品
      let cat4 = e.currentTarget.dataset.cat4;
      url = "/pages/goods/detail/detail"
      data = { id: tem.goods_id, src: src, from: 3, cat4:cat4}
    }else{//店铺
     url="/pages/shopdetail/index";
     data = { id:tem.goods_id}
    }
    this.$route(url,data);
  }
  onchage = function (e) {
    this.setData({
      keyWord: e.detail.value
    });
  };
  search = function (e) {
    let self = this;
    page=1;
    let keyWord = this.data.keyWord || '';
    this.getGoods(1, keyWord, true);
  };

  del = function () {
    this.setData({keyWord: '' });
    page=1;
    this.getGoods(1, '', true);
  }

  onLoad = function (options) {
    var page = 1;
    var keyWord = options.keyword;
    this.setData({ keyWord: keyWord});
    this.getGoods(1,this.data.keyWord, true);
  };
  listenerPhoneInput=function(){

  }
  onShow = function () {

  };
  onHide = function () {
    
  };

  showDetail = function (e) {
    var goodsId = e.currentTarget.dataset.goodsId;
    var index = e.currentTarget.dataset.index;
    if (!/^[0-9]*$/.test(goodsId)) {
      return;
    }
    wx.navigateTo({
      url: "../../goods/detail/detail?id=" + goodsId + "&index=" + index
    });
  };
  //获取分页
  getGoods = function (pageIndex, keyWord='', reload = false) {
    var that = this;
    if (reload) {
      page= 1;
      pageIndex =page;
      that.setData({goods_list:[]});
    }
    server.loading('请求中');
    server.postJSON('/Goods/search/',
      {
        p: pageIndex,
        keyWord: keyWord,
        row:10,
        last_id: last_goods_id[page]
      }, function (res) {
        server.hide_cast();
        if (res.data.status != 1) {
         
          if (page== 1) {
            that.setData({
              empty: true,
              goods_list:[]
            });
          } else {
            that.setData({
              empty:true
            });
          }
          return;
        }
        ++page;
        let newgoods = res.data.result

        let ms = that.data.goods_list||[];
        for (var i in newgoods) {
          ms.push(newgoods[i]);
        }
        that.setData({
          empty: false,
          goods_list: ms
        });
      });

  };
  onReachBottom = function () {
    this.getGoods(page, this.data.keyWord,false);
  };
  onPullDownRefresh = function () {
    this.getGoods(1, this.data.keyWord, true);
  };
}
Page(new index());