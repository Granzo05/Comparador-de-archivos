import Chart from 'chart.js/auto';
import { Escuela } from '../types/Escuela';
import { Grado } from '../types/Grado';
import { Estudio } from '../types/Estudio';
import { formatearFechaDDMMYYYY, formatearFechaMMDDYYYY } from '../utils/functions';
import { Alumno } from '../types/Alumno';

let resultados: any = JSON.parse(localStorage.getItem('resultados'));
let resultadosFiltrados: any = [];

let gradoSeleccionadoSelectMain = '';

const tabla = document.getElementById('tabla-resultado') as HTMLTableElement;
const rows = tabla.rows;

let escuelas: Escuela[] = JSON.parse(localStorage.getItem('escuelas'));
let estudios: Estudio[] = JSON.parse(localStorage.getItem('estudios'));

const escuelaElegida: Escuela = JSON.parse(localStorage.getItem('escuela'));
let gradosEscuelaElegida: any = JSON.parse(localStorage.getItem('grados'));

document.addEventListener('DOMContentLoaded', async () => {
  await cargarElementos();
});

async function cargarElementos() {
  asignarEscuela();

  asignarGrados();

  llenarTabla(resultados);

  crearGraficoBarra(resultados)
  document.getElementById('contenedor-grafico').style.display = 'flex';
  document.getElementById('tipo-grafico').style.display = 'flex';
}

function asignarEscuela() {
  const escuelaElement = document.getElementById('escuela') as HTMLElement;
  escuelaElement.innerHTML = `Escuela: <strong>${escuelaElegida.nombre}</strong>`;
}

function asignarGrados() {
  let grados: any = JSON.parse(localStorage.getItem('grados') || '[]');

  if (grados.length > 0) {
    const gradosSelect = document.getElementById('grado-main-resumen') as HTMLSelectElement;

    gradosSelect.innerHTML = '';

    if (grados.length > 1) {
      const option = document.createElement('option');
      option.value = '0';
      option.textContent = 'Mostrar todos';

      gradosSelect.appendChild(option);
    }
    grados.forEach((grado: any) => {
      const option = document.createElement('option');
      option.value = grado.id;
      option.textContent = grado.division;

      gradosSelect.appendChild(option);
    });
  }
}

function llenarTabla(resultados?: any) {
  const tabla = document.getElementById('tabla-resultado') as HTMLTableElement;
  tabla.innerHTML = '';
  resultados.forEach((resultado: any) => {
    const tr = document.createElement('tr');

    let fecha = '';
    if (resultado.FECHA.length <= 10) {
      fecha = resultadosFiltrados.FECHA;
    } else {
      fecha = formatearFechaDDMMYYYY(resultado.FECHA.toString().split('T')[0]);
    }

    const tdFecha = document.createElement('td');
    tdFecha.textContent = fecha;

    const nombreAlumno = resultado.NOMBRE_ALUMNO;
    const tdNombreAlumno = document.createElement('td');
    tdNombreAlumno.textContent = nombreAlumno;

    const gradoAlumno = resultado.DIVISION_GRADO;
    const tdGradoAlumno = document.createElement('td');
    tdGradoAlumno.textContent = gradoAlumno;

    const parametroEstudio = resultado.DESCRIPCION_ESTUDIO;
    const tdParametroEstudio = document.createElement('td');
    tdParametroEstudio.textContent = parametroEstudio;

    const libroUtilizado = resultado.NOMBRE_LIBRO;
    const tdLibroUtilizado = document.createElement('td');
    tdLibroUtilizado.textContent = libroUtilizado;

    const puntuacion = resultado.PUNTUACION;
    const tdPuntuacion = document.createElement('td');
    tdPuntuacion.textContent = puntuacion;

    tr.appendChild(tdFecha);
    tr.appendChild(tdNombreAlumno);
    tr.appendChild(tdGradoAlumno);
    tr.appendChild(tdParametroEstudio);
    tr.appendChild(tdLibroUtilizado);
    tr.appendChild(tdPuntuacion);

    tabla.appendChild(tr);
  });
}

document.getElementById('grado-main-resumen').addEventListener('change', async () => {
  gradoSeleccionadoSelectMain = (document.getElementById('grado-main-resumen') as HTMLSelectElement).selectedOptions[0].textContent;
  filtrarGradoTabla();

  const fechaDesde = (document.getElementById('filtro-fecha-desde') as HTMLInputElement).value;
  const fechaHasta = (document.getElementById('filtro-fecha-hasta') as HTMLInputElement).value;
  const nombre = (document.getElementById('filtro-nombre') as HTMLInputElement).value;
  const estudio = (document.getElementById('filtro-parametro') as HTMLInputElement).value;
  const libro = (document.getElementById('filtro-libro') as HTMLInputElement).value;
  const puntuacion = (document.getElementById('filtro-puntuacion') as HTMLInputElement).value;

  if (fechaDesde.length > 0 || fechaHasta.length > 0) {
    filtrarFechaTabla();
  } else if (nombre.length > 0) {
    filtrarDatoTabla(1, nombre);
  } else if (estudio.length > 0) {
    filtrarDatoTabla(3, estudio);
  } else if (libro.length > 0) {
    filtrarDatoTabla(4, libro);
  } else if (puntuacion.length > 0) {
    filtrarPuntuacion();
  }
});

