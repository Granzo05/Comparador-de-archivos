import { Alumno } from "./Alumno";
import { Docente } from "./Docente";
import { Escuela } from "./Escuela";
import { Estudio } from "./Estudio";

export class Grado {
    id: number = 0;
    division: string = '';
    escuela: Escuela = new Escuela();
    docente: Docente = new Docente();
    alumnos: Alumno[] = [];
    estudios: Estudio[] = [];

    constructor() {
    }
}