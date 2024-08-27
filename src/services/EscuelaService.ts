import { buscarPalabrasEnArchivo } from "../ts/resumen";

export const EscuelaService = {
    buscarEscuela: async (index: number) => {
        const posiblesPalabras = ['establecimiento', 'escuela'];

        let palabraEncontrada = buscarPalabrasEnArchivo(posiblesPalabras, index);

        if (palabraEncontrada)
            return palabraEncontrada;
    },

    verificarExistenciaOCrearEscuela: async (nombreEscuela: string) => {
        try {
            const querySelect = `SELECT id_escuela FROM escuelas WHERE nombre = :nombre`;

            const params = { nombre: nombreEscuela };

            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect, params);

            if (resultSelect.rows.length > 0) {
                return resultSelect.rows[0].ID_ESCUELA;
            } else {
                const queryInsert = `INSERT INTO escuelas (nombre) VALUES (:nombre)`;
                const params = { nombre: nombreEscuela };

                const result: any = await window.electronAPI.insertDatabase(queryInsert, params, 'id_escuela');
                return result.id;
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    },
}