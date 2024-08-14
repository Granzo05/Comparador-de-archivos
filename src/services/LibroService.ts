import { buscarPalabrasEnElHeader } from "../ts/resumen";
import { Libro } from "../types/Libro";

export const LibroService = {
    buscarMaterialDeLectura: async (nombresLibros: Libro[], tablas: HTMLCollectionOf<HTMLTableElement>) => {
        for (const tabla of Array.from(tablas)) {
            const filas = tabla.rows;
            const posiblesPalabras = ['libro', 'material de lectura', 'lectura'];

            let indexColumna = await buscarPalabrasEnElHeader(filas, posiblesPalabras);

            if (indexColumna !== -1) {
                for (let i = 1; i < filas.length; i++) {
                    const newLibro: Libro = new Libro();
                    newLibro.nombre = filas[i].cells[indexColumna].innerHTML.trim();
                    nombresLibros.push(newLibro);
                }
            }
        }
    },

    verificarExistenciaOCrearLibro: async (nombreLibro: string) => {
        try {
            const querySelect = `SELECT id_libro FROM libros WHERE nombre = '${nombreLibro}'`;
            const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

            if (resultSelect.rows.length > 0) {
                console.log(resultSelect)
                return resultSelect.rows[0].ID_LIBRO;
            } else {
                const queryInsert = `INSERT INTO libros (nombre) VALUES (:nombre)`;
                const params = { nombre: nombreLibro };

                const result: any = await window.electronAPI.insertDatabase(queryInsert, params, 'id_libro');
                return result.id;
            }
        } catch (e) {
            console.error(e);
            return 0;
        }
    },

    relacionarLibroEstudio: async (idLibro: number, idParametroEstudio: number, fechas: string[]) => {
        const mesesYAñosSet = new Set<string>();

        for (const fecha of fechas) {
            if (!mesesYAñosSet.has(fecha.split('/')[2])) {
                mesesYAñosSet.add(fecha.split('/')[2]);

                try {
                    const querySelect = `SELECT id_libros_estudios FROM libros_estudios WHERE id_libro = ${idLibro} AND id_estudio = ${idParametroEstudio} AND año = '${fecha.split('/')[2]}'`;

                    const resultSelect: any = await window.electronAPI.selectDatabase(querySelect);

                    if (resultSelect.rows.length === 0) {
                        const queryInsert = `INSERT INTO libros_estudios (id_libro, id_estudio, año) 
                                     VALUES (:idLibro, :idParametroEstudio, :año)`;
                        const params = { id_libro: idLibro, id_estudio: idParametroEstudio, año: fecha.split('/')[2] };
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