function filtrarGradoTabla() {
  const resultadosFiltrados = [];
  if (gradoSeleccionadoSelectMain === 'Mostrar todos') {
    for (let i = 0; i < rows.length; i++) {
      rows[i].hidden = false;

      const resultadoFiltrado = {
        FECHA: rows[i].cells[0].textContent,
        NOMBRE_ALUMNO: rows[i].cells[1].textContent,
        DIVISION_GRADO: rows[i].cells[2].textContent,
        DESCRIPCION_ESTUDIO: rows[i].cells[3].textContent,
        NOMBRE_LIBRO: rows[i].cells[4].textContent,
        PUNTUACION: rows[i].cells[5].textContent
      };
      resultadosFiltrados.push(resultadoFiltrado);
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].cells[2].textContent !== gradoSeleccionadoSelectMain) {
        rows[i].hidden = true;
      } else {
        rows[i].hidden = false;

        const resultadoFiltrado = {
          FECHA: rows[i].cells[0].textContent,
          NOMBRE_ALUMNO: rows[i].cells[1].textContent,
          DIVISION_GRADO: rows[i].cells[2].textContent,
          DESCRIPCION_ESTUDIO: rows[i].cells[3].textContent,
          NOMBRE_LIBRO: rows[i].cells[4].textContent,
          PUNTUACION: rows[i].cells[5].textContent
        };
        resultadosFiltrados.push(resultadoFiltrado);
      }
    }
  }

  if ((document.getElementById('tipo-grafico') as HTMLSelectElement).selectedOptions[0].value === 'pie') {
    crearGraficoTorta(resultadosFiltrados);
  } else {
    crearGraficoBarra(resultadosFiltrados);
  }
}


let opcionActual = '0';

document.getElementById('tipo-comparativa').addEventListener('change', () => {
  opcionActual = (document.getElementById('tipo-comparativa') as HTMLSelectElement).value;
});

document.getElementById('cerrar-button').addEventListener('click', () => {
  cerrarModal();
});

function cerrarModal() {
  const modal = document.getElementById('modal-carga');
  modal.style.display = 'none';
  opcionActual = '0';
}

document.getElementById('comparar-button').addEventListener('click', () => {
  abrirModal();
});

function abrirModal() {
  const modal = document.getElementById('modal-carga');
  modal.style.display = 'flex';
}

document.getElementById('siguiente-button').addEventListener('click', () => {
  if (opcionActual === '0') {
    alert('Seleccione un tipo de comparativa');
    return;
  }
  cambiarOpcion();
});

document.getElementById('volver-button').addEventListener('click', () => {
  opcionActual = '0';
  (document.getElementById('tipo-comparativa') as HTMLSelectElement).value = opcionActual;

  cambiarOpcion();
});

async function cambiarOpcion() {
  if (!escuelas || escuelas.length === 0) {
    //escuelas = await buscarEscuelas();
  }

  switch (opcionActual) {
    case '0':
      cambiarOpcion0();
      break;
    case '1':
      cambiarOpcion1();
      break;
    case '2':
      cambiarOpcion2();
      break;
    case '3':
      cambiarOpcion3();
      break;
    case '4':
      cambiarOpcion4();
      break;
  }
}

async function buscarEscuelas(): Promise<Escuela[]> {
  const query = 'SELECT * FROM escuelas';
  const result = await ejecutarSelect(query);

  const escuelas: Escuela[] = [];

  result.forEach((escuelaDB: any) => {
    const escuela: Escuela = new Escuela();
    escuela.id = escuelaDB.ID_ESCUELA;
    escuela.nombre = escuelaDB.NOMBRE;

    escuelas.push(escuela);
  });

  return escuelas;
}

function cambiarOpcion0() {
  document.getElementById('volver-button').style.color = 'white';
  document.getElementById('volver-button').style.cursor = 'default';
  document.getElementById('opcion-0').style.display = 'block';
  document.getElementById('opcion-1').style.display = 'none';
  document.getElementById('opcion-2').style.display = 'none';
  document.getElementById('opcion-3').style.display = 'none';
  document.getElementById('opcion-4').style.display = 'none';
}

