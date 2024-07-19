import './css/index.css';
import { Usuario } from './types/Usuario';

const usuario: Usuario = JSON.parse(localStorage.getItem('usuario'));

if (usuario) {
    document.getElementById('iniciar-sesion').style.display = 'none';

    try {
        document.getElementById('user-name').innerHTML = usuario.usuario;
    } catch (e) { }

    if (usuario.rol != 'admin') {
        document.getElementById('buscar-datos').style.display = 'none';
        document.getElementById('agregar-user').style.display = 'none';
    }
} else {
    document.getElementById('buscar-datos').style.display = 'none';
    document.getElementById('agregar-user').style.display = 'none';
    document.getElementById('cerrar-sesion').style.display = 'none';
}