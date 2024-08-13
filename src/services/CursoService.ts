import { buscarPalabrasEnArchivo } from "../ts/resumen";

export const CursoService = {

    buscarCurso: async () => {
        const posiblesPalabras = ['divisionDelCurso', 'division', 'división'];

        let palabraEncontrada = buscarPalabrasEnArchivo(posiblesPalabras);

        if (palabraEncontrada)
            return palabraEncontrada;
    },
    
    verificarExistenciaOCrearCurso: async (division: string, idEscuela: number) => {     
        try {
            const querySelect = `SELECT id_curso FROM cursos WHERE division = '${division}' AND id_escuela = ${idEscuela}`;
            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

            if (resultSelect.rows.length > 0) {
                return resultSelect.rows[0];
            } else {
                const queryInsert = `INSERT INTO cursos (division, id_escuela) VALUES (:division, :id_escuela)`;
                const params = { division: division, id_escuela: idEscuela };
                await window.electronAPI.insertDatabase(queryInsert, params);

                const querySelect = `SELECT id_curso FROM cursos WHERE division = '${division} AND id_escuela = ${idEscuela}`;
                const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

                if (resultSelect.rows.length > 0) {
                    return resultSelect.rows[0];
                }
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    }
}