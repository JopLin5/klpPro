const util = require('./util');
const SAVED_FILES_KEY = 'savedFiles';
const KEY_TOTAL_SIZE = 'totalSize';
const KEY_PATH = 'path';
const KEY_TEXT = 'text';
const KEY_TIME = 'time';
const KEY_SIZE = 'size';
let MAX_SPACE_IN_B = 8 * 1024 * 1024;
let savedFiles = {};
export
  default class Store {
  constructor() {
    wx.getStorage({
      key: SAVED_FILES_KEY,
      success: function (res) {
        if (res.data) {
          savedFiles = res.data
        }
      },
    })
  }
  get_text(key) {
    if (!savedFiles[key]) {
      return
    }
    return savedFiles[key][KEY_TEXT]
  }
  save_cache_text(key = '', text = '') {
    return new Promise((resolve, reject) => {
      if (key == '' || key == undefined || text == '') {
        return
      }
      let tt = get_text(key);
      if (tt != '' && tt != null && tt != undefined) {
        return
      }
      save_text(key, get_text_ize(text), text).then((text) => {
        resolve(text)
      }, () => {
        reject(text)
      })
    })
  }
  download(url) {
    return new Promise((resolve, reject) => {
      if (!(url && util.isValidUrl(url))) {
        resolve(url);
        return
      }
      const file = getFile(url);
      if (file) {
        wx.getSavedFileInfo({
          filePath: file[KEY_PATH],
          success: (res) => {
            resolve(file[KEY_PATH])
          },
          fail: (error) => {
            console.error(`the file is broken,redownload it,${JSON.stringify(error)}`);
            downloadFile(url).then((path) => {
              resolve(path)
            }, () => {
              reject()
            })
          },
        })
      } else {
        downloadFile(url).then((path) => {
          resolve(path)
        }, () => {
          reject()
        })
      }
    })
  }
  getFile(key) {
    if (!savedFiles[key]) {
      return
    }
    return savedFiles[key]
  }
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: url,
      success: function (res) {
        if (res.statusCode !== 200) {
          console.error(`downloadFile ${url}failed res.statusCode is not 200`);
          reject();
          return
        }
        const {
          tempFilePath
        } = res;
        wx.getFileInfo({
          filePath: tempFilePath,
          success: (tmpRes) => {
            const newFileSize = tmpRes.size;
            doLru(newFileSize).then(() => {
              saveFile(url, newFileSize, tempFilePath).then((filePath) => {
                resolve(filePath)
              })
            }, () => {
              resolve(tempFilePath)
            })
          },
          fail: (error) => {
            console.error(`getFileInfo ${res.tempFilePath}failed,${JSON.stringify(error)}`);
            resolve(res.tempFilePath)
          },
        })
      },
      fail: function (error) {
        console.error(`downloadFile failed,${JSON.stringify(error)}`);
        reject()
      },
    })
  })
}

function get_text(key) {
  if (!savedFiles[key]) {
    return
  }
  return savedFiles[key][KEY_TEXT]
}

function get_text_ize(text) {
  return unescape(encodeURIComponent(text)).length / 1024
}

function save_text(key, newFileSize, text = '', tempFilePath = '') {
  return new Promise((resolve, reject) => {
    try {
      const totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;
      savedFiles[key] = {};
      savedFiles[key][KEY_TEXT] = text;
      savedFiles[key][KEY_PATH] = tempFilePath;
      savedFiles[key][KEY_TIME] = new Date().getTime();
      savedFiles[key][KEY_SIZE] = newFileSize;
      savedFiles['totalSize'] = newFileSize + totalSize;
      wx.setStorage({
        key: SAVED_FILES_KEY,
        data: savedFiles,
      });
      resolve(text)
    } catch (e) {
      resolve(text);
      console.error(`text ${key}failed,then we delete all files,${JSON.stringify(error)}`);
      reset()
    }
  })
}

function saveFile(key, newFileSize, tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.saveFile({
      tempFilePath: tempFilePath,
      success: (fileRes) => {
        const totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;
        savedFiles[key] = {};
        savedFiles[key][KEY_PATH] = fileRes.savedFilePath;
        savedFiles[key][KEY_TIME] = new Date().getTime();
        savedFiles[key][KEY_SIZE] = newFileSize;
        savedFiles['totalSize'] = newFileSize + totalSize;
        wx.setStorage({
          key: SAVED_FILES_KEY,
          data: savedFiles,
        });
        resolve(fileRes.savedFilePath)
      },
      fail: (error) => {
        console.error(`saveFile ${key}failed,then we delete all files,${JSON.stringify(error)}`);
        resolve(tempFilePath);
        reset()
      },
    })
  })
}

function reset() {
  wx.removeStorage({
    key: SAVED_FILES_KEY,
    success: () => {
      wx.getSavedFileList({
        success: (listRes) => {
          removeFiles(listRes.fileList)
        },
        fail: (getError) => {
          console.error(`getSavedFileList failed,${JSON.stringify(getError)}`)
        },
      })
    },
  })
}

function doLru(size) {
  return new Promise((resolve, reject) => {
    let totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;
    if (size + totalSize <= MAX_SPACE_IN_B) {
      resolve();
      return
    }
    const pathsShouldDelete = [];
    const allFiles = JSON.parse(JSON.stringify(savedFiles));
    delete allFiles[KEY_TOTAL_SIZE];
    const sortedKeys = Object.keys(allFiles).sort((a, b) => {
      return allFiles[a][KEY_TIME] - allFiles[b][KEY_TIME]
    });
    for (const sortedKey of sortedKeys) {
      totalSize -= savedFiles[sortedKey].size;
      pathsShouldDelete.push(savedFiles[sortedKey][KEY_PATH]);
      delete savedFiles[sortedKey];
      if (totalSize + size < MAX_SPACE_IN_B) {
        break
      }
    }
    savedFiles['totalSize'] = totalSize;
    wx.setStorage({
      key: SAVED_FILES_KEY,
      data: savedFiles,
      success: () => {
        if (pathsShouldDelete.length > 0) {
          removeFiles(pathsShouldDelete)
        }
        resolve()
      },
      fail: (error) => {
        console.error(`doLru setStorage failed,${JSON.stringify(error)}`);
        reject()
      },
    })
  })
}

function removeFiles(pathsShouldDelete) {
  for (const pathDel of pathsShouldDelete) {
    let delPath = pathDel;
    if (typeof pathDel === 'object') {
      delPath = pathDel.filePath
    }
    if (delPath == undefined || delPath == '' || delPath == null) {
      return
    }
    wx.removeSavedFile({
      filePath: delPath,
      fail: (error) => {
        console.error(`removeSavedFile ${pathDel}failed,${JSON.stringify(error)}`)
      },
    })
  }
}

function getFile(key) {
  if (!savedFiles[key]) {
    return
  }
  savedFiles[key]['time'] = new Date().getTime();
  wx.setStorage({
    key: SAVED_FILES_KEY,
    data: savedFiles,
  });
  return savedFiles[key]
}