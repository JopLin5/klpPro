/**
 * 图片预加载组件
 *
 * @author HuiminLiu
 */
import regeneratorRuntime from '../regenerator-runtime/runtime.js';
let savedFiles = {};
const util = require('../utils/util');
class ImgLoader {

  /**
   * 初始化方法，在页面的 onLoad 方法中调用，传入 Page 对象及图片加载完成的默认回调
   */
  constructor(pageContext, defaultCallback) {
    this.page = pageContext || {}
    this.defaultCallback = defaultCallback || function() {}
    this.callbacks = {}
    this.imgInfo = {}
    savedFiles = {};
    
    this.page._imgOnLoad = this._imgOnLoad.bind(this)
    this.page._imgOnLoadError = this._imgOnLoadError.bind(this)
  }
  download(url) {
    return new Promise((resolve, reject) => {
      if (!(url && util.isValidUrl(url))) {
        resolve(url);
        return;
      }
      const file =getFile(url);

      if (file) {
        // 检查文件是否正常，不正常需要重新下载
        wx.getFileInfo({
          filePath: file[KEY_PATH],
          success: (res) => {
            resolve(file[KEY_PATH]);
          },
          fail: (error) => {
            console.error(`the file is broken, redownload it, ${JSON.stringify(error)}`);
            this.downloadFile(url).then((path) => {
              resolve(path);
            }, () => {
              reject();
            });
          },
        });
      } else {
        this.downloadFile(url).then((path) => {
          resolve(path);
        }, () => {
          reject();
        });
      }
    });
  }

  downloadFile(url) {
  let self=this;
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: url,
      success: function (res) {
        if (res.errMsg !=='getImageInfo:ok') {
          console.error(`downloadFile ${url} failed res.statusCode is not 200`);
          reject();
          return;
        }
        const { path } = res;
        self.saveFile(url, 0, path).then((filePath) => {
          resolve(filePath);
        }, () => {
          resolve(path);
        });
      },
      fail: function (error) {
        console.error(`downloadFile failed, ${JSON.stringify(error)} `);
        reject();
      },
    });
  });
}
 saveFile(key, newFileSize, tempFilePath) {
  return new Promise((resolve, reject) => {

    const totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;
    savedFiles[key] = {};
    savedFiles[key][KEY_PATH] = tempFilePath;
    savedFiles[key][KEY_TIME] = new Date().getTime();
    savedFiles[key][KEY_SIZE] = newFileSize;
    savedFiles['totalSize'] = newFileSize + totalSize;
    wx.setStorage({
      key: SAVED_FILES_KEY,
      data: savedFiles,
    });
    resolve(tempFilePath);
  });
}
  /**
   * 加载图片
   *let savedFiles = {};
   * @param  {String}   src      downloadFile
   * @param  {Function} callback 加载完成后的回调（可选），第一个参数个错误信息，第二个为图片信息
   */
  load(src, callback) {
    if (!src) return;
    let self = this;
    
    if (callback)
      this.callbacks[src] = callback

    this.download(src).then(function(re) {
      console.log('回调');
      console.log(re);
      self._runCallback(null, {
        src: src,
        path: re
      })
    });
    return this.get_image_from_cache(src);
  }
   get_image_from_cache(src){
     const file =getFile(src);
     if (file){
       console.log('cache');
       console.log(file.path);
       console.log('cache_end');
          return file.path;
     }else{
       console.log('no_cache');
       console.log(src);
       console.log('no_cache_end');
       return src;
     
     }

   }
  _imgOnLoad(ev) {
    let src = ev.currentTarget.dataset.src,
      width = ev.detail.width,
      height = ev.detail.height

    //记录已下载图片的尺寸信息
    this.imgInfo[src] = {
      width,
      height
    }
    this._removeFromLoadList(src)

    this._runCallback(null, {
      src,
      width,
      height
    })
  }

  _imgOnLoadError(ev) {
    let src = ev.currentTarget.dataset.src
    this._removeFromLoadList(src)
    this._runCallback('Loading failed', {
      src
    })
  }

  //将图片从下载队列中移除
  _removeFromLoadList(src) {
    let list = this.page.data.imgLoadList
    list.splice(list.indexOf(src), 1)
    this.page.setData({
      'imgLoadList': list
    })
  }

  //执行回调
  _runCallback(err, data) {
    let callback = this.callbacks[data.src] || this.defaultCallback;
    if (typeof(callback)=='function'){
      console.log('执行回调');
      callback(err, data)
      delete this.callbacks[data.src]
    }

  }
}//对象结束
function getFile(key) {
  if (!savedFiles[key]) {
    return;
  }
  savedFiles[key]['time'] = new Date().getTime();
  return savedFiles[key];
}
module.exports = ImgLoader