const palabrasClaves = document.getElementById('palabras') as HTMLElement;
const palabrasClavesSplit: string[] = palabrasClaves.innerHTML.split(',');

document.addEventListener('DOMContentLoaded', () => {
    const storedData = localStorage.getItem('uploadedFiles');
    if (storedData) {
      const allText = storedData;
      const resumen = createSummary(allText);
      
      const summaryElement = document.getElementById('summary');
      if (summaryElement) {
        summaryElement.innerHTML = `<h3>Resumen:</h3><p>${resumen}</p>`;
      }
    }
  });
  
  function createSummary(text: string): string {
    const words = text.split(' ');
    return words.slice(0, 100).join(' ') + '...';
  }
  