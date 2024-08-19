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
    console.log(alumnos)
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
    const escuela = (document.getElementById('escuelas') as HTMLInputElement).value;
    const alumno = (document.getElementById('alumno') as HTMLInputElement).value;
    const grado = (document.getElementById('grados') as HTMLInputElement).value;
    const estudio = (document.getElementById('estudios') as HTMLInputElement).value;
    const desde = (document.getElementById('desde') as HTMLInputElement).value;
    const hasta = (document.getElementById('hasta') as HTMLInputElement).value;

    if (escuela.length === 0) {
        alert('Necesitamos una escuela para buscar la información');
        return;
    }

    let query = 'SELECT * FROM resultados_estudios WHERE 1=1';

    const conditions: string[] = [];

    if (alumno.length > 0) {
        conditions.push(`id_alumno = ${alumno}`);
    }
    
    if (grado.length > 0) {
        conditions.push(`id_grado = ${grado}`);
    }
    
    if (estudio.length > 0) {
        conditions.push(`id_estudio = ${estudio}`);
    }

    if (desde.length > 0 && hasta.length > 0) {
        conditions.push(`fecha BETWEEN TO_DATE('${desde}', 'YYYY-MM-DD') AND TO_DATE('${hasta}', 'YYYY-MM-DD')`);
    } else if (desde.length > 0) {
        conditions.push(`fecha >= TO_DATE('${desde}', 'YYYY-MM-DD')`);
    } else if (hasta.length > 0) {
        conditions.push(`fecha <= TO_DATE('${hasta}', 'YYYY-MM-DD')`);
    }

    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    console.log(query);
    
    const result = await ejecutarSelect(query);

    if (result.length > 0) {
        console.log(result);
    } else {
        alert('No se encontraron resultados');
    }    
}

async function ejecutarSelect(query: string): Promise<any[]> {
    try {
        const result: any = await window.electronAPI.selectDatabase(query);
        console.log(result.rows);

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