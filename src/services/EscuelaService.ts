import { buscarPalabrasEnArchivo } from "src/ts/resumen";

export const EscuelaService = {
    buscarEscuela: async () => {
        const posiblesPalabras = ['establecimiento', 'escuela'];

        let palabraEncontrada = buscarPalabrasEnArchivo(posiblesPalabras);

        if (palabraEncontrada)
            return palabraEncontrada;
    }
}