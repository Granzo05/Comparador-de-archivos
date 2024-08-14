const { app, BrowserWindow, screen: electronScreen, ipcMain } = require('electron');
const path = require('path');
export const oracledb = require('oracledb');
require('dotenv').config();
const argon2 = require('argon2');

// Configuración del cliente Oracle
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.initOracleClient({ libDir: 'B:/Oracle/instantclient_21_13' });

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let connection: any;

const createWindow = () => {
  const { width, height } = electronScreen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    },
  });

  if (process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, './html/index.html'));
  }

  mainWindow.webContents.openDevTools();
};

app.on('ready', async () => {
  await connectToDatabase();
  createWindow();
});

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

async function connectToDatabase() {
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });
    console.log('Conexión exitosa a la base de datos');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
}

async function executeQuery(query: string) {
  if (connection) {
    try {
      const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

      const processedRows = await Promise.all(result.rows.map(async (row: any) => {
        for (const key in row) {
          if (row[key] instanceof oracledb.Lob) {
            row[key] = await lobToString(row[key]);
          }
        }
        return row;
      }));

      return { rows: processedRows };
    } catch (err) {
      console.error('Error executing query:', err);
      return { error: err.message };
    }
  } else {
    return { error: 'No connection to the database.' };
  }
}

const lobToString = (lob: any) => {
  return new Promise((resolve, reject) => {
    let lobData = '';

    lob.setEncoding('utf8');
    lob.on('data', (chunk: any) => {
      lobData += chunk;
    });
    lob.on('end', () => {
      resolve(lobData);
    });
    lob.on('error', (err: any) => {
      reject(err);
    });
  });
};

async function executeInsert(query: string, params: any, nombreColumnaId: string) {
  if (connection) {
    try {
      if (nombreColumnaId.length > 0) {
        const queryWithReturning = `${query} RETURNING ${nombreColumnaId} INTO :id`;

        params.id = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };

        const result = await connection.execute(queryWithReturning, params, { autoCommit: true });

        return { id: result.outBinds.id[0] };

      } else {
        const result = await connection.execute(query, params, { autoCommit: true });
        return { rows: result.rows };
      }
    } catch (err) {
      console.error('Error executing insert query:', err);
      return { error: err.message };
    }
  } else {
    return { error: 'No connection to the database.' };
  }
}


ipcMain.handle('select-database', async (event: any, query: any) => {
  try {
    return await executeQuery(query);
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('insert-database', async (event: any, query: any, params: any, nombreColumnaId: string) => {
  try {
    return await executeInsert(query, params, nombreColumnaId);
  } catch (err) {
    return { error: err.message };
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
