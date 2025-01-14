import { buscarPalabrasEnArchivo } from "../ts/resumen";
import { Docente } from "../types/Docente";

export const DocenteService = {
    buscarDatosDocente: async (docente: Docente, index: number) => {
        const posiblesPalabrasNombre = ['docente', 'maestra', 'maestro'];
        const posiblesPalabrasCuil = ['cuil', 'cuil de docente'];

        const palabraEncontradaNombreDocente = await buscarPalabrasEnArchivo(posiblesPalabrasNombre, index);
        const palabraEncontradaCUIL = await buscarPalabrasEnArchivo(posiblesPalabrasCuil, index);

        if (palabraEncontradaNombreDocente?.length > 0 && palabraEncontradaCUIL?.length > 0) {
            docente.nombre = palabraEncontradaNombreDocente.trim();
            docente.cuil = palabraEncontradaCUIL.trim();
        }
    },

    verificarExistenciaOCrearDocente: async (docente: Docente) => {
        try {
            const querySelect = `SELECT id_docente FROM docentes WHERE cuil = :cuil`;

            const params = { cuil: docente.cuil };

            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect, params);

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

    relacionarGradoDocente: async (idGrado: number, idDocente: number, fechas: string[]) => {
        const mesesYAñosSet = new Set<string>();

        for (const fecha of fechas) {
            const mesYAño = fecha.split('/')[1] + '/' + fecha.split('/')[2];

            if (!mesesYAñosSet.has(mesYAño)) {
                mesesYAñosSet.add(mesYAño);

                try {
                    const querySelect = `SELECT id_grado_docente FROM grados_docentes WHERE id_grado = :id_grado AND id_docente = :id_docente AND mes_y_año = :mes_y_año`;

                    const params = { id_grado: idGrado, id_docente: idDocente, mes_y_año: mesYAño };

                    const resultSelect: any = await window.electronAPI.selectDatabase(querySelect, params);

                    if (resultSelect.rows.length === 0) {
                        const queryInsert = `INSERT INTO grados_docentes (id_grado, id_docente, mes_y_año) 
                                     VALUES (:id_grado, :id_docente, :mes_y_año)`;
                        const params = { id_grado: idGrado, id_docente: idDocente, mes_y_año: mesYAño };
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