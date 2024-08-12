import { Escuela } from "./Escuela";

export class Alumno {
    id: number = 0;
    division: string = '';
    escuela: Escuela = new Escuela();

    constructor(id: number, division: string, escuela: Escuela) {
        this.id = id;
        this.division = division;
        this.escuela = escuela;
    }
}