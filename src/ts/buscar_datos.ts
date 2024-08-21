import { Estudio } from "../types/Estudio";
import { Escuela } from "../types/Escuela";
import { Grado } from "../types/Grado";

document.getElementById('alumno').addEventListener('input', async function () {
    await getRecomendacionesAlumnos(this);
});

document.addEventListener('DOMContentLoaded', async () => {
    const escuelas = await buscarEscuelas();
    await rellenarSelectEscuelas(escuelas);

    const grados = await buscarGrados(escuelas[0].id.toString());
    rellenarSelectGrados(grados);

    const estudios = await buscarParametrosDeEstudio();
    sessionStorage.setItem('estudios', JSON.stringify(estudios));
    await rellenarSelectEstudios(estudios);
});

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

    sessionStorage.setItem('escuelas', JSON.stringify(escuelas));

    return escuelas;
}

async function rellenarSelectEscuelas(escuelas: Escuela[]) {
    const escuelasSelect = document.getElementById('escuelas') as HTMLSelectElement;

    escuelas.forEach((escuela: Escuela) => {
        const option = document.createElement('option');
        option.value = escuela.id.toString();
        option.textContent = escuela.nombre;

        escuelasSelect.appendChild(option);
    });

    escuelasSelect.addEventListener('change', async () => {
        const escuelaId = escuelasSelect.value;
        const grados = await buscarGrados(escuelaId);

        rellenarSelectGrados(grados);
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

function rellenarSelectGrados(grados: Grado[]) {
    const gradosSelect = document.getElementById('grados') as HTMLSelectElement;
    gradosSelect.innerHTML = '';

    gradosSelect.innerHTML = '<option value="0">Todos</option>';

    grados.forEach((grado) => {
        const option = document.createElement('option');
        option.value = grado.id.toString();
        option.textContent = grado.division;

        gradosSelect.appendChild(option);
    });
}

async function buscarParametrosDeEstudio(): Promise<Estudio[]> {
    const query = 'SELECT * FROM estudios';
    const result = await ejecutarSelect(query);

    const estudios: Estudio[] = [];

    result.forEach((estudioDB: any) => {
        const estudio: Estudio = new Estudio();
        estudio.id = estudioDB.ID_ESTUDIO;
        estudio.descripcion = estudioDB.DESCRIPCION;

        estudios.push(estudio);
    });

    return estudios;
}

function rellenarSelectEstudios(estudios: Estudio[]) {
    const estudiosSelect = document.getElementById('estudios') as HTMLSelectElement;
    estudiosSelect.innerHTML = '';

    estudios.forEach((estudio) => {
        const option = document.createElement('option');
        option.value = estudio.id.toString();
        option.textContent = estudio.descripcion;

        estudiosSelect.appendChild(option);
    });
}

async function getRecomendacionesAlumnos(input: HTMLElement) {
    const inputValue = (input as HTMLInputElement).value.trim();

    const idEscuela = parseInt((document.getElementById('escuelas') as HTMLInputElement).value);

    const idGrado = parseInt((document.getElementById('grados') as HTMLInputElement).value);

    let query = `SELECT * FROM alumnos JOIN grados g WHERE g.id_escuela = ${idEscuela} AND a.dni LIKE '%${inputValue}%'`;

    if (idGrado > 0) {
        query = `
        SELECT a.*
        FROM alumnos a
        JOIN grados_alumnos ga ON a.id_alumno = ga.id_alumno
        JOIN grados g ON g.id_grado = ga.id_grado
        WHERE g.id_escuela = ${idEscuela} AND a.dni LIKE '${inputValue}%'
    `;
    }

    query += ` ORDER BY dni FETCH FIRST 25 ROWS ONLY`;

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

document.getElementById('buscar-datos').addEventListener('click', async function () {
    await buscarParametrosEstudio();
});

async function buscarParametrosEstudio() {
    const escuela = (document.getElementById('escuelas') as HTMLSelectElement).value;
    const alumno = (document.getElementById('alumno') as HTMLInputElement).value;
    const grado = (document.getElementById('grados') as HTMLInputElement).value;
    const estudio = (document.getElementById('estudios') as HTMLInputElement).value;
    let desde = (document.getElementById('desde') as HTMLInputElement).value;
    let hasta = (document.getElementById('hasta') as HTMLInputElement).value;

    const desdeDate = new Date(desde);
    const hastaDate = new Date(hasta);
    const todayDate = new Date();

    if (escuela.length === 0) {
        alert('Necesitamos una escuela para buscar la información');
        return;
    }

    let query = `
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
    WHERE 1=1 `;

    const conditions: string[] = [];

    if (escuela.length > 0) {
        conditions.push(`g.id_escuela = ${escuela}`);
    }

    if (alumno.length > 0) {
        conditions.push(`re.id_alumno = ${alumno}`);
    }

    if (grado.length > 0) {
        const grados: Grado[] = [];

        const selectElement = document.getElementById('grados') as HTMLSelectElement;

        if (parseInt(grado) > 0) {
            conditions.push(`re.id_grado = ${grado}`);
            localStorage.setItem('grados', JSON.stringify(selectElement.selectedOptions[0].textContent));
        } else {
            for (let index = 1; index < selectElement.options.length; index++) {
                const gradoOption = selectElement.options[index];
                const grado: Grado = new Grado();
                grado.id = parseInt(gradoOption.value);
                grado.division = gradoOption.textContent || '';

                grados.push(grado);
            }

            localStorage.setItem('grados', JSON.stringify(grados));
        }
    }


    if (estudio.length > 0) {
        conditions.push(`re.id_estudio = ${estudio}`);
    }

    if (desdeDate > hastaDate) {
        alert('La fecha de inicio no puede ser mayor a la fecha de fin');
        return;
    } else if (hastaDate > todayDate) {
        alert('La fecha de fin no puede ser mayor a la fecha actual');
        (document.getElementById('hasta') as HTMLInputElement).value = todayDate.toISOString().substring(0, 10);
        hasta = todayDate.toISOString().substring(0, 10);
        return;
    }

    if (desde.length > 0 && hasta.length > 0) {
        conditions.push(`re.fecha BETWEEN TO_DATE('${desde}', 'YYYY-MM-DD') AND TO_DATE('${hasta}', 'YYYY-MM-DD')`);
    } else if (desde.length > 0) {
        conditions.push(`re.fecha >= TO_DATE('${desde}', 'YYYY-MM-DD')`);
    } else if (hasta.length > 0) {
        conditions.push(`re.fecha <= TO_DATE('${hasta}', 'YYYY-MM-DD')`);
    }

    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    const result = await ejecutarSelect(query);

    const escuelaNew: Escuela = new Escuela();
    escuelaNew.id = parseInt((document.getElementById('escuelas') as HTMLSelectElement).selectedOptions[0].value);
    escuelaNew.nombre = (document.getElementById('escuelas') as HTMLSelectElement).selectedOptions[0].textContent;

    localStorage.setItem('escuela', JSON.stringify(escuelaNew));
    localStorage.setItem('fechaDesde', JSON.stringify(desde));
    localStorage.setItem('fechaHasta', JSON.stringify(hasta));

    if (result.length > 0) {
        localStorage.setItem('resultados', JSON.stringify(result));
        window.location.href = 'resumen_datos.html';
    } else {
        alert('No se encontraron resultados');
        return;
    }
}

async function ejecutarSelect(query: string): Promise<any[]> {
    try {
        const result: any = await window.electronAPI.selectDatabase(query);

        if (result.error) {
            console.error('Error en la consulta:', result.error);
            return null;
        } else {
            if (result.rows && result.rows.length > 0) {

                return result.rows;
            }
        }
    } catch (e) {
        console.error('Error al buscar datos:', e);
        return [];
    }
}