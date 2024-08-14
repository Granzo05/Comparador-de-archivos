import Chart, { ChartTypeRegistry } from 'chart.js/auto';
import { AlumnoService } from '../services/AlumnoService';
import { CursoService } from '../services/CursoService';
import { DocenteService } from '../services/DocenteService';
import { EscuelaService } from '../services/EscuelaService';
import { LibroService } from '../services/LibroService';
import { ParametroEstudioService } from '../services/ParametroEstudioService';
import { ResultadoService } from '../services/ResultadoService';
import { Alumno } from '../types/Alumno';
import { Curso } from '../types/Curso';
import { Docente } from '../types/Docente';
import { Escuela } from '../types/Escuela';
import { Libro } from '../types/Libro';
import { ParametroEstudio } from '../types/ParametroEstudio';
import { Resultado } from '../types/Resultado';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

let palabrasClaves: string = sessionStorage.getItem('palabras-claves');
let palabraIdentificadora: string = sessionStorage.getItem('palabra-identificadora');
let archivosEnHTML: string[] = JSON.parse(sessionStorage.getItem('archivosEnHTML'));
let coincidenciasConPalabrasClaves: string[] = [];
let habilitarEdicion: boolean = false;
let idTablaGlobal: string;
let colorCasillas: string;
let tipoGrafico: keyof ChartTypeRegistry;
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

  const selectPalabrasIdentificadora = document.getElementById('select-palabras-identificadora') as HTMLSelectElement;
  if (selectPalabrasIdentificadora) {
    await crearOpcionesParaContenidoIdentificador(selectPalabrasIdentificadora);
    selectPalabrasIdentificadora.value = `${indexArchivo}`;
  }
}

function escribirContenidoRelacionadoAPalabrasClaves(oraciones: string) {
  const p = document.createElement('p');

  palabrasClaves.split(',').forEach(palabraClave => {
    palabraClave = palabraClave.trim();
    if (oraciones.includes(palabraClave)) {
      const textoAsociado = oraciones.replace(palabraClave, '').replace(':', '').trim();
      if (oraciones.includes(palabraIdentificadora.trim())) {
        // Crear un select para palabras identificadoras
        p.innerHTML = `<b>${palabraClave}</b><select id='select-palabras-identificadora'><option value="0">${textoAsociado}</option></select>`;
        divDelResumen.appendChild(p);
      } else if (oraciones.includes(palabraClave.trim()) && oraciones.trim().length > palabraClave.trim().length) {
        // Mostrar texto asociado para otras palabras claves
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

  // Obtener los índices de las columnas seleccionadas
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
  const tablas = document.getElementsByClassName('tabla') as HTMLCollectionOf<HTMLTableElement>;

  const alumnos: Alumno[] = [];
  const docentes: Docente[] = [];
  const curso: Curso = new Curso();
  const escuela: Escuela = new Escuela();
  const parametroEstudio: ParametroEstudio = new ParametroEstudio();
  const resultados: Resultado[] = [];
  const fechas: string[] = [];
  const libros: Libro[] = [];

  buscarDatos()

  async function buscarDatos() {
    const [nombreEscuela, divisionCurso, descripcionParametroEstudio] = await Promise.all([
      EscuelaService.buscarEscuela(),
      CursoService.buscarCurso(),
      ParametroEstudioService.buscarParametroEstudio()
    ]);

    escuela.nombre = nombreEscuela;
    curso.division = divisionCurso;
    parametroEstudio.descripcion = descripcionParametroEstudio;

    await Promise.all([
      AlumnoService.buscarDatosAlumnos(alumnos, tablas),
      DocenteService.buscarDatosDocente(docentes),
      ResultadoService.buscarResultados(resultados, tablas),
      buscarColumnaDeFecha(fechas, tablas),
      LibroService.buscarMaterialDeLectura(libros, tablas)
    ]);

    guardarDatos();
  }

  async function guardarDatos() {

    if (escuela.nombre && escuela.nombre.length > 1)
      escuela.id = await EscuelaService.verificarExistenciaOCrearEscuela(escuela.nombre);

    if (curso.division && curso.division.length > 1 && escuela.id > 0)
      curso.id = await CursoService.verificarExistenciaOCrearCurso(curso.division, escuela.id);

    for (const alumno of Array.from(alumnos)) {
      if (alumno.dni && alumno.dni.length > 1)
        alumno.id = await AlumnoService.verificarExistenciaOCrearAlumnos(alumno);

      if (curso.id && curso.id > 0 && alumno.id && alumno.id > 0 && fechas.length > 0)
        await AlumnoService.relacionarCursoAlumnos(curso.id, alumno.id, fechas[0].split('/')[2]);
    }

    for (const docente of Array.from(docentes)) {
      if (docente.cuil)
        docente.id = await DocenteService.verificarExistenciaOCrearDocente(docente);

      if (docente.id && docente.id > 0 && curso.id && curso.id > 0 && fechas.length > 0)
        await DocenteService.relacionarCursoDocente(curso.id, docente.id, fechas);
    }

    if (parametroEstudio.descripcion && parametroEstudio.descripcion.length > 1)
      parametroEstudio.id = await ParametroEstudioService.verificarExistenciaOCrearEstudio(parametroEstudio.descripcion);

    for (const libro of Array.from(libros)) {
      if (libro.nombre && libro.nombre.length > 1) {
        libro.id = await LibroService.verificarExistenciaOCrearLibro(libro.nombre);
      }

      if (libro.id && libro.id > 0 && parametroEstudio.id > 0 && fechas.length > 0)
        await LibroService.relacionarLibroEstudio(libro.id, parametroEstudio.id, fechas);
    }

    if (parametroEstudio.id && parametroEstudio.id > 0 && curso.id && curso.id > 0 && fechas.length > 0)
      await ParametroEstudioService.relacionarEstudioCurso(parametroEstudio.id, curso.id, fechas);

    if ((alumnos.length > 0 && resultados.length > 0 && fechas.length > 0) && alumnos.length === resultados.length && alumnos.length === fechas.length) {
      for (let i = 0; i < resultados.length; i++) {
        const resultado = resultados[i];
        resultado.idAlumno = alumnos[i].id;
        resultado.idEstudio = parametroEstudio.id;
        if (libros[i].id && libros[i].id > 0)
          resultado.idLibro = libros[i].id;
        resultado.fecha = fechas[i];

        await ResultadoService.verificarExistenciaOCrearResultado(resultado);
      }
    } else {
      alert('Los datos recopilados no coinciden en cantidad, por favor revisar. Hay ' + alumnos.length + ' alumnos, ' + resultados.length + ' resultados y ' + fechas.length + ' fechas');
    }

    alert('Datos cargados con éxito');
  }
});

async function buscarColumnaDeFecha(fechas: string[], tablas: HTMLCollectionOf<HTMLTableElement>) {
  for (const tabla of Array.from(tablas)) {
    const filas = tabla.rows;
    const posiblesPalabras = ['fecha', 'dia'];

    let indexColumna = await buscarPalabrasEnElHeader(filas, posiblesPalabras);

    if (indexColumna !== -1) {
      for (let i = 1; i < filas.length; i++) {
        fechas.push(filas[i].cells[indexColumna].innerHTML.trim());
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

export async function buscarPalabrasEnArchivo(palabrasBuscadas: string[]) {
  for (let i = 0; i < archivosEnHTML.length; i++) {
    for (let palabra of palabrasBuscadas) {
      const regex = new RegExp(`${palabra}:\\s*([^<]*)`, 'i');
      const match = archivosEnHTML[i].match(regex);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return null;
}
