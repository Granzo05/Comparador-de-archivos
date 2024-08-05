let textoResumido: string[] = [];
let tablaResumida: string[] = [];
let headerColumna: string[] = [];
let palabrasClaves: string;

document.addEventListener('DOMContentLoaded', async () => {
  await buscarContenidoAsociadoAPalabrasClaves();
  crearResumen();
});

async function buscarContenidoAsociadoAPalabrasClaves() {
  palabrasClaves = sessionStorage.getItem('palabras-claves');

  palabrasClaves.split(',').forEach((palabraClave: string) => {
    palabraClave = palabraClave.trim();

    const regexPatterns = adaptarPatronesDeCoincidencia(palabraClave);

    buscarCoincidencias(regexPatterns, palabraClave);
  });
}

function adaptarPatronesDeCoincidencia(palabraClave: string) {
  return [
    // Captura la oración que sigue después de "palabraClave" hasta el próximo salto de línea o el final del texto.
    new RegExp(`(^${palabraClave}|${palabraClave}:).*`),

    new RegExp(`${palabraClave}\n([\\s\\S]*?)\n\n\n.\n*`)
  ];
}

async function buscarCoincidencias(regexPatterns: RegExp[], palabraClave: string) {
  const textoDelArchivo = JSON.parse(sessionStorage.getItem('exampleText'));

  regexPatterns.forEach((regex) => {
    let match;
    while ((match = regex.exec(textoDelArchivo)) !== null) {
      if (match[0]) {
        if (esTabla(match[0])) {
          headerColumna.push(palabraClave);
          tablaResumida.push(extraerColumnaDeTabla(match[0], palabraClave));
        } else {
          textoResumido.push(match[0].trim());
        }
        break;
      }
    }
  });
}

function esTabla(texto: string) {
  // Puedes mejorar este criterio según el formato de tus tablas
  return texto.includes('\t') || texto.includes('Nombre del alumno');
}

function extraerColumnaDeTabla(columnaTabla: string, palabraClave: string) {
  const filas = columnaTabla.split('\n');
  const indiceColumna = filas[0].split('\t').indexOf(palabraClave);

  return filas.map(fila => fila.split('\t')[indiceColumna]).join('\n');
}

function crearResumen() {
  const divDelResumen = document.getElementById('contenedor-resumen');

  textoResumido.forEach(parte => {
    const partes = parte.split('\n');

    partes.forEach(parteSpliteada => {
      const p = document.createElement('p');
      let esPalabraClave = false;


      palabrasClaves.split(',').forEach(palabraClave => {
        if (parteSpliteada.includes(palabraClave.trim())) {
          p.innerHTML = `<b>${palabraClave.trim()}</b>${parteSpliteada.replace(palabraClave.trim(), '')}`;
          divDelResumen.appendChild(p);
          esPalabraClave = true;
        }
      });

      if (!esPalabraClave && parteSpliteada.length > 0) {
        p.textContent = parteSpliteada;
        divDelResumen.appendChild(p);
      }
    });
  });

  if (tablaResumida.length > 0) {
    const table = document.createElement('table');

    const thead = document.createElement('thead');

    const tbody = document.createElement('tbody');

    const trHeader = document.createElement('tr');

    const trBody = document.createElement('tr');

    tablaResumida.forEach((columna, index) => {
      const thHeader = document.createElement('th');
      thHeader.innerText = headerColumna[index];

      trHeader.appendChild(thHeader);

      thead.appendChild(trHeader);

      const tdBody = document.createElement('td');

      tdBody.innerText = columna;

      trBody.appendChild(tdBody);

      tbody.appendChild(trBody);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    divDelResumen.appendChild(table);

  }

}