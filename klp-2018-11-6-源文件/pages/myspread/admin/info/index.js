var server = require('../../../../utils/server');
var event = require('../../../../utils/event');
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
   
    let store_id = e.currentTarget.dataset.store_id || 0;
    server.postJSON('/store/guanliyuan_accept_apply/', { id: id, store_id: store_id},function(re){
        let data=re.data;
      if (data.status!=1){
        server.Toast_error(data.msg);
               return;
        }
      server.Toast_error(data.msg, function () {
        wx: wx.navigateBack({ delta: 1 }, 3000);
        event.emit('admintgjl', self.data.info._index);
      });

    }
    );
  },
  no:function(e){
    let self = this;
    console.log('拒绝');
    let id = e.currentTarget.dataset.id || 0;
    let from = e.currentTarget.dataset.from || 0;
    let store_id = e.currentTarget.dataset.store_id || 0;
    server.postJSON('/store/guanliyuan_oppose_apply/', { id: id, store_id: store_id }, function (re) {
      let data = re.data;
      if (data.status != 1) {
        server.Toast_error(data.msg);
        return;
      }
      server.Toast_error(data.msg, function () {
        event.emit('admintgjl', self.data.info._index);
        wx: wx.navigateBack({ delta: 1 }, 3000);
      
      });

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