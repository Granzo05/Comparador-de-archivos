export function formatearFechaDDMMYYYY(fecha: string) {
    const [año, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${año}`;
}

export function formatearFechaMMDDYYYY(fecha: string) {
    const [dia, mes, año] = fecha.split('/');
    return `${mes}/${dia}/${año}`;
}