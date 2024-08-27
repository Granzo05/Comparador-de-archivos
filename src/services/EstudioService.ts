import { buscarPalabrasEnArchivo } from "../ts/resumen";

export const EstudioService = {
    buscarParametroEstudio: async (index: number) => {
        const posiblesPalabras = ['parametro de estudio', 'metodo de estudio', 'método de estudio', 'metodología de estudio', 'metodologia de estudio', 'palabras por minuto', 'palabras por minutos', 'palabra en minutos'];

        let palabraEncontrada = buscarPalabrasEnArchivo(posiblesPalabras, index);

        if (palabraEncontrada)
            return palabraEncontrada;
    },

    verificarExistenciaOCrearEstudio: async (descripcionParametro: string) => {
        try {
            const querySelect = `SELECT id_estudio FROM estudios WHERE descripcion = :descripcion`;

            const params = { descripcion: descripcionParametro };

            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect, params);

            if (resultSelect.rows.length > 0) {
                return resultSelect.rows[0].ID_ESTUDIO;
            } else {
                const queryInsert = `INSERT INTO estudios (descripcion) VALUES (:descripcion)`;
                const params = { descripcion: descripcionParametro };

                const result: any = await window.electronAPI.insertDatabase(queryInsert, params, 'id_estudio');
                return result.id;
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    },

    relacionarEstudioGrado: async (idParametroEstudio: number, idGrado: number, fechas: string[]) => {
        const mesesYAñosSet = new Set<string>();

        for (const fecha of fechas) {
            if (!mesesYAñosSet.has(fecha.split('/')[2])) {
                mesesYAñosSet.add(fecha.split('/')[2]);

                try {
                    const querySelect = `SELECT id_estudio_grado FROM estudio_grado WHERE id_estudio = :id_estudio AND id_grado = :id_grado AND fecha = :fecha`;

                    const params = { id_estudio: idParametroEstudio, id_grado: idGrado, fecha: fecha };

                    const resultSelect: any = await window.electronAPI.selectDatabase(querySelect, params);

                    if (resultSelect.rows.length === 0) {
                        const queryInsert = `INSERT INTO estudio_grado (id_estudio, id_grado, fecha) 
                                     VALUES (:id_estudio, :id_grado, :fecha)`;
                        const params = { id_estudio: idParametroEstudio, id_grado: idGrado, fecha: fecha };
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