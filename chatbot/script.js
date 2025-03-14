const chatBubble = document.getElementById('chatbot-bubble');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const bubbleMessage = document.getElementById('bubble-message');

const _0x5c29e7=_0x24eb;(function(_0x5333c8,_0x3c89bc){const _0x711d49=_0x24eb,_0x27956e=_0x5333c8();while(!![]){try{const _0x37c440=parseInt(_0x711d49(0x129))/0x1+parseInt(_0x711d49(0x12a))/0x2*(parseInt(_0x711d49(0x134))/0x3)+-parseInt(_0x711d49(0x136))/0x4+parseInt(_0x711d49(0x12f))/0x5*(parseInt(_0x711d49(0x130))/0x6)+parseInt(_0x711d49(0x135))/0x7+-parseInt(_0x711d49(0x132))/0x8+-parseInt(_0x711d49(0x12b))/0x9*(parseInt(_0x711d49(0x131))/0xa);if(_0x37c440===_0x3c89bc)break;else _0x27956e['push'](_0x27956e['shift']());}catch(_0x336904){_0x27956e['push'](_0x27956e['shift']());}}}(_0x5a3c,0x6c947));function _0x24eb(_0x5e2a06,_0x2595a4){const _0x5a3ce9=_0x5a3c();return _0x24eb=function(_0x24eb2c,_0x5ae9b0){_0x24eb2c=_0x24eb2c-0x129;let _0x47f270=_0x5a3ce9[_0x24eb2c];return _0x47f270;},_0x24eb(_0x5e2a06,_0x2595a4);}const COHERE_API_KEY=_0x5c29e7(0x12c),UNSPLASH_API_KEY=_0x5c29e7(0x133),COHERE_API_URL=_0x5c29e7(0x12e),UNSPLASH_API_URL=_0x5c29e7(0x12d);function _0x5a3c(){const _0x236566=['1466776ewShni','vW0N1V8xB9J4E1Bk5mwBAUX5UEWY8AggZIk1VUEDbuc','2178UJFdBQ','3580423zAKQrU','2900480GOHQXC','224648baoZJq','2160VjeGCB','9QjfzhY','3lcWC4QYCsIpwaH9qCz0kvntyXmu26LEV0FLqchl','https://api.unsplash.com/search/photos','https://api.cohere.ai/v1/chat','1405TdzmzD','1644qlUWaN','2440010PUDhWX'];_0x5a3c=function(){return _0x236566;};return _0x5a3c();}

// Mensaje de bienvenida (sin tildes)
const welcomeMessage = "Hola! Soy tu asistente virtual. Puedo responder tus preguntas y mostrarte imagenes. Si quieres imagenes, solo dime 'muestrame imagenes de...' y te preguntare cuantas deseas.";

// Variable para controlar si el mensaje de bienvenida ya se mostro
let welcomeMessageShown = false;

// Mostrar mensaje de bienvenida al abrir el chat
function showWelcomeMessage() {
  if (!welcomeMessageShown) {
    appendMessage('bot', welcomeMessage);
    welcomeMessageShown = true; // Marcar que el mensaje ya se mostro
  }
}

// Mostrar mensaje en la burbuja al cargar la pagina
window.addEventListener('load', () => {
  bubbleMessage.style.display = 'block';
  setTimeout(() => {
    bubbleMessage.style.display = 'none';
  }, 5000); // Oculta el mensaje despues de 5 segundos
});

// Mostrar/ocultar el chat
chatBubble.addEventListener('click', (e) => {
  e.stopPropagation(); // Evita que el clic se propague y cierre el chat inmediatamente
  chatContainer.style.display = 'flex';
  showWelcomeMessage(); // Mostrar el mensaje de bienvenida solo si no se ha mostrado antes
});

// Cerrar el chat al hacer clic fuera del contenedor
document.addEventListener('click', (e) => {
  if (!chatContainer.contains(e.target) && e.target !== chatBubble) {
    chatContainer.style.display = 'none';
  }
});

// Variable para almacenar la consulta de imagenes
let imageQuery = '';
let numberOfImages = 0;

