const { app, BrowserWindow, screen: electronScreen, ipcMain } = require('electron');
const path = require('path');
const oracledb = require('oracledb');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  const { width, height } = electronScreen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `./html/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar la conexión a la base de datos:', err);
      }
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let connection: any;
async function connectToDatabase() {
  try {
    connection = await oracledb.getConnection({
      user: 'tu_usuario',
      password: 'tu_contraseña',
      connectString: 'localhost/XE'
    });
    console.log('Conexión exitosa a la base de datos');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
}

app.on('ready', connectToDatabase);
ipcMain.on('query-database', async (event: any, query: string) => {
  try {
    const result = await connection.execute(query);
    event.reply('query-result', { rows: result.rows });
  } catch (err) {
    event.reply('query-result', { error: err.message });
  }
});

app.on('before-quit', async () => {
  if (connection) {
    try {
      await connection.close();
    } catch (err) {
      console.error('Error al cerrar la conexión a la base de datos:', err);
    }
  }
});