async function cambiarOpcion1() {
  const gradosEscuelas = [];

  document.getElementById('volver-button').style.color = 'black';
  document.getElementById('volver-button').style.cursor = 'pointer';
  document.getElementById('opcion-0').style.display = 'none';
  document.getElementById('opcion-1').style.display = 'block';
  document.getElementById('opcion-2').style.display = 'none';
  document.getElementById('opcion-3').style.display = 'none';
  document.getElementById('opcion-4').style.display = 'none';

  document.getElementById('escuela-buscada-opcion-1').innerHTML = `<strong>${escuelaElegida.nombre}</strong>`;

  gradosEscuelas.push(document.getElementById('grado-alumno-1-opcion-1') as HTMLSelectElement);
  gradosEscuelas.push(document.getElementById('grado-alumno-2-opcion-1') as HTMLSelectElement);

  if (gradosEscuelaElegida.length === 0) {
    gradosEscuelaElegida = await buscarGrados(escuelaElegida.id.toString());
  }

  rellenarSelectGrados(gradosEscuelaElegida, gradosEscuelas);

  const selectEstudio = document.getElementById('parametro-opcion-1') as HTMLSelectElement;

  rellenarSelectEstudios(selectEstudio);
}

async function cambiarOpcion2() {
  let gradosEscuelas = [];

  document.getElementById('volver-button').style.color = 'black';
  document.getElementById('volver-button').style.cursor = 'pointer';
  document.getElementById('opcion-0').style.display = 'none';
  document.getElementById('opcion-1').style.display = 'none';
  document.getElementById('opcion-2').style.display = 'block';
  document.getElementById('opcion-3').style.display = 'none';
  document.getElementById('opcion-4').style.display = 'none';

  document.getElementById('escuela-buscada-opcion-2').innerHTML = `<strong>${escuelaElegida.nombre}</strong>`;

  gradosEscuelas.push(document.getElementById('grado-alumno-1-opcion-2') as HTMLSelectElement);

  if (gradosEscuelaElegida.length === 0) {
    gradosEscuelaElegida = await buscarGrados(escuelaElegida.id.toString());
  }

  rellenarSelectGrados(gradosEscuelaElegida, gradosEscuelas);

  gradosEscuelas = [];

  const selectEscuela2 = document.getElementById('escuela-2-opcion-2') as HTMLSelectElement;

  gradosEscuelas.push(document.getElementById('grado-alumno-2-opcion2') as HTMLSelectElement);

  await rellenarSelectEscuelas(selectEscuela2, gradosEscuelas);

  const selectEstudioOpcion2 = document.getElementById('parametro-opcion-2') as HTMLSelectElement;

  rellenarSelectEstudios(selectEstudioOpcion2);
}

async function cambiarOpcion3() {
  document.getElementById('volver-button').style.color = 'black';
  document.getElementById('volver-button').style.cursor = 'pointer';
  document.getElementById('opcion-0').style.display = 'none';
  document.getElementById('opcion-1').style.display = 'none';
  document.getElementById('opcion-2').style.display = 'none';
  document.getElementById('opcion-3').style.display = 'block';
  document.getElementById('opcion-4').style.display = 'none';

  document.getElementById('escuela-buscada-opcion-3').innerHTML = `<strong>${escuelaElegida.nombre}</strong>`;

  if (gradosEscuelaElegida.length === 0) {
    gradosEscuelaElegida = await buscarGrados(escuelaElegida.id.toString());
  }
  const gradosSelects = [document.getElementById('grado-1-opcion-3') as HTMLSelectElement, document.getElementById('grado-2-opcion-3') as HTMLSelectElement];

  rellenarSelectGrados(gradosEscuelaElegida, gradosSelects);
}

async function cambiarOpcion4() {
  let gradosEscuelas = [];
  document.getElementById('volver-button').style.color = 'black';
  document.getElementById('volver-button').style.cursor = 'pointer';
  document.getElementById('opcion-0').style.display = 'none';
  document.getElementById('opcion-1').style.display = 'none';
  document.getElementById('opcion-2').style.display = 'none';
  document.getElementById('opcion-3').style.display = 'none';
  document.getElementById('opcion-4').style.display = 'block';

  document.getElementById('escuela-buscada-opcion-4').innerHTML = `<strong>${escuelaElegida.nombre}</strong>`;

  gradosEscuelas.push(document.getElementById('grado-1-opcion-4') as HTMLSelectElement);

  if (gradosEscuelaElegida.length === 0) {
    gradosEscuelaElegida = await buscarGrados(escuelaElegida.id.toString());
  }

  rellenarSelectGrados(gradosEscuelaElegida, gradosEscuelas);

  gradosEscuelas = [];

  const selectEscuela2opcion5 = document.getElementById('escuela-2-opcion-4') as HTMLSelectElement;

  gradosEscuelas.push(document.getElementById('grado-2-opcion-4') as HTMLSelectElement);

  await rellenarSelectEscuelas(selectEscuela2opcion5, gradosEscuelas);
}

