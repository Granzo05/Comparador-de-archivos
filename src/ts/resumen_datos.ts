import Chart, { ChartTypeRegistry } from 'chart.js/auto';

let resultados: string[] = JSON.parse(sessionStorage.getItem('resultados'));
let habilitarEdicion: boolean = false;
let idTablaGlobal: string;
let colorCasillas: string;
let tipoGrafico: keyof ChartTypeRegistry;

document.addEventListener('DOMContentLoaded', async () => {
  await cargarElementos();
});

async function cargarElementos() {

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