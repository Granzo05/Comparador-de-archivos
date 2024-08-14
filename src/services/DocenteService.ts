import { buscarPalabrasEnArchivo } from "../ts/resumen";
import { Docente } from "../types/Docente";

export const DocenteService = {
    buscarDatosDocente: async (docentes: Docente[]) => {
        const posiblesPalabrasNombre = ['docente', 'maestra', 'maestro'];
        const posiblesPalabrasCuil = ['cuil', 'cuil de docente'];

        const palabraEncontradaNombreDocente = await buscarPalabrasEnArchivo(posiblesPalabrasNombre);
        const palabraEncontradaCUIL = await buscarPalabrasEnArchivo(posiblesPalabrasCuil);

        if (palabraEncontradaNombreDocente?.length > 0 && palabraEncontradaCUIL?.length > 0) {
            const newDocente: Docente = new Docente();
            newDocente.nombre = palabraEncontradaNombreDocente;
            newDocente.cuil = palabraEncontradaCUIL;
            docentes.push(newDocente);
        }
    },

    verificarExistenciaOCrearDocente: async (docente: Docente) => {
        try {
            const querySelect = `SELECT id_docente FROM docentes WHERE cuil = '${docente.cuil}'`;
            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

            if (resultSelect.rows.length > 0) {
                return resultSelect.rows[0].ID_DOCENTE;
            } else {
                const queryInsert = `INSERT INTO docentes (nombre, cuil) VALUES (:nombre, :cuil)`;
                const params = { nombre: docente.nombre, cuil: docente.cuil };

                const result: any = await window.electronAPI.insertDatabase(queryInsert, params, 'id_docente');
                return result.id;
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    },

    relacionarCursoDocente: async (idCurso: number, idDocente: number, fechas: string[]) => {
        const mesesYAñosSet = new Set<string>();

        for (const fecha of fechas) {
            const mesYAño = fecha.split('/')[1] + '/' + fecha.split('/')[2];

            if (!mesesYAñosSet.has(mesYAño)) {
                mesesYAñosSet.add(mesYAño);

                try {
                    const querySelect = `SELECT id_curso_docente FROM cursos_docentes WHERE id_curso = ${idCurso} AND id_docente = ${idDocente} AND mes_y_año = '${mesYAño}'`;
                    const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

                    if (resultSelect.rows.length === 0) {
                        const queryInsert = `INSERT INTO cursos_docentes (id_curso, id_docente, mes_y_año) 
                                     VALUES (:id_curso, :id_docente, :mes_y_año)`;
                        const params = { id_curso: idCurso, id_docente: idDocente, mes_y_año: mesYAño };
                        await window.electronAPI.insertDatabase(queryInsert, params, '');
                    }
                } catch (e) {
                    console.error(e);
                    return 0;
                }
            }
        }
    }
}