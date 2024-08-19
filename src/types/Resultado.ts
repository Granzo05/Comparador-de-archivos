import { Alumno } from "./Alumno";
import { Grado } from "./Grado";
import { Libro } from "./Libro";
import { Estudio } from "./Estudio";

export class Resultado {
    id: number = 0;
    alumno: Alumno = new Alumno();
    estudio: Estudio = new Estudio();
    libro: Libro = new Libro();
    grado: Grado = new Grado();
    fecha: Date = new Date();
    puntuacion: number = 0;

    constructor() {
    }
}