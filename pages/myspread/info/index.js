var server = require('../../../utils/server');
var event = require('../../../utils/event');
Page({
  data:{
  info:{}
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let y = server.de(options);
    this.setData({ info: y});
  },

  yes:function(e){
    let self=this;
    let id = e.currentTarget.dataset.id||0;
    let from = e.currentTarget.dataset.from || 0;
    let store_id = e.currentTarget.dataset.store_id || 0;
    let url = from > 0 ? '/store/m_accept/' : '/store/accept/';
    server.postJSON(url, { id: id, store_id: store_id},function(re){
        let data=re.data;
      if (data.status!=1){
        server.Toast_error(data.msg);
               return;
        }
      if (from == 0) {
        server.Toast_error(data.msg, function () {
          wx: wx.navigateBack({ delta: 1 }, 3000);
          event.emit('tgy', self.data.info._index);
        });
      } else {//tgjl
        server.Toast_error(data.msg, function () {
          wx: wx.navigateBack({ delta: 1 }, 3000);
          event.emit('tgjl', self.data.info._index);
        });
      }

    }
    );
  },
  no:function(e){
    let self = this;
    let id = e.currentTarget.dataset.id || 0;
    let from = e.currentTarget.dataset.from || 0;
    let store_id = e.currentTarget.dataset.store_id || 0;
    let url = from > 0 ? '/store/m_oppose/' : '/store/oppose/';
    server.postJSON(url, { id: id, store_id: store_id }, function (re) {
      let data = re.data;
      if (data.status != 1) {
        server.Toast_error(data.msg);
        return;
      }
      if(from==0){
        server.Toast_error(data.msg, function () {
          wx: wx.navigateBack({ delta: 1 }, 3000);
          event.emit('tgy', self.data.info._index);
        });
      } else {//tgjl
        server.Toast_error(data.msg, function () {
          wx: wx.navigateBack({ delta: 1 }, 3000);
          event.emit('tgjl', self.data.info._index);
        });
      }


    }
    );
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  }
})