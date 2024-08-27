interface ElectronAPI {
    selectDatabase: (query: string, params: any) => void;
    insertDatabase: (query: string, params: any, nombreColumnaId: string) => void;
    checkRol: (usuario: Usuario) => boolean;
    onQueryResult: (callback: (result: any) => void) => void;
    checkPassword: (storedHashedPassword: string, password: string) => boolean;
}

interface Window {
    electronAPI: ElectronAPI;
}