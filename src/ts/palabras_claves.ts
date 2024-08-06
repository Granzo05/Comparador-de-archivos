let palabrasClavesDB: string[] = [];
let ID_FILA_PALABRAS: number = 0;
const spinner = document.getElementById('loading');

document.addEventListener('DOMContentLoaded', async () => {
  spinner.style.display = 'flex';

  palabrasClavesDB = await buscarPalabrasClavesAlmacenadasEnDB();

  if (palabrasClavesDB) {
    const textoDelArchivo = JSON.parse(sessionStorage.getItem('textoHTML'));

    limpiarInputPalabrasClaves();

    const palabrasFormateadas = buscarPalabrasClavesEnElTexto(textoDelArchivo);

    setPalabrasClavesEnInput(palabrasFormateadas);

    setOnClickPalabrasClaves();
  } else {
    alert('No se encontraron palabras claves en el texto');
  }

  spinner.style.display = 'none';
});

async function buscarPalabrasClavesAlmacenadasEnDB() {
  try {
    const query = 'SELECT * FROM model ORDER BY ID DESC FETCH FIRST 1 ROWS ONLY';
    const result: any = await window.electronAPI.selectDatabase(query);

    if (result.error) {
      console.error('Error en la consulta:', result.error);
      return null;
    } else {
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];

        ID_FILA_PALABRAS = row.ID;

        return JSON.parse(row.PALABRAS_CLAVES);
      }
    }
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  }
}

function limpiarInputPalabrasClaves() {
  const palabrasClavesInput = document.getElementById('palabras-claves') as HTMLElement;
  palabrasClavesInput.innerHTML = '';
}

function buscarPalabrasClavesEnElTexto(texto: string[]) {
  return palabrasClavesDB
    .map((palabra: string) => palabra.trim().replace(/[\[\]"']/g, ''))
    .filter(palabra => palabra && texto.includes(palabra))
    .map((palabra: string) => `<span class="styled-word">${palabra}</span>`)
    .join(', ');
}

function setPalabrasClavesEnInput(palabrasFormateadas: string) {
  const palabrasClavesInput = document.getElementById('palabras-claves') as HTMLElement;
  palabrasClavesInput.innerHTML = palabrasFormateadas;
}

function setOnClickPalabrasClaves() {
  const elements = document.getElementsByClassName('styled-word');
  const divPalabraId = document.getElementById('palabra-identificadora');

  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', function () {
      divPalabraId.innerHTML = `${this.innerText}`;      
    });
  }
}

document.getElementById('filtro-button')?.addEventListener('click', async () => {
  await setPalabrasClavesInStorage();

  const palabrasNuevas = findNuevasPalabrasClaves();

  if (palabrasNuevas.length > 0) {
    añadirPalabrasNuevasEnDB(palabrasNuevas);
  } else {
    console.log('No hay nuevas palabras clave para insertar.');
  }

  window.location.href = 'resumen.html';
});

async function setPalabrasClavesInStorage() {
  const palabrasClavesInput = (document.getElementById('palabras-claves') as HTMLElement).innerText;
  sessionStorage.setItem('palabras-claves', palabrasClavesInput);

  const palabraIdentificadoraInput = (document.getElementById('palabra-identificadora') as HTMLElement).innerText;
  sessionStorage.setItem('palabra-identificadora', palabraIdentificadoraInput);
}

function findNuevasPalabrasClaves() {
  const palabrasClaves = sessionStorage.getItem('palabras-claves');

  const palabrasClavesSplit = palabrasClaves.split(',').map(palabra => palabra.trim()).filter(palabra => palabra);

  return palabrasClavesSplit.filter(palabra =>
    !palabrasClavesDB.includes(palabra)
  );
}

async function añadirPalabrasNuevasEnDB(palabras: string[]) {
  try {
    palabrasClavesDB = [...palabrasClavesDB, ...palabras];
    const jsonPalabras = JSON.stringify(palabrasClavesDB);

    const query = 'UPDATE model SET PALABRAS_CLAVES = :jsonPalabras WHERE ID = :id';
    const params = { jsonPalabras, id: ID_FILA_PALABRAS };

    await window.electronAPI.insertDatabase(query, params);
  } catch (error) {
    console.error('Error al insertar nuevas palabras clave:', error);
  }
}

let teclaEsEspacioOBorrado = false;

document.getElementById('palabras-claves').addEventListener('keydown', function (event) {
  checkSiTeclaEsBorradoOEspacio(event.key);
});

function checkSiTeclaEsBorradoOEspacio(tecla: any) {
  if (tecla === 'Backspace' || tecla === 'Delete' || tecla === ' ') {
    teclaEsEspacioOBorrado = true;
  } else {
    teclaEsEspacioOBorrado = false;
  }
}

document.getElementById('palabras-claves').addEventListener('input', function () {
  if (teclaEsEspacioOBorrado) {
    return;
  }

  const div = document.getElementById('palabras-claves') as HTMLElement;

  const content = div.innerText;

  div.innerHTML = separarElTextoEnComas(content);

  fijarCursorAlFinal(div);
});

function separarElTextoEnComas(texto: string) {
  return texto.split(',').map(segment => {
    const trimmedSegment = segment.trim();
    return trimmedSegment ? `<span class="styled-word">${trimmedSegment}</span>` : '';
  }).join(', ');
}

function fijarCursorAlFinal(div: HTMLElement) {
  div.focus();
  if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
    const range = document.createRange();
    range.selectNodeContents(div);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

document.getElementById('palabra-identificadora').addEventListener('click', function () {
  this.innerText = '';
});