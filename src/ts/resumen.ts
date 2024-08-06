let textoResumido: string[] = [];
let tablaResumida: string[] = [];
let headerColumna: string[] = [];
let palabrasClaves: string;
let textoDelArchivoHTML = sessionStorage.getItem('textoHTML').split('<table>');
const textoSinElementos = textoDelArchivoHTML[0].replace(/<p>/g, '\n').replace(/<\/p>/g, '\n');
const textoConTabla = '<table>' + textoDelArchivoHTML[1];

document.addEventListener('DOMContentLoaded', async () => {
  await buscarContenidoAsociadoAPalabrasClaves();
  crearResumen();
});

async function buscarContenidoAsociadoAPalabrasClaves() {
  palabrasClaves = sessionStorage.getItem('palabras-claves');

  palabrasClaves.split(',').forEach((palabraClave: string) => {
    palabraClave = palabraClave.trim();

    const regexPatterns = adaptarPatronesDeCoincidencia(palabraClave);

    buscarCoincidencias(regexPatterns);
  });
}

function adaptarPatronesDeCoincidencia(palabraClave: string) {
  return [
    // Captura la oración que sigue después de "palabraClave" hasta el próximo salto de línea o el final del texto.
    new RegExp(`(${palabraClave}|${palabraClave}:).*`),
    new RegExp(`${palabraClave}\n([\\s\\S]*?)\n\n\n.\n*`),
  ];
}

async function buscarCoincidencias(regexPatterns: RegExp[]) {
  regexPatterns.forEach((regex) => {
    let match;
    while ((match = regex.exec(textoSinElementos)) !== null) {
      if (match[0]) {
        textoResumido.push(match[0].trim());
        break;
      }
    }
  });
}

function crearResumen() {
  const divDelResumen = document.getElementById('contenedor-resumen');
  console.log(textoResumido)

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
  
  divDelResumen.innerHTML += textoConTabla.replace('"', '');
}