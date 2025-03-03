// Configurar el worker de PDF.js con HTTPS
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Función para validar el archivo
function validateFile(file) {
    const allowedTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
        return false;
    }

    if (file.size > maxSize) {
        return false;
    }

    return true;
}

// Función principal para humanizar el texto
function humanizeText() {
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');
    const outputDiv = document.getElementById('outputText');
    outputDiv.innerHTML = 'Cargando...';

    let textToProcess = '';

    if (fileInput.files.length > 0) {
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

    // Dividir el texto en párrafos
    const paragraphs = humanizedText.split('\n').filter(p => p.trim() !== '');

    paragraphs.forEach(paragraph => {
        const pElement = document.createElement('p');
        pElement.textContent = paragraph;
        pElement.style.marginBottom = '15px';
        pElement.style.lineHeight = '1.6';
        outputDiv.appendChild(pElement);
    });
}

// Función para sanitizar el texto
function sanitizeInput(input) {
    return input.replace(/<[^>]*>?/gm, ''); // Eliminar etiquetas HTML
}

// Función para humanizar el contenido del texto
function humanizeTextContent(text) {
    let humanizedText = text;

    humanizedText = replaceWithSynonyms(humanizedText);
    humanizedText = rephraseSentences(humanizedText);
    humanizedText = adjustPunctuation(humanizedText);
    humanizedText = varySentenceLength(humanizedText);
    humanizedText = introduceMinorGrammarErrors(humanizedText);
    humanizedText = varyVerbTenses(humanizedText);
    humanizedText = addFillerWords(humanizedText);
    humanizedText = addIdiomaticExpressions(humanizedText);

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
            if (Math.random() < 0.5) { // Aumentar la probabilidad de reemplazo al 50%
                const randomIndex = Math.floor(Math.random() * synonymList.length);
                return synonymList[randomIndex];
            } else {
                return word;
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
        if (words.length > 5 && Math.random() < 0.3) { // Aumentar la probabilidad de reordenar al 30%
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
    // Añadir comas solo en casos específicos
    text = text.replace(/(\w+)(\s)(\w+)/g, (match, p1, p2, p3) => {
        if (Math.random() < 0.1) { // Aumentar la probabilidad de añadir una coma al 10%
            return `${p1},${p2}${p3}`;
        } else {
            return match;
        }
    });

    // Añadir puntos suspensivos solo en casos específicos
    text = text.replace(/(\w+)(\s)(\w+)/g, (match, p1, p2, p3) => {
        if (Math.random() < 0.05) { // Aumentar la probabilidad de añadir puntos suspensivos al 5%
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
        if (words.length > 15 && Math.random() < 0.3) { // Aumentar la probabilidad de acortar al 30%
            return words.slice(0, 15).join(' ') + '...';
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
            if (Math.random() < 0.1) { // Aumentar la probabilidad de errores al 10%
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
            if (Math.random() < 0.3) { // Aumentar la probabilidad de cambiar el tiempo verbal al 30%
                return past;
            } else {
                return present;
            }
        });
    }

    return text;
}

// Función para añadir palabras de relleno
function addFillerWords(text) {
    const fillerWords = ["eh", "bueno", "entonces", "así que", "pues", "o sea"];
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const filledSentences = sentences.map(sentence => {
        if (Math.random() < 0.2) { // Añadir palabras de relleno al 20% de las oraciones
            const randomIndex = Math.floor(Math.random() * fillerWords.length);
            return `${fillerWords[randomIndex]}, ${sentence}`;
        }
        return sentence;
    });

    return filledSentences.join('. ');
}

// Función para añadir expresiones idiomáticas
function addIdiomaticExpressions(text) {
    const idiomaticExpressions = [
        "al fin y al cabo",
        "de vez en cuando",
        "en un abrir y cerrar de ojos",
        "por si las moscas",
        "a la larga",
        "a corto plazo",
        "a pie juntillas",
        "a todo dar",
        "a la buena de Dios",
        "a la vuelta de la esquina"
    ];

    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== '');

    const idiomaticSentences = sentences.map(sentence => {
        if (Math.random() < 0.2) { // Añadir expresiones idiomáticas al 20% de las oraciones
            const randomIndex = Math.floor(Math.random() * idiomaticExpressions.length);
            return `${sentence} ${idiomaticExpressions[randomIndex]}.`;
        }
        return sentence;
    });

    return idiomaticSentences.join(' ');
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
    document.getElementById('textInput').value = '';
});

// Limpiar el área de archivos cuando se escribe en el área de texto
document.getElementById('textInput').addEventListener('input', function () {
    document.getElementById('fileInput').value = '';
});

// Función para mostrar alertas que se cierran automáticamente
function showAlert(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        showConfirmButton: false,
        timer: 2000, // Duración de 2 segundos
        timerProgressBar: true,
    });
}

// Función para descargar en Word (.docx)
document.getElementById('downloadWord').addEventListener('click', function () {
    const outputText = document.getElementById('outputText').innerText;

    // Crear un documento de Word con la librería docx
    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: [
                // Agregar el "logo" de texto
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "Donis071-🥷",
                            bold: true,
                            size: 28,
                            font: 'Arial'
                        })
                    ],
                    alignment: docx.AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "Todos los Derechos reservados 071$ 🥷.",
                            italics: true,
                            size: 24,
                            font: 'Arial'
                        })
                    ],
                    alignment: docx.AlignmentType.CENTER,
                    spacing: { after: 300 }
                }),
                // Agregar el texto
                ...outputText.split('\n').filter(p => p.trim() !== '').map(paragraph => (
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: paragraph,
                                size: 24,
                                font: 'Arial'
                            })
                        ],
                        spacing: {
                            after: 200,
                            line: 240
                        }
                    })
                )),
                // Agregar un pie de página
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "Donis071-🥷",
                            size: 10,
                            font: 'Arial',
                            color: '999999'
                        })
                    ],
                    alignment: docx.AlignmentType.CENTER,
                    spacing: { before: 200 }
                })
            ]
        }]
    });

    // Guardar el documento
    docx.Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'texto_humanizado.docx';
        a.click();
        URL.revokeObjectURL(url);
        showAlert('Éxito!', 'Documento Word descargado con éxito'); // Usar la nueva función de alerta
    });
});

