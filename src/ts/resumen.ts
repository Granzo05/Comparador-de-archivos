let palabrasClaves: string = sessionStorage.getItem('palabras-claves');
let palabraIdentificadora: string = sessionStorage.getItem('palabra-identificadora');
let archivosEnHTML: string[] = JSON.parse(sessionStorage.getItem('archivosEnHTML'));
let coincidenciasConPalabrasClaves: string[] = [];
const divDelResumen = document.getElementById('contenedor-resumen');

document.addEventListener('DOMContentLoaded', async () => {
  // Creamos el resumen con el primer archivo ingresado para tener una plantilla...
  // en caso de haber una palabraIdentificadora se podrá ir navegando por los archivos gracias al select asociado a esa palabra.
  await buscarContenidoAsociadoAPalabrasClaves(0);
  await crearResumen(0);
});

async function buscarContenidoAsociadoAPalabrasClaves(indexArchivo: number) {
  coincidenciasConPalabrasClaves = [];

  palabrasClaves.split(',').forEach((palabraClave: string) => {
    palabraClave = palabraClave.trim();
    const regexPatterns = adaptarPatronesDeCoincidencia(palabraClave);
    buscarCoincidencias(regexPatterns, indexArchivo);
  });
}

function adaptarPatronesDeCoincidencia(palabraClave: string) {
  return [
    new RegExp(`(${palabraClave}|${palabraClave}:).*`),
    new RegExp(`${palabraClave}\n([\\s\\S]*?)\n\n\n.\n*`),
  ];
}

async function buscarCoincidencias(regexPatterns: RegExp[], indexArchivo: number) {
  const textoSinElementos = archivosEnHTML[indexArchivo].replace(/<p>/g, '\n').replace(/<\/p>/g, '\n');

  regexPatterns.forEach((regex) => {
    let match;
    while ((match = regex.exec(textoSinElementos)) !== null) {
      if (match[0]) {
        coincidenciasConPalabrasClaves.push(match[0].trim());
        break;
      }
    }
  });
}

async function crearResumen(indexArchivo: number) {
  divDelResumen.innerHTML = '';

  coincidenciasConPalabrasClaves.forEach(texto => {
    const lineasDeTexto = texto.split('\n');
    lineasDeTexto.forEach(oraciones => {
      escribirContenidoRelacionadoAPalabrasClaves(oraciones);
    });
  });

  if (archivosEnHTML[indexArchivo].split('<table>')[1].length > 0) {
    const tabla = '<table>' + archivosEnHTML[indexArchivo].split('<table>')[1];
    divDelResumen.innerHTML += tabla.replace('"', '');
  }

  const selectPalabrasIdentificadora = document.getElementById('select-palabras-identificadora') as HTMLSelectElement;
  if (selectPalabrasIdentificadora) {
    await crearOpcionesParaContenidoIdentificador(selectPalabrasIdentificadora);
    selectPalabrasIdentificadora.value = `${indexArchivo}`;
  }
}

function escribirContenidoRelacionadoAPalabrasClaves(oraciones: string) {
  const p = document.createElement('p');
  let esPalabraClave = false;

  palabrasClaves.split(',').forEach(palabraClave => {
    palabraClave = palabraClave.trim();
    if (oraciones.includes(palabraClave)) {
      const textoAsociado = oraciones.replace(palabraClave, '').replace(':', '').trim();
      if (oraciones.includes(palabraIdentificadora.trim())) {
        // Crear un select para palabras identificadoras
        p.innerHTML = `<b>${palabraClave}</b><select id='select-palabras-identificadora'><option value="0">${textoAsociado}</option></select>`;
        divDelResumen.appendChild(p);
        esPalabraClave = true;
      } else if (oraciones.includes(palabraClave.trim()) && oraciones.trim().length > palabraClave.trim().length) {
        // Mostrar texto asociado para otras palabras claves
        p.innerHTML = `<b>${palabraClave}: </b>${textoAsociado}`;
        divDelResumen.appendChild(p);
        esPalabraClave = true;
      }

    }
  });

  if (!esPalabraClave) {
    console.log("No se encontraron palabras claves en las oraciones.");
  }
}


async function crearOpcionesParaContenidoIdentificador(select: HTMLSelectElement) {
  select.addEventListener('change', async function () {
    await buscarResumenMediantePalabraIdentificadora(this.value);
  });

  const opciones: HTMLOptionElement[] = [];

  archivosEnHTML.forEach((archivo, index) => {
    archivo = archivo.replace(/<p>/g, '\n').replace(/<\/p>/g, '\n');

    archivo.split('\n').forEach(oraciones => {
      if (oraciones.includes(palabraIdentificadora.trim())) {
        const textoAsociadoAPalabraClave = oraciones.replace(palabraIdentificadora.trim(), '').replace(':', '').trim();
        const option = document.createElement('option');
        option.value = `${index}`;
        option.textContent = textoAsociadoAPalabraClave;

        opciones.push(option);
      }
    });
  });

  ordenarAlfabeticamenteOptions(select, opciones);
}



async function buscarResumenMediantePalabraIdentificadora(indexArchivo: string) {
  await buscarContenidoAsociadoAPalabrasClaves(parseInt(indexArchivo));
  await crearResumen(parseInt(indexArchivo));
}

function ordenarAlfabeticamenteOptions(select: HTMLSelectElement, opciones: HTMLOptionElement[]) {
  const uniqueOptions = new Set<string>();
  const opcionesUnicas = opciones.filter(option => {
    const text = option.textContent.trim();
    if (!uniqueOptions.has(text)) {
      uniqueOptions.add(text);
      return true;
    }
    return false;
  });

  opcionesUnicas.sort((a, b) => a.textContent.localeCompare(b.textContent));

  select.innerHTML = '';

  opcionesUnicas.forEach(option => select.appendChild(option));
}
