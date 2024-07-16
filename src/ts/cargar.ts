import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';

async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await getDocument({ data: arrayBuffer }).promise as PDFDocumentProxy;
    let extractedText = '';

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        const pageText = textItems.map((item: any) => item.str).join(' ');

        extractedText += pageText;
    }

    return extractedText;
}

export async function leerArchivos(files: FileList) {
    if (files.length > 0) {
        let allText = '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let textContent = '';

            if (file.type === 'application/pdf') {
                textContent = await extractTextFromPDF(file);
            } else if (file.name.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                const mammoth = await import('mammoth');
                const result = await mammoth.extractRawText({ arrayBuffer });
                textContent = result.value;
            } else {
                textContent = await file.text();
            }

            allText += ` ${textContent}`;
        }

        sessionStorage.setItem('uploadedFiles', JSON.stringify(allText));
        window.location.href = 'palabras_claves.html';
    }
}