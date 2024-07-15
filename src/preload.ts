const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  queryDatabase: (query: string) => ipcRenderer.send('query-database', query),
  onQueryResult: (callback: any) => ipcRenderer.on('query-result', (event: any, result: any) => callback(result))
});
