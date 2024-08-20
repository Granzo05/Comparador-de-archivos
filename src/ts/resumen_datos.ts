import Chart, { ChartTypeRegistry } from 'chart.js/auto';

let resultados: any = JSON.parse(localStorage.getItem('resultados'));
let colorCasillas: string;
let tipoGrafico: keyof ChartTypeRegistry;

const tabla = document.getElementById('tabla-resultado') as HTMLTableElement;
const rows = tabla.rows;

document.addEventListener('DOMContentLoaded', async () => {
  await cargarElementos();
});

async function cargarElementos() {
  console.log(resultados);

  asignarEscuela();

  asignarGrados();

  llenarTabla();
}

function asignarEscuela() {
  const escuela = document.getElementById('escuela') as HTMLElement;
  escuela.innerHTML = `Escuela: <strong>${JSON.parse(localStorage.getItem('escuela'))}</strong>`;
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
  } else {
    console.log('No hay grados disponibles en sessionStorage.');
  }
}

document.getElementById('grado-main-resumen').addEventListener('change', async () => {
  filtrarGradoTabla((document.getElementById('grado-main-resumen') as HTMLSelectElement).selectedOptions[0].textContent);
});

function llenarTabla() {
  const tabla = document.getElementById('tabla-resultado') as HTMLTableElement;

  resultados.forEach((resultado: any) => {
    const tr = document.createElement('tr');

    const fecha = formatearFecha(resultado.FECHA.toString().split('T')[0]);
    const nombreAlumno = resultado.NOMBRE_ALUMNO;
    const gradoAlumno = resultado.DIVISION_GRADO;
    const parametroEstudio = resultado.DESCRIPCION_ESTUDIO;
    const libroUtilizado = resultado.NOMBRE_LIBRO;
    const puntuacion = resultado.PUNTUACION;

    const tdFecha = document.createElement('td');
    tdFecha.textContent = fecha;

    const tdNombreAlumno = document.createElement('td');
    tdNombreAlumno.textContent = nombreAlumno;

    const tdGradoAlumno = document.createElement('td');
    tdGradoAlumno.textContent = gradoAlumno;

    const tdParametroEstudio = document.createElement('td');
    tdParametroEstudio.textContent = parametroEstudio;

    const tdLibroUtilizado = document.createElement('td');
    tdLibroUtilizado.textContent = libroUtilizado;

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

function formatearFecha(fecha: string) {
  const [año, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${año}`;
}

function filtrarGradoTabla(division: string) {
  if (division === 'Mostrar todos') {
    for (let i = 0; i < rows.length; i++) {
      rows[i].hidden = false;
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].cells[2].textContent !== division) {
        rows[i].hidden = true;
      } else {
        rows[i].hidden = false;
      }
    }
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

let pasoActual = '1';

document.getElementById('tipo-comparativa').addEventListener('change', () => {
  pasoActual = (document.getElementById('tipo-comparativa') as HTMLSelectElement).value;
});

document.getElementById('cerrar-button').addEventListener('click', () => {
  cerrarModal();
});

document.getElementById('comparar-button').addEventListener('click', () => {
  abrirModal();
});

document.getElementById('siguiente-button').addEventListener('click', () => {
  if (pasoActual === '1') {
    alert('Seleccione un tipo de comparativa');
    return;
  }
  cambiarPaso();
});

document.getElementById('volver-button').addEventListener('click', () => {
  pasoActual = '1';
  cambiarPaso();
});

function abrirModal() {
  const modal = document.getElementById('modal-carga');
  modal.style.display = 'flex';
}

function cerrarModal() {
  const modal = document.getElementById('modal-carga');
  modal.style.display = 'none';
  pasoActual = '1';
}

function cambiarPaso() {
  switch (pasoActual) {
    case '1':
      document.getElementById('volver-button').style.color = 'white';
      document.getElementById('volver-button').style.cursor = 'default';
      document.getElementById('paso-1').style.display = 'block';
      document.getElementById('paso-2').style.display = 'none';
      document.getElementById('paso-3').style.display = 'none';
      document.getElementById('paso-4').style.display = 'none';
      document.getElementById('paso-5').style.display = 'none';
      break;
    case '2':
      document.getElementById('volver-button').style.color = 'black';
      document.getElementById('volver-button').style.cursor = 'pointer';
      document.getElementById('paso-1').style.display = 'none';
      document.getElementById('paso-2').style.display = 'block';
      document.getElementById('paso-3').style.display = 'none';
      document.getElementById('paso-4').style.display = 'none';
      document.getElementById('paso-5').style.display = 'none';
      break;
    case '3':
      document.getElementById('volver-button').style.color = 'black';
      document.getElementById('volver-button').style.cursor = 'pointer';
      document.getElementById('paso-1').style.display = 'none';
      document.getElementById('paso-2').style.display = 'none';
      document.getElementById('paso-3').style.display = 'block';
      document.getElementById('paso-4').style.display = 'none';
      document.getElementById('paso-5').style.display = 'none';
      break;
    case '4':
      document.getElementById('volver-button').style.color = 'black';
      document.getElementById('volver-button').style.cursor = 'pointer';
      document.getElementById('paso-1').style.display = 'none';
      document.getElementById('paso-2').style.display = 'none';
      document.getElementById('paso-3').style.display = 'none';
      document.getElementById('paso-4').style.display = 'block';
      document.getElementById('paso-5').style.display = 'none';
      break;
    case '5':
      document.getElementById('volver-button').style.color = 'black';
      document.getElementById('volver-button').style.cursor = 'pointer';
      document.getElementById('paso-1').style.display = 'none';
      document.getElementById('paso-2').style.display = 'none';
      document.getElementById('paso-3').style.display = 'none';
      document.getElementById('paso-4').style.display = 'none';
      document.getElementById('paso-5').style.display = 'block';
      break;
  }

}

document.getElementById('button-activar-filtros').addEventListener('click', () => {
  document.getElementById('inputs-filter').style.display = 'flex';
  document.getElementById('button-activar-filtros').style.display = 'none';
  document.getElementById('button-desactivar-filtros').style.display = 'flex';
});

document.getElementById('button-desactivar-filtros').addEventListener('click', () => {
  document.getElementById('inputs-filter').style.display = 'none';
  document.getElementById('button-activar-filtros').style.display = 'flex';
  document.getElementById('button-desactivar-filtros').style.display = 'none';
});

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

function filtrarFechaTabla() {
  const fechaDesde = new Date((document.getElementById('filtro-fecha-desde') as HTMLInputElement).value);
  const fechaHasta = new Date((document.getElementById('filtro-fecha-hasta') as HTMLInputElement).value);

  fechaDesde.setDate(fechaDesde.getDate() + 1);
  fechaHasta.setDate(fechaHasta.getDate() + 1);

  if (fechaDesde && fechaHasta.toString() === 'Invalid Date') {
    for (let i = 0; i < rows.length; i++) {
      if (new Date(parsearFecha(rows[i].cells[0].textContent)) >= fechaDesde) {
        rows[i].hidden = false;
      } else {
        rows[i].hidden = true;
      }
    }
  } else if (fechaDesde.toString() === 'Invalid Date' && fechaHasta) {
    for (let i = 0; i < rows.length; i++) {
      if (new Date(parsearFecha(rows[i].cells[0].textContent)) <= fechaHasta) {
        rows[i].hidden = false;
      } else {
        rows[i].hidden = true;
      }
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      if (new Date(parsearFecha(rows[i].cells[0].textContent)) >= fechaDesde && new Date(parsearFecha(rows[i].cells[0].textContent)) <= fechaHasta) {
        rows[i].hidden = false;
      } else {
        rows[i].hidden = true;
      }
    }
  }
}

function parsearFecha(fecha: string) {
  const [dia, mes, año] = fecha.split('/');
  return `${mes}/${dia}/${año}`;
}

function filtrarDatoTabla(columna: number, filtro: string) {
  if (filtro.length > 0) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].cells[columna].textContent.includes(filtro)) {
        rows[i].hidden = false;
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

  console.log(puntuacion)
  console.log(signo)
  console.log(parseFloat(rows[0].cells[5].textContent) )
  
  if (signo === '>') {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) > parseFloat(puntuacion)) {
        rows[i].hidden = false;
      } else {
        rows[i].hidden = true;
      }
    }
  } else if (signo === '<') {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) < parseFloat(puntuacion)) {
        rows[i].hidden = false;
      } else {
        rows[i].hidden = true;
      }
    }
  } else if (signo === '>=') {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) >= parseFloat(puntuacion)) {
        rows[i].hidden = false;
      } else {
        rows[i].hidden = true;
      }
    }
  } else if (signo === '<=') {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) <= parseFloat(puntuacion)) {
        rows[i].hidden = false;
      } else {
        rows[i].hidden = true;
      }
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      if (parseFloat(rows[i].cells[5].textContent) === parseFloat(puntuacion)) {
        rows[i].hidden = false;
      } else {
        rows[i].hidden = true;
      }
    }
  }
}