// Función para descargar en PDF
document.getElementById('downloadPdf').addEventListener('click', function () {
    const outputText = document.getElementById('outputText').innerText;
    const { jsPDF } = window.jspdf;

    // Crear un nuevo documento PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Configurar márgenes y fuente
    const margin = 15;
    const lineHeight = 10; // Espacio entre líneas
    const fontSizeTitle = 18;
    const fontSizeSubtitle = 14;
    const fontSizeText = 12;
    const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;

    // Título del documento
    doc.setFontSize(fontSizeTitle);
    doc.setTextColor(0, 0, 0);
    doc.text("Donis071- ^_~ - ^.^ ", doc.internal.pageSize.getWidth() / 2, margin, { align: 'center' });

    // Línea horizontal debajo del título
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 10, pageWidth + margin, margin + 10); // Dibuja una línea horizontal

    // Subtítulo opcional
    doc.setFontSize(fontSizeSubtitle);
    doc.setTextColor(100, 100, 100); // Un gris más claro
    doc.text("Todos los Derechos reservados 071$.", doc.internal.pageSize.getWidth() / 2, margin + 15, { align: 'center' });

    // Configurar el texto principal
    doc.setFontSize(fontSizeText);
    doc.setTextColor(50, 50, 50); // Gris suave

    // Dividir el texto en líneas que quepan en el ancho de la página
    const lines = doc.splitTextToSize(outputText, pageWidth);
    let y = margin + 30; // Ajustar la posición Y para el texto

    lines.forEach((line) => {
        if (y > doc.internal.pageSize.getHeight() - margin - 20) {
            doc.addPage();
            y = margin; // Reiniciar la posición Y al inicio de la nueva página
        }
        doc.text(line, margin, y);
        y += lineHeight; // Ajustar la posición Y para la siguiente línea
    });

    // Agregar un pie de página
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150); // Un gris más claro
    const footerText = "Página " + doc.internal.getNumberOfPages();
    doc.text(footerText, margin, doc.internal.pageSize.getHeight() - margin); // Colocar en el pie de página

    // Guardar el PDF
    doc.save('texto_humanizado.pdf');
    showAlert('Éxito!', 'Documento PDF descargado con éxito'); // Usar la nueva función de alerta
});

// Función para descargar en TXT
document.getElementById('downloadTxt').addEventListener('click', function () {
    const outputText = document.getElementById('outputText').innerText;
    const content = "Donis071-🥷\n\n" + outputText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'texto_humanizado.txt';
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Éxito!', 'Documento TXT descargado con éxito'); // Usar la nueva función de alerta
});