document.getElementById('button-activar-filtros').addEventListener('click', () => {
  mostrarFiltros();
});

function mostrarFiltros() {
  document.getElementById('inputs-filter').style.display = 'flex';
  document.getElementById('button-activar-filtros').style.display = 'none';
  document.getElementById('button-desactivar-filtros').style.display = 'flex';
}

document.getElementById('button-desactivar-filtros').addEventListener('click', () => {
  ocultarFiltros();
});

function ocultarFiltros() {
  document.getElementById('inputs-filter').style.display = 'none';
  document.getElementById('button-activar-filtros').style.display = 'flex';
  document.getElementById('button-desactivar-filtros').style.display = 'none';
}

document.getElementById('filtro-fecha-desde').addEventListener('input', (e) => {
  filtrarFechaTabla();
});

document.getElementById('filtro-fecha-hasta').addEventListener('input', () => {
  filtrarFechaTabla();
});

document.getElementById('filtro-nombre').addEventListener('input', () => {
  const filtro = (document.getElementById('filtro-nombre') as HTMLInputElement).value;
  filtrarDatoTabla(1, filtro);
});

document.getElementById('filtro-parametro').addEventListener('input', () => {
  const filtro = (document.getElementById('filtro-parametro') as HTMLInputElement).value;
  filtrarDatoTabla(3, filtro);
});

document.getElementById('filtro-libro').addEventListener('input', () => {
  const filtro = (document.getElementById('filtro-libro') as HTMLInputElement).value;
  filtrarDatoTabla(4, filtro);
});

document.getElementById('filtro-puntuacion').addEventListener('input', () => {
  filtrarPuntuacion();
});

document.getElementById('medida-puntuacion').addEventListener('input', () => {
  filtrarPuntuacion();
});

document.getElementById('alumno-1-opcion-1').addEventListener('input', async function () {
  const grado = document.getElementById('grado-alumno-1-opcion-1') as HTMLSelectElement;
  await getRecomendacionesAlumnos(this, escuelaElegida.id, parseInt(grado.value));
});

document.getElementById('alumno-2-opcion-1').addEventListener('input', async function () {
  const grado = document.getElementById('grado-alumno-2-opcion-1') as HTMLSelectElement;
  await getRecomendacionesAlumnos(this, escuelaElegida.id, parseInt(grado.value));
});

document.getElementById('alumno-1-opcion-2').addEventListener('input', async function () {
  const grado = document.getElementById('grado-alumno-1-opcion2') as HTMLSelectElement;
  await getRecomendacionesAlumnos(this, escuelaElegida.id, parseInt(grado.value));
});

document.getElementById('alumno-2-opcion-2').addEventListener('input', async function () {
  const escuela = document.getElementById('escuela-2-opcion-2') as HTMLSelectElement;
  const grado = document.getElementById('grado-alumno-2-opcion-2') as HTMLSelectElement;
  await getRecomendacionesAlumnos(this, parseInt(escuela.value), parseInt(grado.value));
});

async function getRecomendacionesAlumnos(input: HTMLElement, idEscuela: number, idGrado: number) {
  const inputValue = (input as HTMLInputElement).value.trim();

  let query = `SELECT a.*
  FROM alumnos a
  JOIN grados_alumnos ga ON a.id_alumno = ga.id_alumno
  JOIN grados g ON g.id_grado = ga.id_grado
  WHERE g.id_escuela = ${idEscuela} AND a.dni LIKE '${inputValue}%' AND g.id_grado = ${idGrado}`;

  query += ` ORDER BY dni FETCH FIRST 25 ROWS ONLY`;

  await buscarAlumnos(query, input);
}

async function buscarAlumnos(query: string, input?: HTMLElement) {
  try {
    const alumnos: any = await ejecutarSelect(query);

    if (alumnos.error) {
      console.error('Error en la consulta:', alumnos.error);
    } else {
      rellenarDivResultados(alumnos, (input as HTMLInputElement));
    }
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  }
}

function rellenarDivResultados(alumnos: any, input: HTMLInputElement) {
  const divConDatos = input.nextElementSibling as HTMLElement;
  divConDatos.innerHTML = '';
  divConDatos.style.display = 'block';

  alumnos.forEach((alumno: any) => {
    const div = document.createElement('div');
    div.textContent = `${alumno.DNI} - ${alumno.NOMBRE}`;
    div.style.cursor = 'pointer';

    div.addEventListener('click', () => {
      input.value = alumno.ID_ALUMNO;
      input.textContent = alumno.DNI;
      divConDatos.innerHTML = '';
      divConDatos.style.display = 'none';
    });

    divConDatos.appendChild(div);
  });
}