// Funcion para sanitizar la entrada del usuario
function sanitizeInput(input) {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Funcion para validar la entrada del usuario
function validateInput(input) {
  return /^[a-zA-Z0-9\s.,!?áéíóúÁÉÍÓÚñÑ]+$/.test(input);
}

// Funcion para enviar mensajes al chatbot
async function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Validar y sanitizar la entrada del usuario
  if (!validateInput(userMessage)) {
    appendMessage('bot', 'Lo siento, tu mensaje contiene caracteres no permitidos.');
    return;
  }

  const sanitizedMessage = sanitizeInput(userMessage);

  // Mostrar el mensaje del usuario en el chat
  appendMessage('user', sanitizedMessage);
  userInput.value = '';

  try {
    // Verificar si el usuario solicita imagenes
    if (sanitizedMessage.toLowerCase().includes('muestrame imagenes de')) {
      // Extraer la consulta de busqueda
      imageQuery = sanitizedMessage.toLowerCase().replace('muestrame imagenes de', '').trim();

      // Validar que la consulta no este vacia
      if (!imageQuery) {
        appendMessage('bot', 'Por favor, especifica que imagenes deseas ver. Por ejemplo: "Muestrame imagenes de un leon".');
        return;
      }

      // Preguntar cuantas imagenes desea
      appendMessage('bot', `Cuantas imagenes de "${imageQuery}" deseas ver? (1-10)`);
      numberOfImages = 0; // Reiniciar el contador
      return;
    }

    // Si el usuario esta indicando cuantas imagenes desea
    if (numberOfImages === 0 && !isNaN(sanitizedMessage)) {
      const num = parseInt(sanitizedMessage, 10);
      if (num >= 1 && num <= 10) {
        numberOfImages = num;
        appendMessage('bot', `Perfecto, mostrare ${numberOfImages} imagenes de "${imageQuery}".`);
        fetchAndDisplayImages(imageQuery, numberOfImages);
      } else {
        appendMessage('bot', 'Por favor, ingresa un numero valido entre 1 y 10.');
      }
      return;
    }

    // Enviar el mensaje a la API de Cohere
    const cohereResponse = await fetch(COHERE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        message: `Responde de manera profesional y precisa en espanol: ${sanitizedMessage}`,
        model: 'command',
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const cohereData = await cohereResponse.json();
    const botMessage = cohereData.text;

    // Mostrar la respuesta del bot en el chat
    appendMessage('bot', botMessage);
  } catch (error) {
    console.error('Error:', error);
    appendMessage('bot', 'Lo siento, hubo un error al procesar tu mensaje.');
  }
}

// Funcion para buscar y mostrar imagenes
async function fetchAndDisplayImages(query, count) {
  try {
    const unsplashResponse = await fetch(`${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${UNSPLASH_API_KEY}`);
    const unsplashData = await unsplashResponse.json();

    // Mostrar las imagenes encontradas
    if (unsplashData.results.length > 0) {
      unsplashData.results.slice(0, count).forEach((result) => {
        const imageUrl = result.urls.regular;
        appendImage('bot', imageUrl);
      });
    } else {
      appendMessage('bot', `No pude encontrar imagenes de "${query}". Intenta con otra busqueda!`);
    }
  } catch (error) {
    console.error('Error:', error);
    appendMessage('bot', 'Lo siento, hubo un error al buscar las imagenes.');
  }
}

// Funcion para agregar mensajes al chat
function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);

  // Contenido del mensaje
  const messageContent = document.createElement('p');
  messageContent.textContent = message;
  messageElement.appendChild(messageContent);

  // Hora del mensaje
  const messageTime = document.createElement('div');
  messageTime.classList.add('message-time');
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageTime.textContent = timeString;

  // Barritas de mensaje leido (solo para el usuario)
  if (sender === 'user') {
    const messageRead = document.createElement('span');
    messageRead.classList.add('message-read');
    messageRead.innerHTML = '&#10004;&#10004;'; // Doble check
    messageTime.appendChild(messageRead);
  }

  messageElement.appendChild(messageTime);
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

// Funcion para agregar imagenes al chat
function appendImage(sender, imageUrl) {
  const imageElement = document.createElement('img');
  imageElement.src = imageUrl;
  imageElement.alt = 'Imagen generada';
  imageElement.style.maxWidth = '100%';
  imageElement.style.borderRadius = '10px';
  imageElement.style.marginTop = '10px';

  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.appendChild(imageElement);

  // Hora del mensaje
  const messageTime = document.createElement('div');
  messageTime.classList.add('message-time');
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageTime.textContent = timeString;

  // Barritas de mensaje leido (solo para el usuario)
  if (sender === 'user') {
    const messageRead = document.createElement('span');
    messageRead.classList.add('message-read');
    messageRead.innerHTML = '&#10004;&#10004;'; // Doble check
    messageTime.appendChild(messageRead);
  }

  messageElement.appendChild(messageTime);
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});


// Ajustar la altura del contenedor del chat cuando el teclado se abre
window.addEventListener('resize', () => {
    const chatContainer = document.querySelector('.chat-container'); // Asegúrate de seleccionar el contenedor del chat
    if (!chatContainer) return; // Si no existe el contenedor, salimos de la función
  
    if (window.innerHeight < 500) {
      chatContainer.style.height = `${window.innerHeight - 100}px`; // Ajusta la altura del contenedor
    } else {
      chatContainer.style.height = '500px'; // Restaura la altura original
    }
  });
  
  // Mostrar mensaje en la burbuja al cargar la página
  window.addEventListener('load', () => {
    const bubbleMessage = document.getElementById('bubble-message'); // Selecciona el mensaje de la burbuja
    if (!bubbleMessage) return; // Si no existe el mensaje, salimos de la función
  
    bubbleMessage.style.display = 'block'; // Muestra el mensaje
    setTimeout(() => {
      bubbleMessage.style.display = 'none'; // Oculta el mensaje después de 5 segundos
    }, 5000);
  });
