const electron = require('electron');
const {app, Menu, Tray} = require('electron');
var platform = require('os').platform();

// Module to control application life.

const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

ipc.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, function (files) {
    if (files) event.sender.send('selected-directory', files);
  });
});

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

exports.showMainWindow = () => {  
    mainWindow.show();
};

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Git Panda',
    width: 900,
    height: 800,
    // Hides the menu bar (file, edit, find and so on)
    autoHideMenuBar: true,
    show: false,
    skipTaskbar: true,
    icon: path.join(__dirname, './icons/png/64x64.png')
    //skipTaskbar: true
  });

  mainWindow.show();

  // mainWindow.on('minimize',function(event){
  //     event.preventDefault();
  //     mainWindow.hide();
  // });

  // mainWindow.on('close', function (event) {
  //     if( !app.isQuiting) {
  //         event.preventDefault()
  //         mainWindow.hide();
  //     }
  //     return false;
  // });

  mainWindow.on('focus', () => {
    mainWindow.webContents.send('ping', 'refresh');
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Tray icon



  // // Determine appropriate icon for platform
  // if (platform == 'darwin') {  
  //     trayImage = '/icons/png/16x16.png';
  // }
  // else if (platform == 'win32') {  
  //     trayImage = '/icons/win/icon.ico';
  // }
  
  // let tray = new Tray(path.join(__dirname, trayImage));

  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Show App', click:  function(){
  //           mainWindow.show();
  //       } },
  //       { label: 'Quit', click:  function(){
  //           app.isQuiting = true;
  //           app.quit();

  //       } }
  // ]);

  // tray.setToolTip('Git reminder');
  // tray.setContextMenu(contextMenu);

  // tray.on('click', () => {
  //   mainWindow.show();
  // });
  // if (platform == "darwin") {  
  //     appIcon.setPressedImage(imageFolder + '/osx/trayHighlight.png');
  // }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});