function filtrarFechaTabla() {
  const fechaDesde = new Date((document.getElementById('filtro-fecha-desde') as HTMLInputElement).value);
  const fechaHasta = new Date((document.getElementById('filtro-fecha-hasta') as HTMLInputElement).value);

  fechaDesde.setDate(fechaDesde.getDate() + 1);
  fechaHasta.setDate(fechaHasta.getDate() + 1);

  if (fechaDesde && fechaHasta.toString() === 'Invalid Date') {
    for (let i = 0; i < rows.length; i++) {
      if (new Date(formatearFechaMMDDYYYY(rows[i].cells[0].textContent)) >= fechaDesde) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' || gradoSeleccionadoSelectMain.length === 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  } else if (fechaDesde.toString() === 'Invalid Date' && fechaHasta) {
    for (let i = 0; i < rows.length; i++) {
      if (new Date(formatearFechaMMDDYYYY(rows[i].cells[0].textContent)) <= fechaHasta) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' || gradoSeleccionadoSelectMain.length === 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      if (new Date(formatearFechaMMDDYYYY(rows[i].cells[0].textContent)) >= fechaDesde && new Date(formatearFechaMMDDYYYY(rows[i].cells[0].textContent)) <= fechaHasta) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' || gradoSeleccionadoSelectMain.length === 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  }
}

function filtrarDatoTabla(columna: number, filtro: string) {
  if (filtro.length > 0) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].cells[columna].textContent.includes(filtro)) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' || gradoSeleccionadoSelectMain.length === 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      rows[i].hidden = false;
    }
  }
}

function filtrarPuntuacion() {
  const puntuacion = (document.getElementById('filtro-puntuacion') as HTMLInputElement).value;
  const signo = (document.getElementById('medida-puntuacion') as HTMLInputElement).value;

  if (signo === '>') {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) > parseFloat(puntuacion)) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' && gradoSeleccionadoSelectMain.length > 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  } else if (signo === '<') {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) < parseFloat(puntuacion)) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' && gradoSeleccionadoSelectMain.length > 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  } else if (signo === '>=') {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) >= parseFloat(puntuacion)) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' && gradoSeleccionadoSelectMain.length > 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  } else if (signo === '<=') {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) <= parseFloat(puntuacion)) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' && gradoSeleccionadoSelectMain.length > 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) === parseFloat(puntuacion)) {
        if (gradoSeleccionadoSelectMain !== 'Mostrar todos' && gradoSeleccionadoSelectMain.length > 0) {
          if (rows[i].cells[2].textContent === gradoSeleccionadoSelectMain)
            rows[i].hidden = false;
        } else {
          rows[i].hidden = false;
        }
      } else {
        rows[i].hidden = true;
      }
    }
  }
}

async function rellenarSelectEscuelas(escuelaSelect: HTMLSelectElement, gradosSelects: HTMLSelectElement[]) {
  escuelaSelect.innerHTML = '<option value="0" disabled selected>Seleccionar escuela</option>';

  escuelas.forEach((escuela: Escuela) => {
    if (escuela.nombre !== escuelaElegida.nombre) {
      const option = document.createElement('option');
      option.value = escuela.id.toString();
      option.textContent = escuela.nombre;

      escuelaSelect.appendChild(option);
    }
  });

  escuelaSelect.addEventListener('change', async () => {
    const escuelaId = escuelaSelect.value;
    const grados = await buscarGrados(escuelaId);

    rellenarSelectGrados(grados, gradosSelects);
  });
}

async function buscarGrados(idEscuela: string): Promise<Grado[]> {
  const query = `SELECT * FROM grados WHERE id_escuela = ${parseInt(idEscuela)}`;
  const result = await ejecutarSelect(query);

  const grados: Grado[] = [];

  result.forEach((gradoDB: any) => {
    const grado: Grado = new Grado();
    grado.id = gradoDB.ID_GRADO;
    grado.division = gradoDB.DIVISION;

    grados.push(grado);
  });

  return grados;
}

function rellenarSelectGrados(grados: Grado[], gradosSelect: HTMLSelectElement[]) {
  gradosSelect.forEach(gradoSelect => {
    gradoSelect.innerHTML = '';

    grados.forEach((grado) => {
      const option = document.createElement('option');
      option.value = grado.id.toString();
      option.textContent = grado.division;

      gradoSelect.appendChild(option);
    });
  });
}

function rellenarSelectEstudios(estudiosSelect: HTMLSelectElement) {
  estudiosSelect.innerHTML = '';

  estudios.forEach((estudio) => {
    const option = document.createElement('option');
    option.value = estudio.id.toString();
    option.textContent = estudio.descripcion;

    estudiosSelect.appendChild(option);
  });
}

async function ejecutarSelect(query: string): Promise<any[]> {
  try {
    const result: any = await window.electronAPI.selectDatabase(query);

    if (result.error) {
      console.error('Error en la consulta:', result.error);
      return [];
    } else {
      return result.rows;
    }
  } catch (e) {
    console.error('Error al buscar datos:', e);
    return [];
  }
}

