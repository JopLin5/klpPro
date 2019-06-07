import server from '../../../utils/server.js';
import event from '../../../utils/event.js';
var Page_num= 1;
class index{
  data = {
   list:[],
   empty:false,
    keyWord:''
  };

  search = function (e) {
    let self = this;
    Page_num = 1;
    let keyWord = this.data.keyWord || '';
    this.list(Page_num, keyWord, true);
  };

  del = function () {
    this.setData({ keyWord: '' });
    Page_num = 1;
    this.list(Page_num, '');
  }

  onchage = function (e) {
    this.setData({
      keyWord: e.detail.value
    });
  };
  onLoad = function (options) {
    Page_num=1;
    this.list(Page_num);
  }
  goto=function(e){
     console.log(e);
    let id = e.currentTarget.dataset.goods_id;
    let index = e.currentTarget.dataset.index;
    let list = this.data.list;
    list[index].view_time = parseInt(this.data.list[index].view_time)+1;
    this.setData({ list: list });
   wx.navigateTo({
     url: '/pages/goods/detail/detail?id=' + id,
   })
  }
  list=function(p=1,key=''){
    let self=this;
    server.postJSON('/Activity/mintuan_list', { p: p, key: key},function(res){
     if (res.data.status == 1) {
       let newgoods = res.data.result || [];
       let ms=[];
       if(p==1){
          ms =[]; 
       }else{
         ms= self.data.list; 
       }
      
       for (var i in newgoods) {
         ms.push(newgoods[i]);
       }
       self.setData({
         empty: false,
         list: ms
       });
       ++Page_num;
     }else{
       if(p==1){
         self.setData({ list: [], empty:true});
       }
       self.setData({empty: true });
       --Page_num;
     }
   });
  }
  onReachBottom = function () {
    this.list(Page_num, this.data.keyWord);
  };
  onPullDownRefresh = function () {
    this.list(1, this.data.keyWord);
  };
}
Page(new index());