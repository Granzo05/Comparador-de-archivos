import { Escuela } from "./Escuela";

export class Curso {
    id: number = 0;
    division: string = '';
    escuela: Escuela = new Escuela();

    constructor() {
    }
}