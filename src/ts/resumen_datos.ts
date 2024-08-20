import Chart, { ChartTypeRegistry } from 'chart.js/auto';

let resultados: any = JSON.parse(localStorage.getItem('resultados'));
let colorCasillas: string;
let tipoGrafico: keyof ChartTypeRegistry;

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
  escuela.textContent = JSON.parse(localStorage.getItem('escuela'));
}

function asignarGrados() {
  let grados: any = JSON.parse(localStorage.getItem('grados') || '[]');

  if (grados.length > 0) {
    const gradosSelect = document.getElementById('grado-main-resumen') as HTMLSelectElement;

    gradosSelect.innerHTML = '';

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

document.getElementById('cerrar-button').addEventListener('click', () => {
  cerrarModal();
  colorCasillas = 'casilla-gray';
  tipoGrafico = undefined;
});

function abrirModal(idTabla: string) {
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