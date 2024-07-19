const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDatabase: (query: string) => ipcRenderer.invoke('select-database', query),
  insertDatabase: (query: string) => ipcRenderer.invoke('insert-database', query),
  onQueryResult: (callback: (result: any) => void) => ipcRenderer.on('query-result', (event: any, result: any) => callback(result))
});

contextBridge.exposeInMainWorld('argon', {
  hashPassword: async (password: string) => {
    try {
      const hashedPassword = await argon2.hash(password);
      return hashedPassword;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }
});