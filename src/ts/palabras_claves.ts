const palabrasClavesElement = document.getElementById('palabras-claves') as HTMLElement;
const palabrasClavesDB: any = '';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const query = 'SELECT palabras_claves FROM model';
    const result = await window.electronAPI.selectDatabase(query);

    const allText: string = JSON.parse(sessionStorage.getItem('exampleText'));

    const palabrasClavesElement = document.getElementById('palabrasClaves');

    result.forEach(row => {
      const palabrasClaves = row.palabras_claves.split(',');

      palabrasClaves.forEach(palabra => {
        if (allText.includes(palabra.trim())) {
          palabrasClavesElement.innerHTML += `${palabra.trim()}, `;
        }
      });
    });

  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  }
});

document.getElementById('filtro-button')?.addEventListener('click', async () => {
  try {
    const palabrasClavesSplit = palabrasClaves.split(',');
    const palabrasClavesDBSplit = palabrasClavesDB.split(',');

    let palabrasNuevas = [];

    palabrasClavesSplit.forEach((palabra) => {
      if (!palabrasClavesDBSplit.includes(palabra.trim())) {
        palabrasNuevas.push(palabra.trim());
      }
    });

    const jsonPalabras = JSON.stringify(palabrasNuevas);

    const query = 'INSERT INTO palabras_claves (model) VALUES (:jsonPalabras)';
    const params = { jsonPalabras };

    const result = await window.electronAPI.insertDatabase(query, params);

    console.log('Inserción exitosa:', result);

    window.location.href = 'resumen.html';

  } catch (error) {
    console.error('Error al insertar nuevas palabras clave:', error);
  }
});