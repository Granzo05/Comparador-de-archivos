async function buscarDatos() {
    const escuela = document.getElementById('escuela') as HTMLInputElement;
    const alumno = document.getElementById('alumno') as HTMLInputElement;
    const docente = document.getElementById('docente') as HTMLInputElement;
    const division = document.getElementById('divisiones') as HTMLInputElement;
    const parametro = document.getElementById('parametro') as HTMLInputElement;
    const desde = document.getElementById('desde') as HTMLInputElement;
    const hasta = document.getElementById('hasta') as HTMLInputElement;

    if (escuela.value.length === 0) {
        alert('Necesitamos una escuela para buscar la información');
        return;
    }

    const datosBusqueda = {
        escuela,
        alumno,
        docente,
        division,
        parametro,
        desde,
        hasta
    };
}

async function buscarParametrosEstudio() {
    try {
        // Enviar la consulta a la base de datos
        window.electronAPI.queryDatabase('SELECT * FROM my_table');

        // Manejar la respuesta de la consulta
        window.electronAPI.onQueryResult((result) => {
            if (result.error) {
                console.error('Error al buscar datos:', result.error);
            } else {
                const selectParametros = document.getElementById('parametros') as HTMLSelectElement;
                selectParametros.innerHTML = ''; // Limpiar las opciones actuales

                result.rows.forEach((parametro: string) => {
                    const option = document.createElement('option');
                    option.textContent = parametro;
                    option.value = parametro;
                    selectParametros.appendChild(option);
                });
            }
        });
    } catch (error) {
        console.error('Error al buscar datos:', error);
    }
}