function humanizeText() {
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');

    const outputDiv = document.getElementById('outputText');
    outputDiv.innerHTML = 'Cargando...'; // Mensaje temporal mientras se procesa

    // Limpiar el contenido previo
    outputDiv.innerHTML = '';

    if (fileInput.files.length > 0) {
        // Si hay un archivo cargado, ignorar el texto manual
        const file = fileInput.files[0];

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
                const sanitizedText = sanitizeInput(text);
                processAndDisplayText(sanitizedText);
            } else if (fileType === 'docx') {
                mammoth.extractRawText({ arrayBuffer: e.target.result })
                    .then(result => {
                        const text = result.value;
                        const sanitizedText = sanitizeInput(text);
                        processAndDisplayText(sanitizedText);
                    })
                    .catch(error => {
                        console.error("Error al leer el archivo .docx:", error);
                        alert("Error al leer el archivo .docx. Asegúrate de que el archivo sea válido.");
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
                        pdfText = pages.join('\n');
                        const sanitizedText = sanitizeInput(pdfText);
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
    } else if (textInput.value.trim() !== '') {
        // Si no hay archivo, usar el texto manual
        const sanitizedText = sanitizeInput(textInput.value);
        processAndDisplayText(sanitizedText);
    } else {
        alert("Por favor, ingresa texto manualmente o selecciona un archivo.");
        outputDiv.innerHTML = '';
    }
}

function processAndDisplayText(text) {
    const humanizedText = processText(text);
    const outputDiv = document.getElementById('outputText');

    // Limpiar el contenido previo
    outputDiv.innerHTML = '';

    const paragraphs = humanizedText.split('\n').filter(p => p.trim() !== '');

    paragraphs.forEach(paragraph => {
        const pElement = document.createElement('p');
        pElement.textContent = paragraph;
        pElement.style.marginBottom = '15px';
        pElement.style.lineHeight = '1.6';
        outputDiv.appendChild(pElement);
    });
}

function sanitizeInput(input) {
    return input.replace(/<[^>]*>?/gm, '');
}

function validateFile(file) {
    const allowedTypes = ['txt', 'docx', 'pdf'];
    const maxSize = 5 * 1024 * 1024;

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
    text = replaceWithSynonyms(text);
    text = rephraseSentences(text);
    text = adjustPunctuation(text);
    text = varySentenceLength(text);
    text = insertIdiomaticExpressions(text);
    text = introduceMinorGrammarErrors(text);
    text = varyVerbTenses(text);
    text = addHumanLikePauses(text);

    return text;
}

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
            if (Math.random() < 0.3) { // Solo reemplazar el 30% de las veces
                const randomIndex = Math.floor(Math.random() * synonymList.length);
                return synonymList[randomIndex];
            } else {
                return word; // Mantener la palabra original
            }
        });
    }

    return text;
}

function rephraseSentences(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const rephrasedSentences = sentences.map(sentence => {
        const words = sentence.split(' ');
        if (words.length > 5) {
            if (Math.random() < 0.4) { // Cambiar el orden en el 40% de las oraciones
                const firstWord = words.shift();
                words.push(firstWord);
            }
            return words.join(' ') + '.';
        }
        return sentence + '.';
    });

    return rephrasedSentences.join(' ');
}

function adjustPunctuation(text) {
    text = text.replace(/(\w+)(\s)(\w+)/g, (match, p1, p2, p3) => {
        if (Math.random() < 0.2) { // Añadir una coma el 20% de las veces
            return `${p1},${p2}${p3}`;
        } else if (Math.random() < 0.1) { // Añadir puntos suspensivos el 10% de las veces
            return `${p1}...${p2}${p3}`;
        } else {
            return match;
        }
    });

    return text;
}

function varySentenceLength(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const variedSentences = sentences.map(sentence => {
        const words = sentence.split(' ');
        if (words.length > 10) {
            return words.slice(0, 10).join(' ') + '...';
        } else if (words.length < 5) {
            return sentence + ' Esto añade más detalles.'; // Eliminar esta frase repetitiva
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
        if (index % 5 === 0 && idiomaticExpressions.length > 0) { // Reducir la frecuencia al 20%
            const randomExpression = idiomaticExpressions[Math.floor(Math.random() * idiomaticExpressions.length)];
            return `${sentence}. ${randomExpression}.`;
        }
        return sentence;
    });

    return updatedSentences.join('. ');
}

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
            if (Math.random() < 0.05) { // Solo el 5% de las veces
                const randomIndex = Math.floor(Math.random() * errorList.length);
                return errorList[randomIndex];
            } else {
                return correct;
            }
        });
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

function addHumanLikePauses(text) {
    const pauses = ["...", ",", ";", " -"];
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const updatedSentences = sentences.map(sentence => {
        if (Math.random() < 0.1) { // Añadir pausas en el 10% de las oraciones
            const randomPause = pauses[Math.floor(Math.random() * pauses.length)];
            const words = sentence.split(' ');
            const insertIndex = Math.floor(words.length / 2);
            words.splice(insertIndex, 0, randomPause);
            return words.join(' ') + '.';
        }
        return sentence + '.';
    });

    return updatedSentences.join(' ');
}

function copyText() {
    const outputText = document.getElementById('outputText').innerText;
    navigator.clipboard.writeText(outputText).then(() => {
        alert('Texto copiado al portapapeles.');
    }).catch(() => {
        alert('Error al copiar el texto.');
    });
}

document.getElementById('humanizeButton').addEventListener('click', humanizeText);
document.getElementById('copyButton').addEventListener('click', copyText);

// Limpiar el área de texto cuando se selecciona un archivo
document.getElementById('fileInput').addEventListener('change', function () {
    document.getElementById('textInput').value = ''; // Limpiar el área de texto
});