import { Grado } from "./Grado";

export class Alumno {
    id: number = 0;
    nombre: string = '';
    dni: string = '';
    grado: Grado = new Grado();

    constructor() {
    }
}