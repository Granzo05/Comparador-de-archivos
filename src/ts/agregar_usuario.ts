import { UsuarioService } from '../services/UsuarioService';
import { Usuario } from '../types/Usuario';
import Toastify from 'toastify-js';

document.getElementById('agregar-usuario')?.addEventListener('click', async () => {
  const userElement = document.getElementById('user') as HTMLInputElement;
  const passwordElement = document.getElementById('password') as HTMLInputElement;
  const rolElement = document.getElementById('rol') as HTMLInputElement;

  const user = userElement.value;
  const password = passwordElement.value;
  const rol = rolElement.value;

  const showToast = (message: string) => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#ff0000",
    }).showToast();
  };

  if (user.length === 0) {
    showToast('Necesita ingresar un usuario válido');
    userElement.focus();
    return;
  } else if (password.length < 8) {
    showToast('Necesita ingresar una contraseña de 8 caracteres o más');
    passwordElement.focus();
    return;
  } else if (rol.length === 0) {
    showToast('Necesita seleccionar un rol');
    rolElement.focus();
    return;
  }

  const usuario: Usuario = { id: 0, usuario: user, contraseña: password, rol: rol };

  showToast(await UsuarioService.verificarExistenciaOCrearUsuario(usuario));
});
