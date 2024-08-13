import { buscarPalabrasEnArchivo } from "src/ts/resumen";
import { Docente } from "src/types/Docente";

export const DocenteService = {
    buscarDatosDocente: async (docentes: Docente[]) => {
        let posiblesPalabras = ['docente', 'maestra', 'maestro'];

        let palabraEncontrada = await buscarPalabrasEnArchivo(posiblesPalabras);

        if (palabraEncontrada) {
            const newDocente: Docente = new Docente();
            newDocente.nombre = palabraEncontrada;
            docentes.push(newDocente);
        }

        posiblesPalabras = ['cuil', 'cuil de docente'];

        palabraEncontrada = await buscarPalabrasEnArchivo(posiblesPalabras);

        if (palabraEncontrada) {
            const newDocente: Docente = new Docente();
            newDocente.cuil = palabraEncontrada;
            docentes.push(newDocente);
        }
    },

    relacionarCursoDocente: async (idCurso: number, idDocente: number, fechas: string[]) => {
        const mesesYAñosSet = new Set<string>();

        for (const fecha of fechas) {
            const mesYAño = fecha.split('/')[1] + '/' + fecha.split('/')[2];

            if (!mesesYAñosSet.has(mesYAño)) {
                mesesYAñosSet.add(mesYAño);

                try {
                    const querySelect = `SELECT id_curso_docente FROM cursos_docentes WHERE id_curso = :idCurso AND id_docente = :idDocente AND mes_y_año = :mesYAño`;

                    const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

                    if (resultSelect.rows.length === 0) {
                        const queryInsert = `INSERT INTO cursos_docentes (id_curso, id_docente, mes_y_año) 
                                     VALUES (:idCurso, :idDocente, :mesYAño)`;
                        const params = { idCurso, idDocente, mesYAño };
                        await window.electronAPI.insertDatabase(queryInsert, params);
                    }
                } catch (e) {
                    console.error(e);
                    return 0;
                }
            }
        }
    }
}