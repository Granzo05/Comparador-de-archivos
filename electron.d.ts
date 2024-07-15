interface ElectronAPI {
    queryDatabase: (query: string) => void;
    onQueryResult: (callback: (result: any) => void) => void;
}

interface Window {
    electronAPI: ElectronAPI;
}