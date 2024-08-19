import { Libro } from "./Libro";
import { Resultado } from "./Resultado";

export class Estudio {
    id: number = 0;
    descripcion: string = '';
    libros: Libro[] = [];
    resultados: Resultado[] = [];

    constructor() {
    }
}