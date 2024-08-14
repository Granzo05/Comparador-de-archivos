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
  insertDatabase: async (query: string, params: any, nombreColumnaId: string) => {
    try {
      const response = await ipcRenderer.invoke('insert-database', query, params, nombreColumnaId);
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  onQueryResult: (callback: (result: any) => void) => ipcRenderer.on('query-result', (event: any, result: any) => callback(result)),
});