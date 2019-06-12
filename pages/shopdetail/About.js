var server = require('../../utils/server');
var Util = require('../../utils/util');
import WxParse from '../../wxParse/wxParse.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    store:{},
    article: '<div>我是HTML代码</div>',
    list:[]
  },
  //富文本预览
  wxParseImgTap:function (e) {
    var that = this;
    var nowImgUrl = e.target.dataset.src;

    wx.previewImage({
      current: nowImgUrl, // 当前显示图片的http链接
      urls: that.data.store.imageUrls // 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    server.postJSON('/Store/jianjie', { id: options.id},function(res){
      res = res.data;
      if (res.status < 1) {
        return;
      }
      let htmlContent= WxParse.wxParse('article', 'html', res.result.info, self, 0);
      let store = res.result;
      store.nodes = htmlContent['article'].nodes||[];
      store.imageUrls = htmlContent['article'].imageUrls||[];
      self.setData({ store: store});
    });
  },
  videoPlay: function (e) {
    var self = this;
    var url = e.currentTarget.dataset.src;
    var params = Util.parseUrl(url);
    var rate = 0;
    if (params.length > 1) {
      rate = params['width'] / params['height'];
    }
    this.setData({
      direction: rate > 1 ? 90 : 0,
      curr_id: e.currentTarget.dataset.id
    });
    var videoContext = wx.createVideoContext('myvideo-' + e.currentTarget.dataset.id, this);
    videoContext.requestFullScreen({ direction: rate > 1 ? 90 : 0 });
    videoContext.play();
  },
  /** 
	 * 预览图片
	 */
  previewImage: function (e) {
    var current = e.target.dataset.src;
    if (current==''){
         return;
    }
    let list=[];
    let store = this.data.store;
    if (store.business_licence_cert.length>2){
      list.push(store.business_licence_cert);
    }
    if (store.food_licence_cert.length > 2) {
      list.push(store.food_licence_cert);
    }
    if (store.trademark.length > 2) {
      list.push(store.trademark);
    }
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: list // 需要预览的图片http链接列表
    })
  }  
})