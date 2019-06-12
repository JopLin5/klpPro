import server from'../../../utils/server';
var pp=0;
var last_id=0;
class index{
	data={
     list:[]
	};

	onLoad=function (options) {
    pp = 0; last_id = 0;
    var that = this;
    this.getmsg(++pp,last_id,true);
	};

  getmsg = function (p, last_id, reload=false){
    let that=this;
    server.postJSON('/User/getMessage',
       {
         p: p,
         last_id: last_id
       }, function (res) {
         if (res.data.status != 1) {

           if (p == 1) {
             that.setData({ list: [], empty:true});
           } else {
             pp--;
           }
           
           return;
         }
         var newgoods = res.data.result
         var ms = [];
         if (reload) {
         } else {
           ms = that.data.list;

         }
         for (var i in newgoods) {
           ms.push(newgoods[i]);
           last_id = newgoods[i].id > last_id ? newgoods[i].id : last_id;
         }
         that.setData({
           empty: false,
           list: ms,
         });
       });
   }
  onPullDownRefresh = function () {
    pp=0;last_id=0;
    this.getmsg(++pp, last_id,true);
  }
  onReachBottom = function () {
    this.getmsg(++pp, last_id);

  }

}

Page(new index());