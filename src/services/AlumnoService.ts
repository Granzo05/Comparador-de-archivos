import { buscarPalabrasEnElHeader } from "src/ts/resumen";
import { Alumno } from "src/types/Alumno";

export const AlumnoService = {
    buscarDatosAlumnos: async (alumnos: Alumno[], tablas: HTMLCollectionOf<HTMLTableElement>) => {
        for (const tabla of Array.from(tablas)) {
            const filas = tabla.rows;
            let posiblesPalabras = ['alumno', 'alumnos'];

            let indexColumna = await buscarPalabrasEnElHeader(filas, posiblesPalabras);

            if (indexColumna !== -1) {
                for (let i = 1; i < filas.length; i++) {
                    const alumno: Alumno = new Alumno();
                    alumno.nombre = filas[i].cells[indexColumna].innerHTML.trim();
                    alumnos.push(alumno);
                }
            }

            posiblesPalabras = ['dni', 'documento de alumno', 'documento de identidad'];

            indexColumna = await buscarPalabrasEnElHeader(filas, posiblesPalabras);

            if (indexColumna !== -1) {
                for (let i = 1; i < filas.length; i++) {
                    const alumno: Alumno = new Alumno();
                    alumno.dni = filas[i].cells[indexColumna].innerHTML.trim();
                    alumnos.push(alumno);
                }
            }
        }
    },

    relacionarCursoAlumnos: async (idCurso: number, idAlumno: number, año: string) => {
        try {
            const querySelect = `SELECT id_curso_alumno FROM cursos_alumnos WHERE id_curso = '${idCurso} AND id_alumno = '${idAlumno}' AND año = '${año}'`;
            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

            if (resultSelect.rows.length === 0) {
                const queryInsert = `INSERT INTO cursos_alumnos (idCurso, idAlumno, año) VALUES (:id_alumno, :id_estudio, :año)`;
                const params = { id_curso: idCurso, id_alumno: idAlumno, año: año };
                await window.electronAPI.insertDatabase(queryInsert, params);
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    },

}