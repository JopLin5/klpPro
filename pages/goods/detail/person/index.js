import server from '../../../../utils/server.js';
import event from '../../../../utils/event.js';
import regeneratorRuntime from '../../../../regenerator-runtime/runtime.js';
import WxParse from '../../../../wxParse/wxParse.js';

class index{
   data={
     list:[]
   }

  onLoad = function (options) {
    let id = options.id || 0;
    let self=this;
    server.postJSON('/Goods/buyer_list', { goods_id:id},function(re){
      if (re.data.status == 1) {
        let list=re.data.result;
        self.setData({ list: list});
      }
    });
  }

}
Page(new index());