// Función para cambiar entre modo día y noche
document.getElementById('toggleModeButton').addEventListener('click', function () {
    document.body.classList.toggle('night-mode');
    const button = document.getElementById('toggleModeButton');
    if (document.body.classList.contains('night-mode')) {
        button.textContent = 'Modo Noche';
    } else {
        button.textContent = 'Modo  Día ';
    }
});

// Función para tomar una foto con la cámara trasera o frontal
document.getElementById('takePhotoButton').addEventListener('click', function () {
    // Mostrar un cuadro de diálogo para que el usuario elija la cámara
    Swal.fire({
        title: 'Selecciona la cámara',
        text: '¿Quieres usar la cámara frontal o trasera?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Cámara Trasera',
        denyButtonText: 'Cámara Frontal',
        cancelButtonText: 'Cancelar',
    }).then((result) => {
        if (result.isConfirmed) {
            // Usar la cámara trasera
            openCamera({ facingMode: 'environment' });
        } else if (result.isDenied) {
            // Usar la cámara frontal
            openCamera({ facingMode: 'user' });
        }
    });
});

// Función para abrir la cámara y tomar una foto
function openCamera(constraints) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: constraints })
            .then(function (stream) {
                // Crear un elemento de video para mostrar la cámara
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                // Crear un canvas para capturar la foto
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // Mostrar la cámara en un cuadro de diálogo de SweetAlert2
                Swal.fire({
                    title: 'Toma una foto',
                    html: `<video id="cameraPreview" autoplay style="width: 100%;"></video>`,
                    showCancelButton: true,
                    confirmButtonText: 'Capturar',
                    cancelButtonText: 'Cancelar',
                    didOpen: () => {
                        const preview = document.getElementById('cameraPreview');
                        preview.srcObject = stream;
                    },
                    preConfirm: () => {
                        // Capturar la foto desde el video
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);

                        // Detener la transmisión de la cámara
                        stream.getTracks().forEach(track => track.stop());

                        // Preprocesar la imagen (escala de grises y umbralización)
                        preprocessImage(canvas);

                        // Convertir la imagen capturada a base64
                        const imageData = canvas.toDataURL('image/png');

                        // Cerrar el cuadro de diálogo de la cámara
                        Swal.close();

                        // Mostrar un indicador de carga mientras se procesa la imagen
                        Swal.fire({
                            title: 'Procesando imagen...',
                            text: 'Por favor, espera mientras se extrae el texto.',
                            allowOutsideClick: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        // Usar Tesseract.js para escanear el texto de la imagen
                        return Tesseract.recognize(
                            imageData,
                            'spa', // Idioma español
                            {
                                logger: m => console.log(m), // Para ver el progreso
                                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK // Modo de segmentación
                            }
                        ).then(({ data: { text } }) => {
                            // Cerrar el indicador de carga
                            Swal.close();

                            // Postprocesar el texto (corregir espacios y palabras comunes)
                            const processedText = postprocessText(text);

                            // Mostrar el texto en el campo de entrada
                            document.getElementById('textInput').value = processedText;

                            // Enfocar el campo de entrada para que el usuario pueda editar el texto
                            document.getElementById('textInput').focus();

                            // Mostrar un mensaje de éxito
                            Swal.fire({
                                icon: 'success',
                                title: 'Texto extraído',
                                text: 'El texto se ha cargado correctamente. Ahora puedes humanizarlo.',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        }).catch(error => {
                            console.error("Error al escanear el texto:", error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo escanear el texto de la imagen.',
                            });
                        });
                    }
                });
            })
            .catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo acceder a la cámara. Asegúrate de permitir el acceso a la cámara.',
                });
            });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Tu navegador no soporta la funcionalidad de cámara.',
        });
    }
}

// Función para preprocesar la imagen (escala de grises y umbralización)
function preprocessImage(canvas) {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convertir a escala de grises
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // rojo
        data[i + 1] = avg; // verde
        data[i + 2] = avg; // azul
    }

    // Aplicar umbralización
    const threshold = 128;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg > threshold ? 255 : 0;
    }

    context.putImageData(imageData, 0, 0);
}

// Función para postprocesar el texto (corregir espacios y palabras comunes)
function postprocessText(text) {
    // Eliminar espacios adicionales
    text = text.replace(/\s+/g, ' ').trim();

    // Corregir palabras comunes (ejemplo básico)
    const corrections = {
        'eh,': 'eh,',
        'rbajamos': 'trabajamos',
        'disposttivos': 'dispositivos',
        // Agrega más correcciones según sea necesario
    };

    Object.keys(corrections).forEach(key => {
        text = text.replace(new RegExp(key, 'g'), corrections[key]);
    });

    return text;
}