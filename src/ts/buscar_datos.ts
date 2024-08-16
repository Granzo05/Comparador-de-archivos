import { ParametroEstudio } from "../types/ParametroEstudio";
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
    console.log(grados);
    grados.forEach((grado) => {
        const option = document.createElement('option');
        option.value = grado.id.toString();
        option.textContent = grado.division;

        gradosSelect.appendChild(option);
    });
}

async function buscarParametrosDeEstudio(): Promise<ParametroEstudio[]> {
    const query = 'SELECT * FROM estudios';
    const result = await ejecutarSelect(query);

    const estudios: ParametroEstudio[] = [];

    result.forEach((estudioDB: any) => {
        const estudio: ParametroEstudio = new ParametroEstudio();
        estudio.id = estudioDB.ID_ESTUDIO;
        estudio.descripcion = estudioDB.DESCRIPCION;

        estudios.push(estudio);
    });

    return estudios;
}

function rellenarSelectEstudios(estudios: ParametroEstudio[]) {
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
    console.log(alumnos)
    const divConDatos = input.nextElementSibling as HTMLElement;
    divConDatos.innerHTML = '';
    divConDatos.style.display = 'block';

    alumnos.forEach((alumno: any) => {
        const div = document.createElement('div');
        div.textContent = `${alumno.DNI} - ${alumno.NOMBRE}`;
        div.style.cursor = 'pointer';

        div.addEventListener('click', () => {
            input.value = alumno.DNI;
            input.textContent = alumno.DNI;
            divConDatos.innerHTML = '';
            divConDatos.style.display = 'none';
        });

        divConDatos.appendChild(div);
    });
}

async function buscarParametrosEstudio() {
    const escuela = (document.getElementById('escuela') as HTMLInputElement).value;
    const alumno = (document.getElementById('alumno') as HTMLInputElement).value;
    const grado = (document.getElementById('grados') as HTMLInputElement).value;
    const parametro = (document.getElementById('parametro') as HTMLInputElement).value;
    const desde = (document.getElementById('desde') as HTMLInputElement).value;
    const hasta = (document.getElementById('hasta') as HTMLInputElement).value;

    if (escuela.length === 0) {
        alert('Necesitamos una escuela para buscar la información');
        return;
    }

    let query = 'SELECT * FROM resultados_estudios';

    if (alumno.length > 0) {
        query += ` WHERE alumno = ${alumno}`;
    }

    if (grado.length > 0) {
        let query = 'SELECT * FROM resultados_estudios';
    }

    if (alumno.length > 0 || grado.length > 0) {
        query += ` AND grado = ${grado}`;
    } else if (grado.length > 0) {
        query += ` WHERE grado = ${grado}`;
    }

    if ((alumno.length > 0 || grado.length > 0) && parametro.length > 0) {
        query += ` AND parametro = ${parametro}`;
    } else if (parametro.length > 0) {
        query += ` WHERE parametro = ${parametro}`;
    }

    if ((alumno.length > 0 || grado.length > 0 || parametro.length > 0) && desde.length > 0 && hasta.length > 0) {
        query += ` AND fecha_desde and FECHA_HASTA BETWEEN (${desde}, ${hasta})`;
    } else if ((alumno.length > 0 || grado.length > 0 || parametro.length > 0) && desde.length > 0) {
        query += ` AND fecha_desde AFTER = ${desde}`;
    } else if (desde.length > 0 && hasta.length > 0) {
        query += ` WHERE fecha_desde and FECHA_HASTA BETWEEN (${desde}, ${hasta})`;
    } else if (desde.length > 0) {
        query += ` WHERE fecha_desde AFTER = ${desde}`;
    } else if (hasta.length > 0) {
        query += ` WHERE fecha_hasta AFTER = ${desde}`;
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
                console.log(result.rows);

                return result.rows;
            }
        }
    } catch (e) {
        console.error('Error al buscar datos:', e);
        return [];
    }
}