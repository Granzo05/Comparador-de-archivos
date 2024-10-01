import * as mammoth from 'mammoth';

document.getElementById('fileInput')?.addEventListener('input', async () => {
    const inputArchivos = document.getElementById('fileInput') as HTMLInputElement;

    const archivos = inputArchivos.files;

    if (archivos && archivos.length > 0) {
        let archivosConvertidosEnHTML: string[] = [];

        for (let i = 0; i < archivos.length; i++) {
            const archivo = archivos[i];

            let texto = '';

            const arrayBuffer = await archivo.arrayBuffer();

            const htmlResult = await mammoth.convertToHtml({ arrayBuffer });

            archivosConvertidosEnHTML[i] = htmlResult.value;
        }

        sessionStorage.setItem('archivosEnHTML', JSON.stringify(archivosConvertidosEnHTML));

        window.location.href = 'palabras_claves.html';
    }
});