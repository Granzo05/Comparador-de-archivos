const palabrasClavesElement = document.getElementById('palabras-claves') as HTMLElement;
let palabrasClavesDB: string[] = [];
let ID_PALABRAS: number = 0;
const loadingElement = document.getElementById('loading');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    loadingElement.style.display = 'flex';

    const query = 'SELECT * FROM model ORDER BY ID DESC FETCH FIRST 1 ROWS ONLY';
    const allText = sessionStorage.getItem('exampleText');

    if (!allText) {
      console.error('No se encontró "exampleText" en el sessionStorage.');
      return;
    }

    const parsedText = JSON.parse(allText);
    const palabrasClavesInput = document.getElementById('palabras-claves') as HTMLElement;

    if (!palabrasClavesInput) {
      console.error('No se encontró el elemento "palabras-claves".');
      return;
    }

    palabrasClavesInput.innerHTML = '';

    const result: any = await window.electronAPI.selectDatabase(query);
    console.log(result);
    if (result.error) {
      console.error('Error en la consulta:', result.error);
    } else {
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        palabrasClavesDB = JSON.parse(row.PALABRAS_CLAVES);

        ID_PALABRAS = row.ID;

        const formattedPalabras = palabrasClavesDB
        .map((palabra: string) => palabra.trim().replace(/[\[\]"']/g, ''))
        .filter(palabra => palabra && parsedText.includes(palabra)) 
        .map((palabra: string) => `<span class="styled-word">${palabra}</span>`)
        .join(', ');

      palabrasClavesInput.innerHTML = formattedPalabras;
      }
    }
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  } finally {
    loadingElement.style.display = 'none';
  }
});

document.getElementById('filtro-button')?.addEventListener('click', async () => {
  try {
    const palabrasClavesInput = (document.getElementById('palabras-claves') as HTMLElement).innerText;

    const palabrasClavesSplit = palabrasClavesInput.split(',').map(palabra => palabra.trim()).filter(palabra => palabra);
    console.log(palabrasClavesDB);
    console.log(palabrasClavesSplit);
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
    } else {
      console.log('No hay nuevas palabras clave para insertar.');
    }

  } catch (error) {
    console.error('Error al insertar nuevas palabras clave:', error);
  }
});

document.getElementById('palabras-claves').addEventListener('input', function () {
  const div = document.getElementById('palabras-claves') as HTMLElement;
  const content = div.innerText;

  // Split content by commas
  const segments = content.split(',').map(segment => {
    const trimmedSegment = segment.trim();
    // Apply class only if the segment is not empty
    return trimmedSegment ? `<span class="styled-word">${trimmedSegment}</span>` : '';
  }).join(', ');

  div.innerHTML = segments;

  // Maintain cursor position at the end
  div.focus();
  if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
    const range = document.createRange();
    range.selectNodeContents(div);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
});
