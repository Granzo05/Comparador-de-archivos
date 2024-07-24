const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDatabase: async (query: string) => {
    try {
      const response = await ipcRenderer.invoke('select-database', query);
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  insertDatabase: async (query: string, params: any) => {
    try {
      const response = await ipcRenderer.invoke('insert-database', query, params);
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  onQueryResult: (callback: (result: any) => void) => ipcRenderer.on('query-result', (event: any, result: any) => callback(result)),
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