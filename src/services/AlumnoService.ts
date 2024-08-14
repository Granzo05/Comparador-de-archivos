import { buscarPalabrasEnElHeader } from "../ts/resumen";
import { Alumno } from "../types/Alumno";

export const AlumnoService = {
    buscarDatosAlumnos: async (alumnos: Alumno[], tablas: HTMLCollectionOf<HTMLTableElement>) => {
        for (const tabla of Array.from(tablas)) {
            const filas = tabla.rows;
            let posiblesPalabrasNombres = ['nombre de alumnos', 'nombre alumnos', 'nombre de los alumnos', 'alumnos', 'nombre del alumno'];
            let posiblesPalabrasDNI = ['dni', 'documento de alumno', 'documento de identidad'];

            let indexColumnaNombre = await buscarPalabrasEnElHeader(filas, posiblesPalabrasNombres);
            let indexColumnaDNI = await buscarPalabrasEnElHeader(filas, posiblesPalabrasDNI);

            if (indexColumnaNombre !== -1 && indexColumnaDNI !== -1) {
                for (let i = 1; i < filas.length; i++) {
                    const alumno: Alumno = new Alumno();
                    alumno.nombre = filas[i].cells[indexColumnaNombre].innerHTML.trim();
                    alumno.dni = filas[i].cells[indexColumnaDNI].innerHTML.trim();
                    alumnos.push(alumno);
                }
            }
        }
    },

    verificarExistenciaOCrearAlumnos: async (alumno: Alumno) => {
        try {
            const querySelect = `SELECT id_alumno FROM alumnos WHERE DNI = '${alumno.dni}'`;
            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

            if (resultSelect.rows.length > 0) {
                return resultSelect.rows[0].ID_ALUMNO;
            } else {
                const queryInsert = `INSERT INTO alumnos (dni, nombre) VALUES (:dni, :nombre)`;
                const params = {
                    dni: alumno.dni,
                    nombre: alumno.nombre
                };
                const result: any = await window.electronAPI.insertDatabase(queryInsert, params, 'id_alumno');
                return result.id;
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    },

    relacionarCursoAlumnos: async (idCurso: number, idAlumno: number, año: string) => {
        try {
            const querySelect = `SELECT id_curso_alumno FROM cursos_alumnos WHERE id_curso = ${idCurso} AND id_alumno = ${idAlumno} AND año = '${año}'`;
            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

            if (resultSelect.rows.length === 0) {
                const queryInsert = `INSERT INTO cursos_alumnos (id_curso, id_alumno, año) VALUES (:id_curso, :id_alumno, :año)`;
                const params = { id_curso: idCurso, id_alumno: idAlumno, año: año };
                await window.electronAPI.insertDatabase(queryInsert, params, '');
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    },

}