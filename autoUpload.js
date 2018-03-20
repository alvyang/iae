// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle(){
   //minimize
   ipcMain.on('hide-window', () => {
       mainWindow.minimize();
   });
   //maximize
   ipcMain.on('show-window', () => {
       mainWindow.maximize();
   });
   //unmaximize
   ipcMain.on('orignal-window', () => {
       mainWindow.unmaximize();
   });
   //打开默认浏览器
   ipcMain.on('open-office-website', function(event, arg){
       shell.openExternal(arg)
   })

   ipcMain.on('check-for-update', function(event, arg) {
       let message={
           appName:'药品销售管理软件',
           error:'检查更新出错, 请联系开发人员',
           checking:'正在检查更新……',
           updateAva:'检测到新版本，正在下载……',
           updateNotAva:'现在使用的就是最新版本，不用更新',
           downloaded: '最新版本已下载，将在重启程序后更新'
       };
       //设置检查更新的 url，并且初始化自动更新。这个 url 一旦设置就无法更改。
       const updateFeedUrl='http://139.129.238.114/updates/latest/win/';
       if(os.platform()==='darwin'){
           updateFeedUrl='http://139.129.238.114/updates/latest/mac/';
       }
       autoUpdater.setFeedURL(updateFeedUrl);

       autoUpdater.on('error', function(error){
           return dialog.showMessageBox(mainWindow, {
               type: 'info',
               buttons: ['OK'],
               title: message.appName,
               message: message.errorTips,
               detail: '\r' + message.error
           });

           sendUpdateMessage(message.error)
       });

       //当开始检查更新的时候触发
       autoUpdater.on('checking-for-update', function() {
           sendUpdateMessage(message.checking)
           return dialog.showMessageBox(mainWindow, {
               type: 'info',
               buttons: ['OK'],
               title: message.appName,
               message: message.checking
           });
       });

       //当发现一个可用更新的时候触发，更新包下载会自动开始
       autoUpdater.on('update-available', function(info) {
           sendUpdateMessage(message.updateAva)
           var downloadConfirmation = dialog.showMessageBox(mainWindow, {
               type: 'info',
               buttons: ['OK'],
               title: message.appName,
               message: message.updateAva
           });
           if (downloadConfirmation === 0) {
               return;
           }
       });

       //当没有可用更新的时候触发
       autoUpdater.on('update-not-available', function(info) {
           return dialog.showMessageBox(mainWindow, {
               type: 'info',
               buttons: ['OK'],
               title: message.appName,
               message: message.updateNotAva
           });
           sendUpdateMessage(message.updateNotAva)
       });
       // 更新下载进度事件
       autoUpdater.on('download-progress', function(progressObj) {
           mainWindow.webContents.send('downloadProgress', progressObj)
       })
       /**
         *  event Event
         *  releaseNotes String - 新版本更新公告
         *  releaseName String - 新的版本号
         *  releaseDate Date - 新版本发布的日期
         *  updateURL String - 更新地址
         **/
       autoUpdater.on('update-downloaded',  function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
           var index = dialog.showMessageBox(mainWindow, {
               type:'info',
               buttons: ['现在重启','稍后重启'],
               title: message.appName,
               message: message.downloaded,
               //detail: releaseName + "\n\n" + releaseNotes
           });
           if (index === 1) return;
           //在下载完成后，重启当前的应用并且安装更新
           autoUpdater.quitAndInstall();
           //通过main进程发送事件给renderer进程，提示更新信息
           //mainWindow.webContents.send('isUpdateNow')
       });

       //执行自动更新检查
       autoUpdater.checkForUpdates();
   });
}
