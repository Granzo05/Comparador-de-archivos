interface ElectronAPI {
    selectDatabase: (query: string) => void;
    insertDatabase: (query: string, params: any, nombreColumnaId: string) => void;
    onQueryResult: (callback: (result: any) => void) => void;
}

interface Window {
    electronAPI: ElectronAPI;
}