const electron = require('electron');
const electronUpdater = require("electron-updater");
const autoUpdater = electronUpdater.autoUpdater
const action = require("./action/index.js");

// Module to control application life.
const app = electron.app;
const ipcMain = electron.ipcMain;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
//var binary = require('node-pre-gyp');
//var path = require('path');
//var binding_path = binary.find(path.resolve(path.join(__dirname,'../package.json')));
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 800})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// mainWindow = new BrowserWindow()
function sendUpdateMessage(text){
    mainWindow.webContents.send('message', text)
}

ipcMain.on('check-for-update', function(event, arg) {
    //设置检查更新的 url，并且初始化自动更新。这个 url 一旦设置就无法更改。
    let message={
        appName:'药品销售管理软件',
        error:'检查更新出错, 请联系开发人员',
        checking:'正在检查更新……',
        updateAva:'检测到新版本，正在下载……',
        updateNotAva:'现在使用的就是最新版本，不用更新',
        downloaded: '最新版本已下载，将在重启程序后更新'
    };
    //设置检查更新的 url，并且初始化自动更新。这个 url 一旦设置就无法更改。
    const updateFeedUrl='http://139.129.238.114/web/upload';
    // if(os.platform()==='darwin'){
    //     updateFeedUrl='http://139.129.238.114/web/upload';
    // }
    autoUpdater.setFeedURL(updateFeedUrl);
    autoUpdater.on('error', function(error){
      sendUpdateMessage(message.error)
    });
    autoUpdater.on('checking-for-update', function() {
      sendUpdateMessage(message.checking)
    });
    autoUpdater.on('update-available', function(info) {
      sendUpdateMessage(message.updateAva)
    });
    autoUpdater.on('update-not-available', function(info) {
      sendUpdateMessage(message.updateNotAva)
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function(progressObj) {
      mainWindow.webContents.send('downloadProgress', progressObj)
    })
    autoUpdater.on('update-downloaded',  function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      ipcMain.on('isUpdateNow', (e, arg) => {
          //some code here to handle event
          autoUpdater.quitAndInstall();
      })
      mainWindow.webContents.send('isUpdateNow')
    });

    //执行自动更新检查
    autoUpdater.checkForUpdates();
});

//运行监听事件
action.runAction();
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  app.quit()
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
