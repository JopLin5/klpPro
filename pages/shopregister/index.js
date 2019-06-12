
let server = require('../../utils/server');
let qiniuUploader = require('../../utils/qiniuUploader');
let app=getApp();
let param={};
Page({
  data: {
    tempFilePaths:{},
    percent: 0,
    in_percent: false,
    url:'',
    v:{},
    company_name:'',
    vertify:'',
    store_person_mobile:''
  },
  is_letter_or_num:function(e){
    var b = /[^\w\.\/]/ig;
    if(b.test(e.detail.value)){
      server.Toast_error('只能输入数字或字母');
      return this.data.v;
    }
    this.setData({ v: e.detail.value});
  },
  img_item: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.data.tempFilePaths[e.currentTarget.dataset.name] = res.tempFilePaths[0];
        that.setData({tempFilePaths:that.data.tempFilePaths});
      }
    })
  },
  getsite:function () {
    wx.setClipboardData({
      data: 'www.klpfood.com',
      success(res) {
        server.Toast_error('复制成功,请到浏览器打开');
      }
    })
  },
  navigateToitem:function (op) {
    let item = op.currentTarget.dataset.type;
    wx.navigateTo({
      url: './yinsi/money?t='+item
    });
  },
  /**登陆注册 */
  getUserInfo:function(e){
    let self=this;
    app.check_login_AND_register(e).then(function () {
      self.formSubmit(param);
    });
  },
  /**注册参数 */
  formdata:function(e){
    param=e;
  },
  //POST
  formSubmit: function (e) {
    var that = this;
    if (e.detail.value.legal_identity == '') {
      server.Toast_error('请填写身份证号码');
      return;
    }
    if (that.data.tempFilePaths['food_licence_cert'] == null || that.data.tempFilePaths['legal_identity_cert_f'] == null || that.data.tempFilePaths['legal_identity_cert'] == null || that.data.tempFilePaths['business_licence_cert'] == null){
      server.Toast_error('请上传完整证件照片');
      return;
    }
    if (e.detail.value.company_name == ''|| e.detail.value.business_licence_number == ''|| e.detail.value.legal_person == '' ||e.detail.value.store_person_mobile == '' || e.detail.value.password == '' || e.detail.value.store_name == '') {
      server.Toast_error('请填写完整信息');
      return;
      };

    if (e.detail.value.store_person_mobile.length!=11){
      server.Toast_error('请填写11位手机号');
      return;
      }
    if (e.detail.value.password != e.detail.value.password1){
        server.Toast_error('密码不一样');
        return;
      }
    if (e.detail.value.password.length!=6) {
      server.Toast_error('密码长度不对，要求6位');
      return;
    }
      //上传图片，提交请求后台
    that.check_verfiy().then(function(){
      return that.btn_up(that.data.tempFilePaths);
    }).then(function(pics){
      let data=Object.assign(pics, e.detail.value);
      server.postJSON('/Store/shop_apply', data, function (re) {
        if (re.data.status < 1) {
          server.Toast_error(re.data.msg);
          return;
        }
       
        wx.showModal({
          title: '',
          content: re.data.msg,
          success(res) {
            if (res.confirm) {
              wx.navigateBack({
                delta:1
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      });
    }).catch(function(e){
      wx.hideLoading();
      server.Toast_error('上传失败');
    });
  },
  check_verfiy:function(){
    let self=this;
    return new Promise(function(success,error){
      server.postJSON('/Store/check_vertify', { store_name: self.data.store_name, company_name: self.data.company_name, vertify: self.data.vertify, mobile: self.data.mobile},function(re){
        if (re.data.status<1){
          self.changge();
          server.Toast_error(re.data.msg);
          return;
        }
        success();
      });
    });
  
  },
  //七牛上传多张图片
  btn_up: function (pic) {
    var imgList ={};//多张图片地址，保存到一个数组当中
    var state = 0;//state记录当前已经上传到第几张图片
    var len = qiniuUploader.count(pic);
    wx.showLoading({title: '上传图片',});
   return new Promise(function (resolve, reject) {
      for (let i  in pic ) {
        qiniuUploader.upload(pic[i], (res) => {
          state++;
          imgList[i] = res.imageURL;
          if (state == len) {
            wx.hideLoading();
            resolve(imgList);
          }
        }, (error) => {
          reject(error);
          console.log('error: ' + error);
        }, {
            region: 'ECN',
            uploadURL: 'https://up-z0.qiniup.com',
            uptokenURL:'https://wapi.klpfood.com/index.php/WXAPI/store/upload_token'
          })
      }

    });
  },
  bindStoreNameInput: function (e) {
    this.setData({
      store_name: e.detail.value
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      company_name: e.detail.value
    })
  },
  bindmobileInput: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  bindvertify:function(e){
    this.setData({ vertify: e.detail.value});
  },
  changge: function () {
    if (this.data.company_name==''){
      server.Toast_error('请先写企业名');
      return;
    }
    console.log(this.data.company_name);
    this.setData({
      url: 'https://wapi.klpfood.com/index.php/WXAPI/store/vertify?_=' + Math.floor(Math.random() * 10 + 1) + '&user_id=' + encodeURIComponent(this.data.company_name)
    });
  },
  onLoad: function (options) {
    param={};
  },
  onShow: function () {
  
  },
  onReachBottom: function (e) {
    console.log(e)
  }
})
