// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Función para validar el archivo
function validateFile(file) {
    // Tipos de archivo permitidos
    const allowedTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
    
    // Tamaño máximo permitido (5 MB)
    const maxSize = 5 * 1024 * 1024; // 5 MB en bytes

    // Verificar el tipo de archivo
    if (!allowedTypes.includes(file.type)) {
        return false; // Tipo de archivo no permitido
    }

    // Verificar el tamaño del archivo
    if (file.size > maxSize) {
        return false; // Tamaño de archivo excede el límite
    }

    return true; // Archivo válido
}

// Función principal para humanizar el texto
function humanizeText() {
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');

    const outputDiv = document.getElementById('outputText');
    outputDiv.innerHTML = 'Cargando...'; // Mensaje temporal mientras se procesa

    let textToProcess = '';

    if (fileInput.files.length > 0) {
        // Si hay un archivo cargado, ignorar el texto manual
        const file = fileInput.files[0];

        if (!validateFile(file)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Formato de archivo no soportado o tamaño excesivo. Usa .txt, .docx o .pdf (máximo 5 MB).',
            });
            outputDiv.innerHTML = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const fileType = file.name.split('.').pop().toLowerCase();

            if (fileType === 'txt') {
                textToProcess = e.target.result;
            } else if (fileType === 'docx') {
                mammoth.extractRawText({ arrayBuffer: e.target.result })
                    .then(result => {
                        textToProcess = result.value;
                        processAndDisplayText(textToProcess);
                    })
                    .catch(error => {
                        console.error("Error al leer el archivo .docx:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error al leer el archivo .docx. Asegúrate de que el archivo sea válido.',
                        });
                        outputDiv.innerHTML = '';
                    });
            } else if (fileType === 'pdf') {
                const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
                loadingTask.promise.then(pdf => {
                    let pdfText = '';
                    const numPages = pdf.numPages;

                    const pagePromises = [];
                    for (let i = 1; i <= numPages; i++) {
                        pagePromises.push(
                            pdf.getPage(i).then(page => {
                                return page.getTextContent().then(textContent => {
                                    return textContent.items.map(item => item.str).join(' ');
                                });
                            })
                        );
                    }

                    Promise.all(pagePromises).then(pages => {
                        textToProcess = pages.join('\n');
                        processAndDisplayText(textToProcess);
                    });
                }).catch(error => {
                    console.error("Error al leer el archivo .pdf:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al leer el archivo .pdf. Asegúrate de que el archivo sea válido.',
                    });
                    outputDiv.innerHTML = '';
                });
            }

            if (fileType === 'txt') {
                processAndDisplayText(textToProcess);
            }
        };

        reader.readAsArrayBuffer(file);
    } else if (textInput.value.trim() !== '') {
        // Si no hay archivo, usar el texto manual
        textToProcess = textInput.value;
        processAndDisplayText(textToProcess);
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Por favor, ingresa texto manualmente o selecciona un archivo.',
        });
        outputDiv.innerHTML = '';
    }
}

// Función para procesar y mostrar el texto humanizado
function processAndDisplayText(text) {
    const sanitizedText = sanitizeInput(text);
    const humanizedText = humanizeTextContent(sanitizedText);

    const outputDiv = document.getElementById('outputText');
    outputDiv.innerHTML = '';

    const pElement = document.createElement('p');
    pElement.textContent = humanizedText;
    pElement.style.marginBottom = '15px';
    pElement.style.lineHeight = '1.6';
    outputDiv.appendChild(pElement);
}

// Función para sanitizar el texto (eliminar etiquetas HTML)
function sanitizeInput(input) {
    return input.replace(/<[^>]*>?/gm, ''); // Eliminar etiquetas HTML
}

// Función para humanizar el contenido del texto
function humanizeTextContent(text) {
    // Aplicar humanización paso a paso
    let humanizedText = text;

    humanizedText = replaceWithSynonyms(humanizedText);
    humanizedText = rephraseSentences(humanizedText);
    humanizedText = adjustPunctuation(humanizedText);
    humanizedText = varySentenceLength(humanizedText);
    humanizedText = introduceMinorGrammarErrors(humanizedText);
    humanizedText = varyVerbTenses(humanizedText);

    return humanizedText;
}