document.getElementById('buscar-button-opcion-1').addEventListener('click', async () => {
  await buscarDatosOpcion1();
});

async function buscarDatosOpcion1() {
  const alumno1 = (document.getElementById('alumno-1-opcion-1') as HTMLInputElement).value;

  const alumno2 = (document.getElementById('alumno-2-opcion-1') as HTMLInputElement).value;

  const estudio = (document.getElementById('parametro-opcion-1') as HTMLSelectElement).value;

  const desde = (document.getElementById('desde-opcion-1') as HTMLInputElement).value;

  const hasta = (document.getElementById('hasta-opcion-1') as HTMLInputElement).value;

  if (!alumno1) {
    alert('Por favor ingrese el primer alumno');
    return;
  } else if (!alumno2) {
    alert('Por favor ingrese el segundo alumno');
    return;
  } else if (!estudio) {
    alert('Por favor ingrese el parametro de estudio alumno');
    return;
  } else if (!desde || desde === 'Invalid Date' || new Date(desde) > new Date(hasta)) {
    alert('Por favor ingrese una fecha inicial válida');
    return;
  } else if (!hasta || hasta === 'Invalid Date' || new Date(hasta) < new Date(desde)) {
    alert('Por favor ingrese una fecha de finalización válida');
    return;
  }

  const query = `
  SELECT 
  re.*, 
  a.nombre AS nombre_alumno, 
  a.dni AS dni_alumno, 
  l.nombre AS nombre_libro, 
  e.descripcion AS descripcion_estudio,
  g.division AS division_grado
  FROM resultados_estudios re
  JOIN grados g ON re.id_grado = g.id_grado
  JOIN alumnos a ON re.id_alumno = a.id_alumno
  JOIN libros l ON re.id_libro = l.id_libro
  JOIN estudios e ON re.id_estudio = e.id_estudio
  WHERE re.fecha BETWEEN TO_DATE('${desde}', 'YYYY-MM-DD') AND TO_DATE('${hasta}', 'YYYY-MM-DD') 
  AND (re.id_alumno = ${alumno1} OR re.id_alumno = ${alumno2})
  AND re.id_estudio = ${estudio}
  ORDER BY re.puntuacion DESC`;

  const result = await ejecutarSelect(query);

  localStorage.setItem('resultadosComparativa', JSON.stringify(result));

  if (result.length > 0) {
    await llenarTabla(result);
    await crearGraficoBarra(result);
    document.getElementById('contenedor-grafico').style.display = 'flex';
    cerrarModal();
  } else {
    alert('No se encontraron resultados para la búsqueda realizada');
    return;
  }
}

document.getElementById('buscar-button-opcion-2').addEventListener('click', async () => {
  await buscarDatosOpcion2();
});

async function buscarDatosOpcion2() {
  const alumno1 = (document.getElementById('alumno-1-opcion-2') as HTMLInputElement).value;

  const alumno2 = (document.getElementById('alumno-2-opcion-2') as HTMLInputElement).value;

  const estudio = (document.getElementById('parametro-opcion-2') as HTMLSelectElement).value;

  const desde = (document.getElementById('desde-opcion-2') as HTMLInputElement).value;

  const hasta = (document.getElementById('hasta-opcion-2') as HTMLInputElement).value;

  if (!alumno1) {
    alert('Por favor ingrese el primer alumno');
    return;
  } else if (!alumno2) {
    alert('Por favor ingrese el segundo alumno');
    return;
  } else if (!estudio) {
    alert('Por favor ingrese el parametro de estudio alumno');
    return;
  } else if (!desde || desde === 'Invalid Date' || new Date(desde) > new Date(hasta)) {
    alert('Por favor ingrese una fecha inicial válida');
    return;
  } else if (!hasta || hasta === 'Invalid Date' || new Date(hasta) < new Date(desde)) {
    alert('Por favor ingrese una fecha de finalización válida');
    return;
  }

  const query = `
  SELECT 
  re.*, 
  a.nombre AS nombre_alumno, 
  a.dni AS dni_alumno, 
  l.nombre AS nombre_libro, 
  e.descripcion AS descripcion_estudio,
  g.division AS division_grado
  FROM resultados_estudios re
  JOIN grados g ON re.id_grado = g.id_grado
  JOIN alumnos a ON re.id_alumno = a.id_alumno
  JOIN libros l ON re.id_libro = l.id_libro
  JOIN estudios e ON re.id_estudio = e.id_estudio
  WHERE re.fecha BETWEEN TO_DATE('${desde}', 'YYYY-MM-DD') AND TO_DATE('${hasta}', 'YYYY-MM-DD') AND (re.id_alumno = ${alumno1} OR re.id_alumno = ${alumno2})
  ORDER BY re.puntuacion DESC`;

  const result = await ejecutarSelect(query);

  localStorage.setItem('resultadosComparativa', JSON.stringify(result));

  if (result.length > 0) {
    await llenarTabla(result);
    await crearGraficoBarra(result);
    document.getElementById('contenedor-grafico').style.display = 'flex';
    cerrarModal();
  } else {
    alert('No se encontraron resultados para la búsqueda realizada');
    return;
  }
}

