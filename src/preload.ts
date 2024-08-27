import { Usuario } from "./types/Usuario";

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDatabase: async (query: string, params: any) => {
    try {
      return await ipcRenderer.invoke('select-database', query, params);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  insertDatabase: async (query: string, params: any, nombreColumnaId: string) => {
    try {
      return await ipcRenderer.invoke('insert-database', query, params, nombreColumnaId);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  onQueryResult: (callback: (result: any) => void) => ipcRenderer.on('query-result', (event: any, result: any) => callback(result)),
  checkPassword: async (storedHashedPassword: string, password: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('check-password', storedHashedPassword, password);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  checkRol: async (usuario: Usuario): Promise<boolean> => {
    try {
      if(usuario.rol === '1w0hZDvEmdRI2xGiXr8lbQ==') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
});