// Función para reemplazar palabras con sinónimos
function replaceWithSynonyms(text) {
    const synonyms = {
        "puede": ["podría", "es capaz de", "tiene la posibilidad de"],
        "debe": ["debería", "tiene que", "está obligado a"],
        "es": ["resulta ser", "viene a ser", "se considera"],
        "un": ["algún", "cualquier", "uno"],
        "una": ["cierta", "alguna", "una clase de"],
        "muy": ["extremadamente", "sumamente", "realmente"],
        "grande": ["enorme", "vasto", "gigantesco"],
        "pequeño": ["diminuto", "minúsculo", "reducido"],
        "hacer": ["realizar", "efectuar", "llevar a cabo"],
        "tener": ["poseer", "contar con", "disponer de"],
        "decir": ["mencionar", "expresar", "comentar"],
        "ver": ["observar", "contemplar", "mirar"],
        "saber": ["conocer", "estar al tanto", "tener conocimiento"],
        "importante": ["crucial", "esencial", "fundamental"],
        "bueno": ["excelente", "magnífico", "destacado"],
        "malo": ["pésimo", "terrible", "deficiente"]
    };

    for (const [word, synonymList] of Object.entries(synonyms)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, () => {
            if (Math.random() < 0.2) { // Solo reemplazar el 20% de las veces
                const randomIndex = Math.floor(Math.random() * synonymList.length);
                return synonymList[randomIndex];
            } else {
                return word; // Mantener la palabra original
            }
        });
    }

    return text;
}

// Función para reformular oraciones
function rephraseSentences(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const rephrasedSentences = sentences.map(sentence => {
        const words = sentence.split(' ');
        if (words.length > 5 && Math.random() < 0.3) { // Cambiar el orden en el 30% de las oraciones largas
            const firstWord = words.shift();
            words.push(firstWord);
            return words.join(' ') + '.';
        }
        return sentence + '.';
    });

    return rephrasedSentences.join(' ');
}

// Función para ajustar la puntuación
function adjustPunctuation(text) {
    text = text.replace(/(\w+)(\s)(\w+)/g, (match, p1, p2, p3) => {
        if (Math.random() < 0.1) { // Añadir una coma solo el 10% de las veces
            return `${p1},${p2}${p3}`;
        } else if (Math.random() < 0.05) { // Añadir puntos suspensivos solo el 5% de las veces
            return `${p1}...${p2}${p3}`;
        } else {
            return match;
        }
    });

    return text;
}

// Función para variar la longitud de las oraciones
function varySentenceLength(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const variedSentences = sentences.map(sentence => {
        const words = sentence.split(' ');
        if (words.length > 10 && Math.random() < 0.2) { // Acortar oraciones largas el 20% de las veces
            return words.slice(0, 10).join(' ') + '...';
        }
        return sentence;
    });

    return variedSentences.join('. ');
}

// Función para introducir errores gramaticales menores
function introduceMinorGrammarErrors(text) {
    const errors = {
        "el": ["lo", "el"],
        "la": ["las", "la"],
        "un": ["uno", "un"],
        "es": ["ez", "es"],
        "de": ["del", "de"]
    };

    for (const [correct, errorList] of Object.entries(errors)) {
        const regex = new RegExp(`\\b${correct}\\b`, 'gi');
        text = text.replace(regex, () => {
            if (Math.random() < 0.03) { // Solo el 3% de las veces
                const randomIndex = Math.floor(Math.random() * errorList.length);
                return errorList[randomIndex];
            } else {
                return correct;
            }
        });
    }

    return text;
}

// Función para variar los tiempos verbales
function varyVerbTenses(text) {
    const verbTenses = {
        "es": "era",
        "hace": "hacía",
        "tiene": "tenía",
        "puede": "podía",
        "dice": "decía"
    };

    for (const [present, past] of Object.entries(verbTenses)) {
        const regex = new RegExp(`\\b${present}\\b`, 'gi');
        text = text.replace(regex, () => {
            if (Math.random() < 0.1) { // Cambiar el tiempo verbal solo el 10% de las veces
                return past;
            } else {
                return present;
            }
        });
    }

    return text;
}

// Función para copiar el texto humanizado al portapapeles
function copyText() {
    const outputText = document.getElementById('outputText').innerText;
    navigator.clipboard.writeText(outputText).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Texto copiado',
            text: 'El texto ha sido copiado al portapapeles.',
            showConfirmButton: false,
            timer: 1500,
        });
    }).catch(() => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo copiar el texto.',
        });
    });
}

// Event listeners
document.getElementById('humanizeButton').addEventListener('click', humanizeText);
document.getElementById('copyButton').addEventListener('click', copyText);

// Limpiar el área de texto cuando se selecciona un archivo
document.getElementById('fileInput').addEventListener('change', function () {
    document.getElementById('textInput').value = ''; // Limpiar el área de texto
});

// Limpiar el área de archivos cuando se escribe en el área de texto
document.getElementById('textInput').addEventListener('input', function () {
    document.getElementById('fileInput').value = ''; // Limpiar el área de archivos
});