document.getElementById('buscar-button-opcion-3').addEventListener('click', async () => {
  await buscarDatosOpcion3();
});

async function buscarDatosOpcion3() {
  const grado1 = (document.getElementById('grado-1-opcion-3') as HTMLInputElement).value;

  const grado2 = (document.getElementById('grado-2-opcion-3') as HTMLInputElement).value;

  const desde = (document.getElementById('desde-opcion-3') as HTMLInputElement).value;

  const hasta = (document.getElementById('hasta-opcion-3') as HTMLInputElement).value;

  if (!grado1) {
    alert('Por favor ingrese el primer grado');
    return;
  } else if (!grado2) {
    alert('Por favor ingrese el segundo grado');
    return;
  } else if (!desde || desde === 'Invalid Date' || new Date(desde) > new Date(hasta)) {
    alert('Por favor ingrese una fecha inicial válida');
    return;
  } else if (!hasta || hasta === 'Invalid Date' || new Date(hasta) < new Date(desde)) {
    alert('Por favor ingrese una fecha de finalización válida');
    return;
  }

  const query = `
  SELECT 
  re.*, 
  a.nombre AS nombre_alumno, 
  a.dni AS dni_alumno, 
  l.nombre AS nombre_libro, 
  e.descripcion AS descripcion_estudio,
  g.division AS division_grado
  FROM resultados_estudios re
  JOIN grados g ON re.id_grado = g.id_grado
  JOIN alumnos a ON re.id_alumno = a.id_alumno
  JOIN libros l ON re.id_libro = l.id_libro
  JOIN estudios e ON re.id_estudio = e.id_estudio
  WHERE re.fecha BETWEEN TO_DATE('${desde}', 'YYYY-MM-DD') AND TO_DATE('${hasta}', 'YYYY-MM-DD') AND (re.id_grado = ${grado1} OR re.id_grado = ${grado2})
  ORDER BY re.puntuacion DESC`;

  const result = await ejecutarSelect(query);

  localStorage.setItem('resultadosComparativa', JSON.stringify(result));

  if (result.length > 0) {
    await llenarTabla(result);
    await crearGraficoBarra(result);
    document.getElementById('contenedor-grafico').style.display = 'flex';
    document.getElementById('tipo-grafico').style.display = 'flex';
    cerrarModal();
  } else {
    alert('No se encontraron resultados para la búsqueda realizada');
    return;
  }
}

document.getElementById('buscar-button-opcion-4').addEventListener('click', async () => {
  await buscarDatosOpcion4();
});

async function buscarDatosOpcion4() {
  const grado1 = (document.getElementById('grado-1-opcion-4') as HTMLInputElement).value;

  const grado2 = (document.getElementById('grado-2-opcion-4') as HTMLInputElement).value;

  const desde = (document.getElementById('desde-opcion-4') as HTMLInputElement).value;

  const hasta = (document.getElementById('hasta-opcion-4') as HTMLInputElement).value;

  if (!grado1) {
    alert('Por favor ingrese el primer grado');
    return;
  } else if (!grado2) {
    alert('Por favor ingrese el segundo grado');
    return;
  } else if (!desde || desde === 'Invalid Date' || new Date(desde) > new Date(hasta)) {
    alert('Por favor ingrese una fecha inicial válida');
    return;
  } else if (!hasta || hasta === 'Invalid Date' || new Date(hasta) < new Date(desde)) {
    alert('Por favor ingrese una fecha de finalización válida');
    return;
  }

  const query = `
  SELECT 
  re.*, 
  a.nombre AS nombre_alumno, 
  a.dni AS dni_alumno, 
  l.nombre AS nombre_libro, 
  e.descripcion AS descripcion_estudio,
  g.division AS division_grado
  FROM resultados_estudios re
  JOIN grados g ON re.id_grado = g.id_grado
  JOIN alumnos a ON re.id_alumno = a.id_alumno
  JOIN libros l ON re.id_libro = l.id_libro
  JOIN estudios e ON re.id_estudio = e.id_estudio
  WHERE re.fecha BETWEEN TO_DATE('${desde}', 'YYYY-MM-DD') AND TO_DATE('${hasta}', 'YYYY-MM-DD') AND (re.id_grado = ${grado1} OR re.id_grado = ${grado2})
  ORDER BY re.puntuacion DESC`;

  const result = await ejecutarSelect(query);

  localStorage.setItem('resultadosComparativa', JSON.stringify(result));

  result.forEach(resultados => {
    const day = String(resultados.FECHA.getDate()).padStart(2, '0');
    const month = String(resultados.FECHA.getMonth() + 1).padStart(2, '0');
    const year = resultados.FECHA.getFullYear();

    resultados.FECHA = `${day}/${month}/${year}`;
  });

  if (result.length > 0) {
    await llenarTabla(result);
    await crearGraficoBarra(result);
    document.getElementById('contenedor-grafico').style.display = 'flex';
    document.getElementById('tipo-grafico').style.display = 'flex';
    cerrarModal();
  } else {
    alert('No se encontraron resultados para la búsqueda realizada');
    return;
  }
}

