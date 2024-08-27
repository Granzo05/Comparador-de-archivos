import './css/index.css';
import { Usuario } from './types/Usuario';

const usuario: Usuario = JSON.parse(localStorage.getItem('usuario'));
if (usuario) {
    try {
        document.getElementById('iniciar-sesion').style.display = 'none';

    } catch (e) { }

    try {
        document.getElementById('user-name').innerHTML = usuario.usuario;
    } catch (e) { }

    check(usuario);

    async function check(usuario: Usuario) {
        if (await window.electronAPI.checkRol(usuario.rol)) {
            try {
                document.getElementById('buscar-datos').style.display = 'none';
            } catch (e) { }

            try {
                document.getElementById('agregar-user').style.display = 'none';
            } catch (e) { }
        }
    }
} else {
    try {
        document.getElementById('buscar-datos').style.display = 'none';
    } catch (e) { }

    try {
        document.getElementById('agregar-user').style.display = 'none';
    } catch (e) { }

    try {
        document.getElementById('cerrar-sesion').style.display = 'none';
    } catch (e) { }

    try {
        document.getElementById('cargar-archivos').innerText = 'Resumir archivos';
    } catch (e) { }

    try {
        document.getElementById('button-guardar-datos').style.display = 'none';
    } catch (e) { }
}
