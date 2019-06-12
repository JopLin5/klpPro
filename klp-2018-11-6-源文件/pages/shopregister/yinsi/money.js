import server from '../../../utils/server';
import WxParse from '../../../wxParse/wxParse.js';
class money{
   data={
     article: '<div>我是HTML代码</div>',
     curr_id: -1,
   };
	onLoad=function (option) {
    let self=this;
    let t=option.t;
   
    server.getJSON('/User/item?y='+t, function (res) {
      res = res.data;
      if (res.status < 1) {
        return;
      }
      wx.setNavigationBarTitle({
        title: res.result.desc
      })
      let content = WxParse.wxParse('article', 'html', res.result.value, self, 0);
      self.setData({ content: content['article'].nodes});
    });
	}
};

Page(new money());