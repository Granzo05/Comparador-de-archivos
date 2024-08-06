document.getElementById('comparar-button').addEventListener('click', abrirModal);
document.getElementById('cerrar-button').addEventListener('click', cerrarModal);
document.getElementById('volver-button').addEventListener('click', volverModal);
document.getElementById('siguiente-button').addEventListener('click', siguientePaso);

const primerPaso = document.getElementById('paso-1');
const select = document.getElementById('tipo-comparativa') as HTMLSelectElement;
const modalBackground = document.getElementById('modalBackground');

export function volverModal() {
    const pasoSiguiente = document.getElementById(`paso-${select.value}`);
    pasoSiguiente.style.display = 'none';
    primerPaso.style.display = 'flex';

    document.getElementById('volver-button').style.display = 'none';
}

export function abrirModal() {
    modalBackground.style.display = 'flex';
}

export function cerrarModal() {
    modalBackground.style.display = 'none';
    primerPaso.style.display = 'flex';
    const pasoSiguiente = document.getElementById(`paso-${select.value}`);
    pasoSiguiente.style.display = 'none';

    document.getElementById('volver-button').style.display = 'none';
}

export function siguientePaso() {
    primerPaso.style.display = 'none';
    const pasoSiguiente = document.getElementById(`paso-${select.value}`);
    pasoSiguiente.style.display = 'flex';

    if (parseInt(select.value) > 0) document.getElementById('volver-button').style.display = 'block';
}