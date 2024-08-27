import { Usuario } from "../types/Usuario";

document.getElementById('login')?.addEventListener('click', async () => {
  const user = (document.getElementById('user') as HTMLInputElement).value;
  const password = (document.getElementById('pass') as HTMLInputElement).value;

  const query = `SELECT * FROM usuario WHERE usuario = :usuario`;

  const params = { usuario: user };

  try {
    const result: any = await window.electronAPI.selectDatabase(query, params);
    console.log(result)

    if (result.rows && result.rows.length > 0) {
      const storedHashedPassword = result.rows[0].CONTRASEÑA;

      const passwordMatch = await window.electronAPI.checkPassword(storedHashedPassword, password);

      if (passwordMatch) {
        const usuario: Usuario = {
          id: result.rows[0].ID_USUARIO,
          usuario: result.rows[0].USUARIO,
          contraseña: '',
          rol: result.rows[0].ROL,
        };

        localStorage.setItem('usuario', JSON.stringify(usuario));
        window.location.href = 'menu_principal.html';
      } else {
        console.error('Usuario o contraseña incorrectos');
      }
    } else {
      console.error('Usuario o contraseña incorrectos');
    }

  } catch (error) {
    console.error('Error al realizar la consulta:', error);
  }
});

