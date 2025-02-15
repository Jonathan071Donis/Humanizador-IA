function humanizeText() {
    const textInput = document.getElementById('textInput').value;
    const fileInput = document.getElementById('fileInput');

    // Limpiar el contenido previo del output
    const outputDiv = document.getElementById('outputText');
    outputDiv.innerHTML = 'Cargando...'; // Mensaje temporal mientras se procesa

    // Validar entrada de texto manual
    if (textInput.trim() !== '') {
        const sanitizedText = sanitizeInput(textInput); // Sanitizar el texto manual
        processAndDisplayText(sanitizedText);
        return;
    }

    // Si hay un archivo cargado, procesarlo
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        // Validar el tipo y tamaño del archivo
        if (!validateFile(file)) {
            alert("Formato de archivo no soportado o tamaño excesivo. Usa .txt, .docx o .pdf (máximo 5 MB).");
            outputDiv.innerHTML = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const fileType = file.name.split('.').pop().toLowerCase();

            if (fileType === 'txt') {
                const text = e.target.result;
                const sanitizedText = sanitizeInput(text); // Sanitizar el texto del archivo
                processAndDisplayText(sanitizedText);
            } else if (fileType === 'docx') {
                // Procesar archivo .docx con Mammoth.js
                mammoth.extractRawText({ arrayBuffer: e.target.result })
                    .then(result => {
                        const text = result.value;
                        const sanitizedText = sanitizeInput(text); // Sanitizar el texto
                        processAndDisplayText(sanitizedText);
                    })
                    .catch(error => {
                        console.error("Error al leer el archivo .docx:", error);
                        alert("Error al leer el archivo .docx. Asegúrate de que el archivo sea válido.");
                        outputDiv.innerHTML = '';
                    });
            } else if (fileType === 'pdf') {
                // Procesar archivo .pdf con PDF.js
                const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
                loadingTask.promise.then(pdf => {
                    let pdfText = '';
                    const numPages = pdf.numPages;

                    // Leer todas las páginas
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

                    // Unir el texto de todas las páginas
                    Promise.all(pagePromises).then(pages => {
                        pdfText = pages.join('\n');
                        const sanitizedText = sanitizeInput(pdfText); // Sanitizar el texto
                        processAndDisplayText(sanitizedText);
                    });
                }).catch(error => {
                    console.error("Error al leer el archivo .pdf:", error);
                    alert("Error al leer el archivo .pdf. Asegúrate de que el archivo sea válido.");
                    outputDiv.innerHTML = '';
                });
            }
        };

        reader.readAsArrayBuffer(file);
    } else {
        alert("Por favor, ingresa texto manualmente o selecciona un archivo.");
        outputDiv.innerHTML = '';
    }
}

function processAndDisplayText(text) {
    const humanizedText = processText(text); // Humanizar el texto
    const outputDiv = document.getElementById('outputText');

    // Limpiar el contenido previo
    outputDiv.innerHTML = '';

    // Dividir el texto en párrafos (basado en saltos de línea)
    const paragraphs = humanizedText.split('\n').filter(p => p.trim() !== '');

    // Añadir cada párrafo como un elemento <p>
    paragraphs.forEach(paragraph => {
        const pElement = document.createElement('p');
        pElement.textContent = paragraph; // InnerText para evitar XSS
        pElement.style.marginBottom = '15px'; // Espaciado entre párrafos
        pElement.style.lineHeight = '1.6'; // Espaciado entre líneas
        outputDiv.appendChild(pElement);
    });
}

function sanitizeInput(input) {
    // Eliminar etiquetas HTML y scripts maliciosos
    return input.replace(/<[^>]*>?/gm, '');
}

function validateFile(file) {
    const allowedTypes = ['txt', 'docx', 'pdf'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    const fileType = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileType)) {
        return false;
    }

    if (file.size > maxSize) {
        return false;
    }

    return true;
}

function processText(text) {
    // Paso 1: Reemplazar palabras comunes con sinónimos
    text = replaceWithSynonyms(text);

    // Paso 2: Modificar la estructura de las oraciones
    text = rephraseSentences(text);

    // Paso 3: Ajustar la puntuación para hacerla más humana
    text = adjustPunctuation(text);

    // Paso 4: Añadir variabilidad en la longitud de las oraciones
    text = varySentenceLength(text);

    // Paso 5: Insertar expresiones idiomáticas
    text = insertIdiomaticExpressions(text);

    // Paso 6: Introducir errores gramaticales menores
    text = introduceMinorGrammarErrors(text);

    // Paso 7: Variar los tiempos verbales
    text = varyVerbTenses(text);

    return text;
}

function replaceWithSynonyms(text) {
    const synonyms = {
        "puede": "podría",
        "debe": "debería",
        "es": "resulta ser",
        "un": "algún",
        "una": "cierta",
        "muy": "extremadamente",
        "grande": "enorme",
        "pequeño": "diminuto",
        "hacer": "realizar",
        "tener": "poseer",
        "decir": "mencionar",
        "ver": "observar",
        "saber": "conocer",
        "importante": "crucial",
        "bueno": "excelente",
        "malo": "pésimo"
    };

    for (const [word, synonym] of Object.entries(synonyms)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, synonym);
    }

    return text;
}

function rephraseSentences(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const rephrasedSentences = sentences.map(sentence => {
        const words = sentence.split(' ');
        if (words.length > 5) {
            const firstWord = words.shift();
            words.push(firstWord);
            return words.join(' ') + '.';
        }
        return sentence + '.';
    });

    return rephrasedSentences.join(' ');
}

function adjustPunctuation(text) {
    text = text.replace(/(\w+)(\s)(\w+)/g, '$1,$2$3');
    text = text.replace(/(\w+)(\s)(\w+)/g, '$1...$2$3');
    return text;
}

function varySentenceLength(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const variedSentences = sentences.map(sentence => {
        const words = sentence.split(' ');
        if (words.length > 10) {
            return words.slice(0, 10).join(' ') + '...';
        } else if (words.length < 5) {
            return sentence + ' Esto añade más detalles.';
        }
        return sentence;
    });

    return variedSentences.join('. ');
}

function insertIdiomaticExpressions(text) {
    const idiomaticExpressions = [
        "al fin y al cabo",
        "de vez en cuando",
        "en un abrir y cerrar de ojos",
        "dar en el clavo",
        "estar en las nubes",
        "poner las cartas sobre la mesa"
    ];

    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const updatedSentences = sentences.map((sentence, index) => {
        if (index % 3 === 0 && idiomaticExpressions.length > 0) {
            const randomExpression = idiomaticExpressions[Math.floor(Math.random() * idiomaticExpressions.length)];
            return `${sentence}. ${randomExpression}.`;
        }
        return sentence;
    });

    return updatedSentences.join('. ');
}

function introduceMinorGrammarErrors(text) {
    const errors = {
        "el": "lo",
        "la": "las",
        "un": "uno",
        "es": "ez",
        "de": "del"
    };

    for (const [correct, error] of Object.entries(errors)) {
        const regex = new RegExp(`\\b${correct}\\b`, 'gi');
        text = text.replace(regex, error);
    }

    return text;
}

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
        text = text.replace(regex, past);
    }

    return text;
}

function copyText() {
    const outputText = document.getElementById('outputText').innerText;
    navigator.clipboard.writeText(outputText).then(() => {
        alert('Texto copiado al portapapeles.');
    }).catch(() => {
        alert('Error al copiar el texto.');
    });
}

// Agrega los listeners al final del archivo JS
document.getElementById('humanizeButton').addEventListener('click', humanizeText);
document.getElementById('copyButton').addEventListener('click', copyText);