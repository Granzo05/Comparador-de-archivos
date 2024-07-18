document.getElementById('login')?.addEventListener('click', async () => {
  const user = (document.getElementById('user') as HTMLInputElement).value;
  const password = (document.getElementById('pass') as HTMLInputElement).value;

  const query = `SELECT * FROM USUARIOS WHERE usuario = '${user}' AND contraseña = '${password}'`;

  try {
    const result: any = await window.electronAPI.queryDatabase(query);

    if (result.error) {
      console.error('Error en la consulta:', result.error);
    } else {
      if (result.rows && result.rows.length > 0) {
        window.location.href = 'menu_principal.html';
      } else {
        console.error('Usuario o contraseña incorrectos');
      }
    }
  } catch (error) {
    console.error('Error al realizar la consulta:', error);
  }
});