let chart: any;

async function crearGraficoBarra(result: any) {
  const labels: string[] = [];
  const datasets: any[] = [];
  const alumnos = new Set<Alumno>();
  const grados = new Set<string>();
  document.getElementById('contenedor-grafico').style.height = '100%';

  result.forEach((resultado: any) => {
    const alumno: Alumno = new Alumno();
    alumno.grado.division = resultado.DIVISION_GRADO;
    alumno.nombre = resultado.NOMBRE_ALUMNO;
    alumnos.add(alumno);

    grados.add(resultado.DIVISION_GRADO);
  });

  const [grado1, grado2] = Array.from(grados);
  const color1 = getRandomColor();
  const color2 = getRandomColor();

  alumnos.forEach((alumno: Alumno) => {
    const data: number[] = [];
    const fechas: string[] = [];

    result.forEach((resultado: any) => {
      if (resultado.NOMBRE_ALUMNO === alumno.nombre) {
        let fecha = '';
        if (resultado.FECHA.length <= 10) {
          fecha = resultado.FECHA;
        } else {
          fecha = formatearFechaDDMMYYYY(resultado.FECHA.toString().split('T')[0]);
        }
        fechas.push(fecha);
        data.push(parseFloat(resultado.PUNTUACION));
      }
    });

    const backgroundColor = alumno.grado.division === grado1 ? color1 : color2;

    datasets.push({
      label: alumno.nombre + `(${alumno.grado.division})`,
      data: data,
      backgroundColor: backgroundColor,
      borderColor: 'rgba(1, 1, 1, 1)',
      borderWidth: 1,
    });

    if (!labels.length) {
      labels.push(...fechas);
    }
  });
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

function dibujarGrafico(labels: any, datasets: any) {
  const ctx = document.getElementById('chart-canvas') as HTMLCanvasElement;
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fechas'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Puntuación'
          },
          beginAtZero: true
        }
      }
    }
  });
}

async function crearGraficoTorta(result: any) {
  const puntuaciones = result.map((resultado: any) => parseFloat(resultado.PUNTUACION));
  const categorias = clasificarPuntuaciones(puntuaciones);
  const { labels, data, backgroundColors } = prepararDatosTorta(categorias);
  document.getElementById('contenedor-grafico').style.height = '40vh';
  document.getElementById('contenedor-grafico').style.width = '80vw';

  if (chart) {
    chart.destroy();
  }

  dibujarGraficoTorta(labels, data, backgroundColors);
}

function clasificarPuntuaciones(puntuaciones: number[]) {
  const categorias = {
    'Bajo (0-14)': 0,
    'Medio (15-34)': 0,
    'Normal (35-50)': 0,
    'Superior (>50)': 0
  };

  puntuaciones.forEach((puntuacion) => {
    if (puntuacion < 15) {
      categorias['Bajo (0-14)']++;
    } else if (puntuacion >= 15 && puntuacion < 35) {
      categorias['Medio (15-34)']++;
    } else if (puntuacion >= 35 && puntuacion < 50) {
      categorias['Normal (35-50)']++;
    } else {
      categorias['Superior (>50)']++;
    }
  });

  return categorias;
}

function prepararDatosTorta(categorias: { [key: string]: number }) {
  const labels = Object.keys(categorias);
  const data = Object.values(categorias);
  const backgroundColors = labels.map(() => getRandomColor());

  return { labels, data, backgroundColors };
}

function dibujarGraficoTorta(labels: string[], data: number[], backgroundColors: string[]) {
  const ctx = document.getElementById('chart-canvas') as HTMLCanvasElement;
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(1, 1, 1, 1)',
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Distribución de Puntuaciones'
        }
      }
    }
  });
}

document.getElementById('tipo-grafico').addEventListener('change', () => {
  let result = JSON.parse(localStorage.getItem('resultadosComparativa'));

  if (!result) {
    result = resultados;
  }

  if ((document.getElementById('tipo-grafico') as HTMLSelectElement).selectedOptions[0].value === 'pie') {
    crearGraficoTorta(result);
  } else {
    crearGraficoBarra(result);
  }
});