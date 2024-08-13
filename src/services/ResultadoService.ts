import { buscarPalabrasEnElHeader } from "src/ts/resumen";
import { Resultado } from "src/types/Resultado";

export const ResultadoService = {
    buscarResultados: async (resultados: Resultado[], tablas: HTMLCollectionOf<HTMLTableElement>) => {
        for (const tabla of Array.from(tablas)) {
            const filas = tabla.rows;
            const posiblesPalabras = ['resultado', 'nota', 'notas', 'palabra por minuto', 'palabras por minuto'];

            let indexColumna = await buscarPalabrasEnElHeader(filas, posiblesPalabras);

            if (indexColumna !== -1) {
                for (let i = 1; i < filas.length; i++) {
                    const result: Resultado = new Resultado();
                    result.puntuacion = parseFloat(filas[i].cells[indexColumna].innerHTML.trim());
                    resultados.push(result);
                }
            }
        }
    },

    verificarExistenciaOCrearResultado: async (resultado: Resultado) => {
        try {
            const querySelect = `SELECT id_resultado FROM resultados_estudios WHERE id_alumno = '${resultado.idAlumno} AND id_estudio = '${resultado.idEstudio}' 
          AND id_libro = ${resultado.idLibro} AND fecha = '${resultado.fecha} AND puntuacion = '${resultado.puntuacion}'`;
            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

            if (resultSelect.rows.length === 0) {
                const queryInsert = `INSERT INTO resultados_estudios (id_alumno, id_estudio, id_libro, fecha, puntuacion) VALUES (:id_alumno, :id_estudio, idLibro, :fecha, :puntuacion)`;
                const params = { id_alumno: resultado.idAlumno, id_estudio: resultado.idEstudio, id_libro: resultado.idLibro, fecha: resultado.fecha, puntuacion: resultado.puntuacion };
                await window.electronAPI.insertDatabase(queryInsert, params);
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    }
}