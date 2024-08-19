import { buscarPalabrasEnElHeader } from "../ts/resumen";
import { Resultado } from "../types/Resultado";

export const ResultadoService = {
    buscarResultados: async (resultados: Resultado[], tablas: HTMLCollectionOf<HTMLTableElement>) => {
        for (const tabla of Array.from(tablas)) {
            const filas = tabla.rows;
            const posiblesPalabras = ['resultado', 'nota', 'notas', 'palabra por minuto', 'palabras por minuto'];

            let indexColumna = await buscarPalabrasEnElHeader(filas, posiblesPalabras);

            if (indexColumna !== -1) {
                for (let i = 1; i < filas.length; i++) {
                    const result: Resultado = new Resultado();
                    result.puntuacion = parseFloat(filas[i].cells[indexColumna].innerHTML.trim().replace(/<[^>]*>?/gm, '').trim());
                    resultados.push(result);
                }
            }
        }
    },

    verificarExistenciaOCrearResultado: async (resultado: Resultado) => {
        try {
            const querySelect = `SELECT id_resultados_estudios 
                                 FROM resultados_estudios 
                                 WHERE id_alumno = ${resultado.alumno.id} 
                                 AND id_estudio = ${resultado.estudio.id} 
                                 AND id_libro = ${resultado.libro.id} 
                                 AND id_grado = ${resultado.grado.id} 
                                 AND fecha = TO_DATE('${resultado.fecha.toISOString().substring(0, 10)}', 'YYYY-MM-DD') 
                                 AND puntuacion = ${resultado.puntuacion}`;

            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

            if (resultSelect.rows.length === 0) {
                const queryInsert = `INSERT INTO resultados_estudios 
                                    (id_alumno, id_estudio, id_libro, id_grado, fecha, puntuacion) 
                                    VALUES (:id_alumno, :id_estudio, :id_libro, :id_grado, TO_DATE(:fecha, 'YYYY-MM-DD'), :puntuacion)`;

                const params = {
                    id_alumno: resultado.alumno.id,
                    id_estudio: resultado.estudio.id,
                    id_libro: resultado.libro.id,
                    id_grado: resultado.grado.id,
                    fecha: resultado.fecha.toISOString().substring(0, 10),
                    puntuacion: resultado.puntuacion
                };

                await window.electronAPI.insertDatabase(queryInsert, params, '');

                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    }

}