const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const JSZip = require('jszip');

let win;
let dir = '/Users/akaash/dev/EVEProfile/';

ipcMain.on('getFiles', (event, arg) => {
  const files = fs.readdirSync('/Users/akaash/dev/EVEProfile/');
  win.webContents.send('getFilesResponse', files);
});

ipcMain.on('getFileContent', (event, arg) => {
  const contents = fs.readFileSync('/Users/akaash/dev/EVEProfile/prefs.ini', 'utf8');
  win.webContents.send('getFileResponse', contents);
});

ipcMain.on('copyCharSettings', (event, arg) => {
  const pre = 'core_char_'
  const main = arg[0];
  const list = arg.filter(function (char) {
    return char !== main;
  });
  console.log(list);
  let zip = new JSZip();
  list.forEach(function (char) {
    zip.file(`${pre}${char}.dat`, fs.readFileSync(`${dir}${pre}${char}.dat`));
  });
  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream(`${dir}backups/c_${new Date().toISOString()}.zip`))
    .on('finish', function () {
      list.forEach(function (char) {
        fs.copyFileSync(`${dir}${pre}${main}.dat`, `${dir}${pre}${char}.dat`);
      });
      win.webContents.send('copyCharResponse');
    });
});

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 1200
  });

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  // The following is optional and will open the DevTools:
  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

// on macOS, closing the window doesn't quit the app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// initialize the app's main window
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
