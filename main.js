const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const JSZip = require('jszip');
const os = require('os');

let win;

const args = process.argv.slice(1);
serve = args.some(val => val === 'local');

let baseDir;
let driveDir;
let confDir;
const home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
if (process.platform === 'darwin') {
  baseDir = path.join(home, 'Library', 'Application Support', 'EVE Online', 'p_drive',
    'Local Settings', 'Application Data', 'CCP', 'EVE', 'SharedCache',
    'wineenv', 'drive_c', 'users', os.userInfo().username, 'Local Settings',
    'Application Data', 'CCP', 'EVE');
} else if (process.platform === 'win32') {
  baseDir = path.join(home, 'AppData', 'Local', 'CCP', 'EVE');
}
let dir = baseDir;

ipcMain.on('resetDir', (event, arg) => {
  dir = baseDir;
  win.webContents.send('resetDirResponse');
});

ipcMain.on('setDrive', (event, arg) => {
  driveDir = arg;
  dir = path.join(baseDir, driveDir);
  win.webContents.send('setDriveResponse');
});

ipcMain.on('setConf', (event, arg) => {
  confDir = arg;
  dir = path.join(baseDir, driveDir, confDir);
  win.webContents.send('setConfResponse');
});

ipcMain.on('getFiles', (event, arg) => {
  fs.readdir(dir, (err, data) => {
    win.webContents.send('getFilesResponse', data);
  });
});

ipcMain.on('copySettings', (event, arg) => {
  const pre = `core_${arg[0]}_`;
  const main = arg[1];
  const list = arg.slice(2, arg.length);
  let zip = new JSZip();
  list.forEach(function (str) {
    zip.file(`${pre}${str}.dat`, fs.readFileSync(path.join(dir, `${pre}${str}.dat`)));
  });
  if (!fs.existsSync(path.join(dir, 'evep'))) {
    fs.mkdirSync(path.join(dir, 'evep'));
  }
  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream(path.join(dir, 'evep', `${arg[0]}_${encodeDate(new Date().toISOString())}.zip`)))
    .on('finish', function () {
      list.forEach(function (str) {
        fs.copyFileSync(path.join(dir, `${pre}${main}.dat`), path.join(dir, `${pre}${str}.dat`));
      });
      win.webContents.send('copyResponse');
    });
});

ipcMain.on('getBackups', (event, arg) => {
  fs.readdir(path.join(dir, 'evep'), (err, data) => {
    win.webContents.send('getBackupsResponse', data);
  })
});

ipcMain.on('getBackupInfo', (event, arg) => {
  fs.readFile(path.join(dir, 'evep', arg), (err, data) => {
    JSZip.loadAsync(data).then((zip) => {
      win.webContents.send('getBackupInfoResponse', Object.keys(zip.files));
    });
  });
});

ipcMain.on('importChars', (event, arg) => {
  uniqueFiles = [];
  fs.readdir(path.join(baseDir, driveDir), (err, data) => {
    data.filter((val) => /(settings)/.test(val)).forEach((val) => {
      files = fs.readdirSync(path.join(baseDir, driveDir, val)).filter((val) => /(core)_([a-z]{4})_([0-9]+)/.test(val));
      uniqueFiles.push(...files);
    });
    win.webContents.send('importCharsResponse', uniqueFiles);
  });
});

ipcMain.on('restoreBackup', (event, arg) => {
  fs.readFile(path.join(dir, 'evep', arg), (err, data) => {
    JSZip.loadAsync(data).then((zip) => {
      Object.keys(zip.files).forEach((file) => {
        zip.file(file).async("nodebuffer").then((val) => {
          const stream = fs.createWriteStream(path.join(dir, file));
          stream.write(val);
          stream.end();
        });
      });
      win.webContents.send('restoreBackupResponse', data);
    });
  });
});

const encodeDate = (date) => {
  const main = date.split("T");
  const one = main[0].split("-").join("");
  const two = main[1].split(".")[0].split(":").join("")
  return one + '-' + two;
}

const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 1200,
    icon: './src/favicon.ico'
  });

  if (serve) {
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

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
