import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import * as mammoth from 'mammoth';

document.getElementById('fileInput')?.addEventListener('input', async () => {
    const inputArchivos = document.getElementById('fileInput') as HTMLInputElement;

    const archivos = inputArchivos.files;

    if (archivos && archivos.length > 0) {
        let archivosConvertidosEnHTML: string[] = [];

        for (let i = 0; i < archivos.length; i++) {
            const archivo = archivos[i];

            let texto = '';

            if (archivo.type === 'application/pdf') {
                texto = await extraerTextoPDF(archivo);
            } else if (archivo.name.endsWith('.docx')) {
                const arrayBuffer = await archivo.arrayBuffer();

                const htmlResult = await mammoth.convertToHtml({ arrayBuffer });

                archivosConvertidosEnHTML[i] = htmlResult.value;
            }
        }

        sessionStorage.setItem('archivosEnHTML', JSON.stringify(archivosConvertidosEnHTML));

        window.location.href = 'palabras_claves.html';
    }
});

async function extraerTextoPDF(archivo: File): Promise<string> {
    const arrayBuffer = await archivo.arrayBuffer();
    const pdfDocument = await getDocument({ data: arrayBuffer }).promise as PDFDocumentProxy;
    let texto = '';

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        const pageText = textItems.map((item: any) => item.str).join(' ');

        texto += pageText;
    }

    return texto;
}