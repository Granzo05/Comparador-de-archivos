import { buscarPalabrasEnArchivo } from "../ts/resumen";

export const GradoService = {

    buscarGrado: async (index: number) => {
        const posiblesPalabras = ['grado', 'grados'];

        let palabraEncontrada = buscarPalabrasEnArchivo(posiblesPalabras, index);

        if (palabraEncontrada)
            return palabraEncontrada;
    },

    verificarExistenciaOCrearGrado: async (division: string, idEscuela: number) => {
        try {
            const querySelect = `SELECT id_grado FROM grados WHERE division = :division AND id_escuela = :id_escuela`;

            const params = { division: division, id_escuela: idEscuela };

            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect, params);

            if (resultSelect.rows.length > 0) {
                return resultSelect.rows[0].ID_GRADO;
            } else {
                const queryInsert = `INSERT INTO grados (division, id_escuela) VALUES (:division, :id_escuela)`;
                const params = { division: division, id_escuela: idEscuela };

                const result: any = await window.electronAPI.insertDatabase(queryInsert, params, 'id_grado');
                return result.id;
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    }
}