import { buscarPalabrasEnArchivo } from "src/ts/resumen";

export const ParametroEstudioService = {
    buscarParametroEstudio: async () => {
        const posiblesPalabras = ['parametro de estudio', 'estudio', 'metodologia de estudio'];

        let palabraEncontrada = buscarPalabrasEnArchivo(posiblesPalabras);

        if (palabraEncontrada)
            return palabraEncontrada;
    },

    relacionarEstudioCurso: async (idParametroEstudio: number, idCurso: number, fechas: string[]) => {
        const mesesYAñosSet = new Set<string>();

        for (const fecha of fechas) {
            if (!mesesYAñosSet.has(fecha.split('/')[2])) {
                mesesYAñosSet.add(fecha.split('/')[2]);

                try {
                    const querySelect = `SELECT id_estudio_curso FROM estudio_cursos WHERE id_estudio = :idParametroEstudio AND id_curso = :idCurso`;

                    const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

                    if (resultSelect.rows.length === 0) {
                        const queryInsert = `INSERT INTO estudio_cursos (id_estudio, id_curso) 
                                     VALUES (:idParametroEstudio, :id_curso)`;
                        const params = { id_estudio: idParametroEstudio, id_curso: idCurso };
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