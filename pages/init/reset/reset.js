import server from '../../../utils/server.js';
import event from '../../../utils/event.js';
var app = getApp();
var t=0;
var last_page=null;
class Reset{

  data={
    Length: 6,        //输入框个数  
    isFocus: true,    //聚焦  
    Value: "",        //输入的内容  
    ispassword: true, //是否密文显示 true为密文， false为明文
    _from: '',
    title: '',
    formId:'',
    code:'',
    can:false,
    timer: '',//定时器名
    init:10,
    countDownNum: '10',//倒计时初始值
    _from:0
  }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad=function (options) {
    let code =options.code||0;
    let _from = options._from||0;
    this.setData({_from: _from });
    if(code>0){
      this.setData({ code: code});
    }
  }
  cancel=function(){
    wx.navigateBack({delta:1})
  }
  getFormID=function (e) {
    this.setData({ formId: e.detail.formId});
  }
  codeInput = function (e) {
    var that = this;
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      code: inputValue,
    })
  }
  getPhoneNumber=function(e){
    let self=this;
    if (e.detail.errMsg !='getPhoneNumber:ok'){
         return;
       }
    t=1;
    self.countDown();
    let p =new Promise(function (resolve, rejust) {
      wx.login({
        success: function (res) {
          console.log(e);
          server.postJSON(
            //登陆连接		
            '/User/getPhone', {
              code: res.code,
              iv:e.detail.iv,
              encryptedData:e.detail.encryptedData,
              formId: self.data.formId,
              _from: self.data._from
            },
            function (response) {
              console.log(response);
              if (response.data.status == 1) {
                resolve(response.data);
              } else { 
                rejust(response.data);
              }
            }
          );
        }
      })
    });
    p.then(function(re){
     
      self.setData({title:re.result.phoneNumber});
      
    }, function (re){
      server.Toast_error(re.msg);
    }).catch(function(re){
    
    });
   console.log(e);
  }
  Focus=function(e) {
    var that = this;
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue,
    })
  }
  Tap=function(e){
    console.log('点击输入');
    var that = this;
    that.setData({
      isFocus: true,
    })
  }
  resetPassword =function(e) {
    let p = this._update_wallet(this.data._from, this.data.title, this.data.Value, this.data.code);
   p.then(function(re){
     server.Toast_error(re.msg);
     wx.navigateBack({ delta: 1 });
   },function(re){
     server.Toast_error(re.msg);
   });
  }
  _update_wallet=function(_from,phone,password,code){
    return new Promise(function(succ,err){
      server.postJSON('/User/change_walle_password', { _from: _from, phone: phone, password: password, code: code }, function (re) {
        if (re.data.status==1){
          succ(re.data);
            }else{
          err(re.data);
            }
      });
    });
   
  }
  countDown=function () {
  let that = this;
  let countDownNum = that.data.countDownNum;//获取倒计时初始值
  //如果将定时器设置在外面，那么用户就看不到countDownNum的数值动态变化，所以要把定时器存进data里面
  that.setData({
    timer: setInterval(function () {//这里把setInterval赋值给变量名为timer的变量
      //每隔一秒countDownNum就减一，实现同步
      countDownNum--;
      //然后把countDownNum存进data，好让用户知道时间在倒计着
      that.setData({
        countDownNum: countDownNum,
        can:true
      })
      //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
      if (countDownNum == 0) {
        //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
        //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
        clearInterval(that.data.timer);
        //关闭定时器之后，可作其他处理codes go here
        that.setData({ can: false, countDownNum:that.data.init});
      }
    }, 1000)
  })
}
}
Page(new Reset());