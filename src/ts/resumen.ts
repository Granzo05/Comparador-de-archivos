import Chart, { ChartTypeRegistry } from 'chart.js/auto';
import { AlumnoService } from '../services/AlumnoService';
import { DocenteService } from '../services/DocenteService';
import { EscuelaService } from '../services/EscuelaService';
import { LibroService } from '../services/LibroService';
import { EstudioService } from '../services/EstudioService';
import { ResultadoService } from '../services/ResultadoService';
import { Escuela } from '../types/Escuela';
import { Estudio } from '../types/Estudio';
import { Grado } from '../types/Grado';
import { GradoService } from '../services/GradoService';
import { Resultado } from 'src/types/Resultado';

let palabrasClaves: string = sessionStorage.getItem('palabras-claves');
let archivosEnHTML: string[] = JSON.parse(sessionStorage.getItem('archivosEnHTML'));
let coincidenciasConPalabrasClaves: string[] = [];
let habilitarEdicion: boolean = false;
let idTablaGlobal: string;
let colorCasillas: string;
let tipoGrafico: keyof ChartTypeRegistry;
const divDelResumen = document.getElementById('contenedor-resumen');
const palabrasIdentificadoras = ['Escuela', 'Grado'];
const parser = new DOMParser();

const escuelas: Set<string> = new Set();
const grados: Map<string, Set<string>> = new Map();
let valueSelectEscuela: string = '0';
let valueSelectGrado: string = '0';
document.addEventListener('DOMContentLoaded', async () => {
  // Creamos el resumen con el primer archivo ingresado para tener una plantilla...
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

  archivosEnHTML[indexArchivo].split('<table>').forEach((tablaSpliteada, index) => {
    try {
      if (tablaSpliteada.trim().length > 0) {
        const button = document.createElement('button');
        button.textContent = 'Crear gráfico';
        button.className = 'button-crear-grafico'
        button.onclick = () => { abrirModal('data-table-' + index); };

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = '<table>' + tablaSpliteada.replace(/<p>/g, '').replace(/<\/p>/g, '');
        const tabla = tempDiv.querySelector('table');
        if (tabla) {
          tabla.id = 'data-table-' + index;
          tabla.className = 'tabla';
          insertarHeaderYBody(tabla);
          divDelResumen.appendChild(button);
          divDelResumen.appendChild(tabla);
        }
      }
    } catch (e) {
    }
  });

  await buscarEscuelasYGrados();

  const selectEscuelas = document.getElementById('select-escuelas') as HTMLSelectElement;
  const selectGrados = document.getElementById('select-grados') as HTMLSelectElement;
  if (selectEscuelas) {
    await crearOpcionesParaEscuelas(selectEscuelas);
    const escuelaSeleccionada = Array.from(selectEscuelas.options).find(opt => opt.value === valueSelectEscuela).textContent;
    crearOpcionesParaGrados(selectGrados, escuelaSeleccionada);
    selectEscuelas.value = valueSelectEscuela;
    selectGrados.value = valueSelectGrado;
  }
}

function escribirContenidoRelacionadoAPalabrasClaves(oraciones: string) {
  const p = document.createElement('p');

  palabrasClaves.split(',').forEach(palabraClave => {
    palabraClave = palabraClave.trim();
    if (oraciones.includes(palabraClave)) {
      const textoAsociado = oraciones.replace(palabraClave, '').replace(':', '').trim();

      let palabraIdenficadoraEncontrada = false;

      for (let i = 0; i < palabrasIdentificadoras.length; i++) {
        if (oraciones.includes(palabrasIdentificadoras[i])) {
          if (palabrasIdentificadoras[i] === 'Escuela') {
            p.innerHTML = `<b>${palabraClave}</b><select id='select-escuelas'><option value="0">${textoAsociado}</option></select>`;
          } else {
            p.innerHTML = `<b>${palabraClave}</b><select id='select-grados'><option>${textoAsociado}</option></select>`;
          }
          divDelResumen.appendChild(p);

          palabraIdenficadoraEncontrada = true;
        }
      }

      if ((oraciones.includes(palabraClave.trim()) && oraciones.trim().length > palabraClave.trim().length) && !palabraIdenficadoraEncontrada) {
        p.innerHTML = `<b>${palabraClave}: </b>${textoAsociado}`;
        divDelResumen.appendChild(p);
      }
    }
  });
}

function insertarHeaderYBody(tabla: HTMLDivElement) {
  const firstTr = tabla.querySelector('tr');
  const thead = document.createElement('thead');
  thead.appendChild(firstTr.cloneNode(true));
  thead.innerHTML = thead.innerHTML.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');

  thead.querySelectorAll('th').forEach((th, index) => {
    th.addEventListener('click', () => {
      pintarColumnaSeleccionada(index);
    });
  });

  firstTr.remove();

  const tbody = document.createElement('tbody');

  while (tabla.firstChild) {
    tbody.appendChild(tabla.firstChild);
  }

  tbody.querySelectorAll('td').forEach((td) => {
    td.addEventListener('click', (event) => {
      const cell = event.target as HTMLTableCellElement;
      const row = cell.parentElement as HTMLTableRowElement;
      const cellIndex = cell.cellIndex;
      const rowIndex = row.rowIndex;
      pintarCasillaSeleccionada(rowIndex, cellIndex);
    });
  });

  tabla.appendChild(thead);

  tbody.innerHTML = tbody.innerHTML.replace('<tbody>', '').replace('</tbody>', '');
  tabla.appendChild(tbody);
}

function pintarColumnaSeleccionada(index: number) {
  if (habilitarEdicion) {
    const table = document.querySelector('table');
    if (table) {
      const rows = table.rows;
      for (let i = 0; i < rows.length; i++) {
        rows[i].cells[index].classList.toggle(colorCasillas);
      }
    }

    abrirModal(idTablaGlobal);
    habilitarEdicion = false;
  }
}

function pintarCasillaSeleccionada(rowIndex: number, cellIndex: number) {
  if (habilitarEdicion) {
    const table = document.querySelector('table');
    if (table) {
      const cell = table.rows[rowIndex].cells[cellIndex];
      cell.classList.toggle(colorCasillas);
    }

    abrirModal(idTablaGlobal);
    habilitarEdicion = false;
  }
}

let chart: any;

function crearGraficoDesdeTabla(tableId: string) {
  const table = document.getElementById(tableId) as HTMLTableElement;
  const labels = [];
  const datasets: any = [];
  const rows = table.rows;
  const selectedColumns = [];

  for (let i = 0; i < rows[0].cells.length; i++) {
    if (rows[0].cells[i].classList.contains(colorCasillas)) {
      selectedColumns.push(i);
    }
  }

  for (let i = 1; i < rows.length; i++) {
    labels.push(rows[i].cells[0].textContent);
    selectedColumns.forEach((colIndex, j) => {
      if (!datasets[j]) {
        datasets[j] = {
          label: rows[0].cells[colIndex].textContent,
          data: [],
          backgroundColor: generarColores(rows.length - 1),
          borderColor: `rgba(1, 1, 1, 1)`,
          borderWidth: 1,
          fill: false
        };
      }
      datasets[j].data.push(parseFloat(rows[i].cells[colIndex].textContent));
    });
  }

  if (chart) {
    chart.destroy();
  }

  dibujarGrafico(labels, datasets);
}

function getRandomColor(): string {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

function generarColores(cantidad: number): string[] {
  const colores = [];
  for (let i = 0; i < cantidad; i++) {
    colores.push(getRandomColor());
  }
  return colores;
}

function dibujarGrafico(labels: any, datasets: any) {
  const ctx = (document.getElementById('chart-canvas') as HTMLCanvasElement).getContext('2d');
  chart = new Chart(ctx, {
    type: tipoGrafico,
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Gráfico de Datos'
        }
      },
      scales: {
        x: {
          beginAtZero: true
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

async function crearOpcionesParaEscuelas(select: HTMLSelectElement) {
  select.addEventListener('change', async function () {
    valueSelectEscuela = this.value;
    const option = Array.from(select.options).find(opt => opt.value === this.value);
    await buscarResumenMediantePalabraIdentificadora(option.textContent);
  });

  const opciones: HTMLOptionElement[] = [];
  let contador = 0;

  archivosEnHTML.forEach(archivo => {
    for (const escuela of escuelas) {
      if (archivo.includes(`Escuela: ${escuela}`)) {
        const option = document.createElement('option');
        option.value = `${contador}`;
        option.innerText = escuela;
        opciones.push(option);

        contador++;
      }
    }
  });

  opciones.forEach(option => {
    select.appendChild(option);
  });

  ordenarAlfabeticamenteOptions(select, opciones);
}

async function crearOpcionesParaGrados(select: HTMLSelectElement, escuelaSeleccionada: string) {
  select.innerHTML = '';

  select.addEventListener('change', async function () {
    valueSelectGrado = this.value;

    const option = Array.from(select.options).find(opt => opt.value === this.value);
    if (option) {
      await buscarResumenMediantePalabraIdentificadora(option.textContent || '');
    }
  });

  const opciones: HTMLOptionElement[] = [];
  let contador = 0;

  for (const [escuela, gradosDeEscuela] of grados) {
    if (escuela === escuelaSeleccionada) {
      gradosDeEscuela.forEach(grado => {
        const option = document.createElement('option');
        option.value = `${contador}`;
        option.textContent = grado;
        opciones.push(option);
        contador++;
      });
    }
  }

  opciones.forEach(option => {
    select.appendChild(option);
  });

  ordenarAlfabeticamenteOptions(select, opciones);
}


async function buscarEscuelasYGrados() {
  for (let index = 0; index < archivosEnHTML.length; index++) {
    let archivo = archivosEnHTML[index].replace(/<p>/g, '\n').replace(/<\/p>/g, '\n');

    const oraciones = archivo.split('\n');
    let escuelaActual: string | null = null;

    oraciones.forEach(oracion => {
      if (oracion.includes('Escuela')) {
        const nombreEscuela = oracion.replace('Escuela:', '').trim();
        escuelas.add(nombreEscuela);
        escuelaActual = nombreEscuela;

        if (!grados.has(nombreEscuela)) {
          grados.set(nombreEscuela, new Set());
        }
      }

      if (escuelaActual) {
        if (oracion.includes('Grado')) {
          const grado = oracion.replace('Grado:', '').trim();
          grados.get(escuelaActual)?.add(grado);
        }
      }
    });
  }
}

async function buscarResumenMediantePalabraIdentificadora(palabraIdentificadora: string) {
  let indexArchivo: number = 0;

  for (let index = 0; index < archivosEnHTML.length; index++) {
    let archivo = archivosEnHTML[index].replace(/<p>/g, '\n').replace(/<\/p>/g, '\n');

    const oraciones = archivo.split('\n');
    if (oraciones.some(oracion => oracion.includes(palabraIdentificadora))) {
      indexArchivo = index;
      break;
    }
  }

  document.getElementById('select-escuelas').innerHTML = '';
  document.getElementById('select-escuelas').innerHTML = '';

  await buscarContenidoAsociadoAPalabrasClaves(indexArchivo);
  await crearResumen(indexArchivo);
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

document.getElementById('seleccionar-referencia').addEventListener('click', () => {
  ocultarModal();
  colorCasillas = 'casilla-gray';
  habilitarEdicion = true;
});

document.getElementById('seleccionar-numeros').addEventListener('click', () => {
  ocultarModal();
  colorCasillas = 'casilla-yellow';
  habilitarEdicion = true;
});

(document.getElementById('tipo-grafico') as HTMLSelectElement).addEventListener('change', (event) => {
  const selectElement = event.target as HTMLSelectElement;
  tipoGrafico = selectElement.value as keyof ChartTypeRegistry;
});

document.getElementById('crear-grafico').addEventListener('click', () => {
  if (tipoGrafico === undefined) {
    alert('Necesitamos que elijas un tipo de gráfico');
    return;
  }

  const labels = document.getElementsByClassName('casilla-gray');
  const data = document.getElementsByClassName('casilla-yellow');

  if (labels.length === 0) {
    alert('Necesitamos que elijas los datos que referencian a los números, como por ejemplo: "nombres de personas"');
    return;
  }

  if (data.length === 0) {
    alert('Necesitamos que elijas los datos que contienen números');
    return;
  }

  crearGraficoDesdeTabla(idTablaGlobal);
  document.getElementById('contenedor-grafico').style.display = 'flex';
  ocultarModal();
});

document.getElementById('cerrar-button').addEventListener('click', () => {
  cerrarModal();
  colorCasillas = 'casilla-gray';
  tipoGrafico = undefined;
});

function abrirModal(idTabla: string) {
  if (idTabla !== undefined) {
    idTablaGlobal = idTabla;
  }

  const modal = document.getElementById('modal-grafico');
  modal.style.display = 'flex';
}

function ocultarModal() {
  const modal = document.getElementById('modal-grafico');
  modal.style.display = 'none';
}

function cerrarModal() {
  const modal = document.getElementById('modal-grafico');
  modal.style.display = 'none';

  const labels = document.getElementsByClassName('casilla-gray');
  const data = document.getElementsByClassName('casilla-yellow');

  Array.from(labels).forEach(element => {
    element.classList.remove('casilla-gray');
  });

  Array.from(data).forEach(element => {
    element.classList.remove('casilla-yellow');
  });
}

document.getElementById('button-guardar-datos').addEventListener('click', () => {
  modificarMensajeModal('Recopilando datos', 'Los datos están siendo guardados, por favor espere puede demorar unos segundos...');

  mostrarModalCarga();

  const escuelas: Set<Escuela> = new Set();

  buscarDatos()

  async function buscarDatos() {
    for (let i = 0; i < archivosEnHTML.length; i++) {
      try {
        const documento = parser.parseFromString(archivosEnHTML[i], 'text/html');
        const tablas = documento.getElementsByTagName('table') as HTMLCollectionOf<HTMLTableElement>;

        const [nombreEscuela, divisionGrado, descripcionParametroEstudio] = await Promise.all([
          EscuelaService.buscarEscuela(i),
          GradoService.buscarGrado(i),
          EstudioService.buscarParametroEstudio(i)
        ]);

        let escuela = Array.from(escuelas).find(e => e.nombre === nombreEscuela);
        if (!escuela) {
          escuela = new Escuela();
          escuela.nombre = nombreEscuela;
          escuelas.add(escuela);
        }

        const estudio: Estudio = new Estudio();
        estudio.descripcion = descripcionParametroEstudio;

        const grado: Grado = new Grado();
        grado.division = divisionGrado;
        grado.escuela = escuela;

        await Promise.all([
          AlumnoService.buscarDatosAlumnos(grado.alumnos, tablas),
          DocenteService.buscarDatosDocente(grado.docente, i),
          LibroService.buscarMaterialDeLectura(estudio.libros, tablas)
        ]);

        grado.estudios.push(estudio);

        for (let index = 0; index < grado.estudios.length; index++) {
          await ResultadoService.buscarResultados(grado.estudios[index].resultados, tablas);
        }

        for (let index = 0; index < grado.estudios.length; index++) {
          for (let j = 0; j < grado.estudios[index].resultados.length; j++) {
            grado.estudios[index].resultados[j].fecha = new Date(await buscarColumnaDeFecha(tablas));
          }
        }

        escuela.grados.push(grado);

        escuelas.add(escuela);
      } catch (error) {
        console.error(`Error procesando el archivo ${i}:`, error);
      }
    }


    let cargaExitosa: boolean = false;

    cargaExitosa = await guardarDatos();

    if (cargaExitosa) {
      mostrarCargaExitosa();
    } else {
      mostrarCargaErronea();
    }
  }

  async function guardarDatos(): Promise<boolean> {
    let estadoCorrectoDeCarga = true;

    for (const escuela of escuelas) {
      if (escuela.nombre && escuela.nombre.length > 1) {
        escuela.id = await EscuelaService.verificarExistenciaOCrearEscuela(escuela.nombre);
      }

      for (const grado of escuela.grados) {
        const fechas = grado.estudios.flatMap(estudio => estudio.resultados.map((resultado: Resultado) => resultado.fecha.toISOString().substring(0, 10)));

        if (grado.division && grado.division.length > 1 && escuela.id > 0) {
          grado.id = await GradoService.verificarExistenciaOCrearGrado(grado.division, escuela.id);
        }

        for (const alumno of grado.alumnos) {
          if (alumno.dni && alumno.dni.length > 1) {
            alumno.id = await AlumnoService.verificarExistenciaOCrearAlumnos(alumno);
          }

          if (grado.id && grado.id > 0 && alumno.id && alumno.id > 0 && fechas.length > 0) {
            alumno.grado = grado;
            await AlumnoService.relacionarGradoAlumnos(grado.id, alumno.id, fechas[0].split('-')[0]);
          }
        }

        if (grado.docente.cuil) {
          grado.docente.id = await DocenteService.verificarExistenciaOCrearDocente(grado.docente);
        }

        if (grado.docente.id && grado.docente.id > 0 && grado.id && grado.id > 0 && fechas.length > 0) {
          await DocenteService.relacionarGradoDocente(grado.id, grado.docente.id, fechas);
        }

        for (const estudio of grado.estudios) {
          if (estudio.descripcion && estudio.descripcion.length > 1) {
            estudio.id = await EstudioService.verificarExistenciaOCrearEstudio(estudio.descripcion);
          }

          for (const libro of estudio.libros) {
            if (libro.nombre && libro.nombre.length > 1) {
              libro.id = await LibroService.verificarExistenciaOCrearLibro(libro.nombre);
            }

            if (libro.id && libro.id > 0 && estudio.id > 0 && fechas.length > 0) {
              await LibroService.relacionarLibroEstudio(libro.id, estudio.id, fechas);
            }
          }

          if (estudio.id && grado.id && fechas.length > 0) {
            await EstudioService.relacionarEstudioGrado(estudio.id, grado.id, fechas);
          }


          for (let index = 0; index < grado.alumnos.length; index++) {
            const resultado = estudio.resultados[index];
            resultado.alumno = grado.alumnos[index];
            resultado.estudio = estudio;
            resultado.libro = estudio.libros[0];
            resultado.grado = grado;

            estadoCorrectoDeCarga = await ResultadoService.verificarExistenciaOCrearResultado(resultado);            
          }
        }
      }
    }
    return estadoCorrectoDeCarga;
  }
});

function mostrarModalCarga() {
  document.getElementById('modal-carga').style.display = 'flex';
  document.getElementById('button-modal').style.display = 'none';
  document.getElementById('loader-container').style.display = 'flex';
}

function modificarMensajeModal(titulo: string, mensaje: string) {
  document.getElementById('title-modal').textContent = titulo;
  document.getElementById('mensaje-modal').textContent = mensaje;
}

function mostrarCargaExitosa() {
  modificarMensajeModal('Carga exitosa', 'Los datos han sido guardados correctamente');

  document.getElementById('loader-container').style.display = 'none';
  document.getElementById('button-modal').style.display = 'block';
  document.getElementById('success-icon').style.display = 'block';
  document.getElementById('error-icon').style.display = 'none';
}

function mostrarCargaErronea() {
  document.getElementById('loader-container').style.display = 'none';
  document.getElementById('button-modal').style.display = 'block';
  document.getElementById('success-icon').style.display = 'none';
  document.getElementById('error-icon').style.display = 'block';
}

document.getElementById('button-modal').addEventListener('click', () => {
  document.getElementById('modal-carga').style.display = 'none';
  document.getElementById('success-icon').style.display = 'none';
  document.getElementById('error-icon').style.display = 'none';
  document.getElementById('loader-container').style.display = 'none';
});

async function buscarColumnaDeFecha(tablas: HTMLCollectionOf<HTMLTableElement>) {
  for (const tabla of Array.from(tablas)) {
    const filas = tabla.rows;
    const posiblesPalabras = ['fecha', 'dia'];

    let indexColumna = await buscarPalabrasEnElHeader(filas, posiblesPalabras);

    if (indexColumna !== -1) {
      for (let i = 1; i < filas.length; i++) {
        return filas[i].cells[indexColumna].innerHTML.trim().replace(/<[^>]*>?/gm, '');
      }
    }
  }
}

export async function buscarPalabrasEnElHeader(filas: HTMLCollectionOf<HTMLTableRowElement>, palabrasBuscadas: string[]) {
  for (let i = 0; i < filas[0].cells.length; i++) {
    const cellText = filas[0].cells[i].innerHTML.toLowerCase();
    if (palabrasBuscadas.some(palabra => cellText.includes(palabra.toLowerCase()))) {
      return i;
    }
  }
  return -1;
}

export async function buscarPalabrasEnArchivo(palabrasBuscadas: string[], indexArchivo: number) {
  for (let palabra of palabrasBuscadas) {
    const regex = new RegExp(`${palabra}:\\s*([^<]*)`, 'i');
    const match = archivosEnHTML[indexArchivo].match(regex);

    if (match) {
      return match[1].trim().replace(/<[^>]*>?/gm, '');
    }
  }
  return null;
}
