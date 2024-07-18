const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  queryDatabase: (query: string) => ipcRenderer.invoke('query-database', query),
  onQueryResult: (callback: (result: any) => void) => ipcRenderer.on('query-result', (event: any, result: any) => callback(result))
});
