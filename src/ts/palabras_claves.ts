const palabrasClavesElement = document.getElementById('palabras-claves') as HTMLElement;
let palabrasClavesDB: string[] = [];
let ID_PALABRAS: number = 0;


document.addEventListener('DOMContentLoaded', async () => {
  try {
    const query = 'SELECT * FROM model ORDER BY ID DESC FETCH FIRST 1 ROWS ONLY';
    const allText = sessionStorage.getItem('exampleText');

    if (!allText) {
      console.error('No se encontró "exampleText" en el sessionStorage.');
      return;
    }

    const parsedText = JSON.parse(allText);
    const palabrasClavesInput = document.getElementById('palabras-claves') as HTMLInputElement;

    if (!palabrasClavesInput) {
      console.error('No se encontró el elemento "palabras-claves".');
      return;
    }

    palabrasClavesInput.value = '';

    const result: any = await window.electronAPI.selectDatabase(query);
    console.log(result);
    if (result.error) {
      console.error('Error en la consulta:', result.error);
    } else {
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0]; // Solo la última fila
        palabrasClavesDB = JSON.parse(row.PALABRAS_CLAVES); // Parse the JSON string

        ID_PALABRAS = row.ID;

        palabrasClavesDB.forEach((palabra: string) => {
          const cleanedPalabra = palabra.trim().replace(/[\[\]"']/g, '');
          if (parsedText.includes(cleanedPalabra)) {
            palabrasClavesInput.value += `${cleanedPalabra}, `;
          }
        });
      }
    }
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  }
});

document.getElementById('filtro-button')?.addEventListener('click', async () => {
  try {
    const palabrasClavesInput = (document.getElementById('palabras-claves') as HTMLInputElement).value;

    const palabrasClavesSplit = palabrasClavesInput.split(',').map(palabra => palabra.trim()).filter(palabra => palabra);
    console.log(palabrasClavesDB)
    console.log(palabrasClavesSplit)
    const palabrasNuevas = palabrasClavesSplit.filter(palabra =>
      !palabrasClavesDB.includes(palabra)
    );

    if (palabrasNuevas.length > 0) {
      palabrasClavesDB = [...palabrasClavesDB, ...palabrasNuevas];
      const jsonPalabras = JSON.stringify(palabrasClavesDB);

      const query = 'UPDATE model SET PALABRAS_CLAVES = :jsonPalabras WHERE ID = :id';
      const params = { jsonPalabras, id: ID_PALABRAS };

      const result = await window.electronAPI.insertDatabase(query, params);

      console.log('Inserción exitosa:', result);

      // Redirige a la página de resumen
      //window.location.href = 'resumen.html';
    } else {
      console.log('No hay nuevas palabras clave para insertar.');
    }

  } catch (error) {
    console.error('Error al insertar nuevas palabras clave:', error);
  }
});
