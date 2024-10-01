// script.js

// Variables globales
let secretNumber;
let attempts = 0;
let gameWon = false;
let gameLost = false;
let timerInterval;
let remainingTime = 60; // 1 minutos en segundos
const totalTime = 60; // Tiempo total en segundos (1 minuto)

// Elementos del DOM
const themeToggle = document.getElementById('themeToggle'); // Boton del tema
const timerDisplay = document.getElementById('timer'); // Boton del tema
const digitInputs = [
    document.getElementById('digit1'), // Primer digito
    document.getElementById('digit2'), // Primer digito
    document.getElementById('digit3') // Primer digito
];
const guessButton = document.getElementById('guessButton'); // Boton Intento
const resetButton = document.getElementById('resetButton'); // Boton Reiniciar Juego
const attemptsTableBody = document.querySelector('#tablaResultados tbody'); // Tabla de resultados
const winModal = document.getElementById('winModal'); // Modal
const modalOkButton = document.getElementById('modalOkButton'); // Boton del modal

// Funcion para generar Número Secreto
function generateSecretNumber() {
    secretNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

// Evento al hacer clic en "Intentar"
guessButton.addEventListener('click', () => {
    if (gameWon || gameLost) return;

    let guessDigits = digitInputs.map(input => input.value);

    // Validar que todos los campos estén llenos y sean dígitos
    if (guessDigits.some(digit => !/^\d$/.test(digit))) {
        alert('Por favor, ingresa un dígito numérico en cada casilla.');
        return;
    }

    // Iniciar el contador de tiempo en el primer intento
    if (!timerInterval) {
        timerInterval = setInterval(updateTimer, 1000);
    }

    let guess = guessDigits.join('');

    attempts++;
    let correctPosition = 0;
    let correctDigit = 0;

    const secretDigits = secretNumber.split('');
    const guessDigitsCopy = guessDigits.slice();
    const secretDigitsCopy = secretDigits.slice();

    // Comprobar dígitos en la posición correcta y marcarlos
    for (let i = 0; i < 3; i++) {
        if (guessDigits[i] === secretDigits[i]) {
            correctPosition++;
            secretDigitsCopy[i] = null;
        }
    }

    // Comprobar dígitos correctos en posición incorrecta
    for (let i = 0; i < 3; i++) {
        if (guessDigits[i] !== secretDigits[i]) {
            for (let j = 0; j < 3; j++) {
                if (secretDigitsCopy[j] !== null && guessDigits[i] === secretDigits[j]) {
                    correctDigit++;
                    secretDigitsCopy[j] = null;
                    break;
                }
            }
        }
    }

    // Actualizar la tabla de intentos
    const row = document.createElement('tr');

    const attemptCell = document.createElement('td');
    attemptCell.textContent = attempts;
    row.appendChild(attemptCell);

    const proposedNumberCell = document.createElement('td');
    proposedNumberCell.classList.add('proposed-number');

    // Añadir dígitos individuales para resaltar después
    guessDigits.forEach(digit => {
        const digitSpan = document.createElement('span');
        digitSpan.textContent = digit;
        digitSpan.classList.add('digit-cell');
        proposedNumberCell.appendChild(digitSpan);
    });
    row.appendChild(proposedNumberCell);

    const correctPositionCell = document.createElement('td');
    correctPositionCell.textContent = correctPosition;
    if (correctPosition !== 0) {
        correctPositionCell.classList.add('correct-position');
    }
    row.appendChild(correctPositionCell);

    const correctDigitCell = document.createElement('td');
    correctDigitCell.textContent = correctDigit;
    if (correctDigit !== 0) {
        correctDigitCell.classList.add('wrong-position');
    }
    row.appendChild(correctDigitCell);

    attemptsTableBody.appendChild(row);

    // Comprobar condición de victoria
    if (correctPosition === 3) {
        clearInterval(timerInterval); // Detener el contador de tiempo
        endGame(true);
    }

    // Limpiar las entradas y enfocar el primer dígito
    digitInputs.forEach(input => input.value = '');
    digitInputs[0].focus();
});

// Funcion para Reiniciar el juego
function resetGame() {
     // Reiniciar el número de intentos y los estados
    attempts = 0;
    gameWon = false;
    gameLost = false;
    remainingTime = totalTime; // Restablecer el tiempo restante al tiempo total permitido (60 segundos)
    clearInterval(timerInterval); // Detener el temporizador actual si está en ejecución
    timerInterval = null; // Reiniciar el tiempo del temporizador
    timerDisplay.textContent = `Tiempo: ${formatTime(remainingTime)}`;

    // Restablecer del temporizador
    const targetElement = document.body.classList.contains('light-mode') ? document.body : document.documentElement;
     // Asignar el color inicial del temporizador en curso (verde) en ambos modos, claro u oscuro
    const initialTimerColor = document.body.classList.contains('light-mode') ? '#4caf50' : '#4caf50';
    // Aplicar el color inicial al temporizador utilizando la variable CSS --timer-color
    targetElement.style.setProperty('--timer-color', initialTimerColor);

    // Limpiar la tabla de resultados (historial de intentos)
    attemptsTableBody.innerHTML = '';
    
    generateSecretNumber(); // Generar un nuevo número secreto para el nuevo juego
    
    // Limpiar los campos de entrada y habilitarlos para el nuevo intento
    digitInputs.forEach(input => {
        input.value = ''; // Limpiar el valor del input
        input.disabled = false; // Habilitar inputs en caso de estar deshabilitados
    });
    guessButton.disabled = false; // Habilitar el botón de "Intentar" para que el jugador pueda ingresar un nuevo intento
    digitInputs[0].focus(); // Colocar el enfoque en el primer campo de entrada Input para facilitar la interacción
    hideModal(); // Ocultar el modal (por si estaba visible debido a una victoria o derrota)
}


// Mostrar modal con título y mensaje
function showModal(title, message) {
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    winModal.style.display = 'block';
    // Remover clases anteriores
    winModal.classList.remove('modal-win', 'modal-lose');
    // Agregar clase según el resultado
    if (isWin) {
        winModal.classList.add('modal-win');
    } else {
        winModal.classList.add('modal-lose');
    }
    winModal.style.display = 'block';
    modalOkButton.focus();
}

// Ocultar modal
function hideModal() {
    winModal.style.display = 'none';
}


// Resaltar intentos después de ganar o perder
function highlightAttempts() {
    const rows = attemptsTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const proposedNumber = row.querySelector('.proposed-number').textContent;
        const digits = proposedNumber.split('');
        const cells = row.querySelectorAll('.digit-cell');

        digits.forEach((digit, index) => {
            if (digit === secretNumber[index]) {
                cells[index].classList.add('correct-position');
            } else if (secretNumber.includes(digit)) {
                cells[index].classList.add('wrong-position');
            }
        });
    });
}


// Formatear tiempo en mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}
// Actualizar el contador de tiempo
function updateTimer() {
    if (remainingTime > 0) {
        remainingTime--;
        timerDisplay.textContent = `Tiempo: ${formatTime(remainingTime)}`;

        // Calcular color del temporizador basado en el tiempo restante
        const percentage = remainingTime / totalTime;
        let color;

        if (percentage > 0.66) {
            // Verde a Amarillo
            const green = Math.floor(255 * percentage);
            const red = Math.floor(255 * (1 - percentage));
            color = `rgb(${red}, ${green}, 0)`;
        } else if (percentage > 0.33) {
            // Amarillo a Rojo
            const red = 255;
            const green = Math.floor(255 * (percentage - 0.33) / 0.33);
            color = `rgb(${red}, ${green}, 0)`;
        } else {
            // Rojo
            color = `rgb(255, 0, 0)`;
        }

        // Determinar el elemento correcto para actualizar la variable
        const targetElement = document.body.classList.contains('light-mode') ? document.body : document.documentElement;
        targetElement.style.setProperty('--timer-color', color);

        if (remainingTime === 0) {
            // Tiempo agotado
            gameLost = true;
            clearInterval(timerInterval);
            endGame(false);
        }
    }
}

// Finalizar el juego, pasando true para victoria y false para derrota
function endGame(victory) {
    if (victory) {
        gameWon = true;
        showModal('¡En hora buena!', 'Has adivinado el Código secreto.', true);
    } else {
        gameLost = true;
        showModal('¡JajAjAJjJA!', 'No haz logrado adivinar El Código Secreto, buena suerte para la proxima.', false);
    }
    // Deshabilitar entradas y botón de intentar
    digitInputs.forEach(input => input.disabled = true);
    guessButton.disabled = true;
}

// Mover el foco automáticamente
digitInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = value;

        if (value.length === 1 && index < digitInputs.length - 1) {
            digitInputs[index + 1].focus();
        }

        // Evitar más de un carácter
        if (value.length > 1) {
            e.target.value = value.charAt(0);
        }
    });
});

// Permitir navegación con teclas de dirección
digitInputs.forEach((input, index) => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '' && index > 0) {
            digitInputs[index - 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            digitInputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < digitInputs.length - 1) {
            digitInputs[index + 1].focus();
        }
    });
});

// Evento al hacer clic en "OK" del modal
modalOkButton.addEventListener('click', () => {
    hideModal();
    highlightAttempts();
});

// Evento para reiniciar el juego
resetButton.addEventListener('click', resetGame);

// Cerrar el modal al hacer clic fuera de él
window.addEventListener('click', (event) => {
    if (event.target === winModal) {
        hideModal();
        highlightAttempts();
    }
});

// Funcionalidad para alternar Dark/Light Mode
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    // Cambiar el icono del botón
    if (document.body.classList.contains('light-mode')) {
        themeToggle.textContent = '🌙'; // Icono de luna para modo Light
    } else {
        themeToggle.textContent = '🌓'; // Icono de luna creciente para modo Dark
    }
    // Guardar preferencia en localStorage
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }

    // Al cambiar el tema, restablecer --timer-color al color inicial del nuevo tema
    const targetElement = document.body.classList.contains('light-mode') ? document.body : document.documentElement;
    const initialTimerColor = document.body.classList.contains('light-mode') ? '#4caf50' : '#4caf50'; // Ambos modos inician en verde
}

// Evento al hacer clic en el botón de alternancia
themeToggle.addEventListener('click', toggleTheme);

// Cargar el tema preferido al iniciar
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
    } else {
        document.body.classList.remove('light-mode');
        themeToggle.textContent = '🌓';
    }
    // Inicializar el temporizador en resetGame
    resetGame();
});


// Actualizar estilos del modal al cambiar de tema
function updateModalTheme() {
    if (winModal.style.display === 'block') {
    // Forzar reflujo para aplicar los nuevos estilos
        winModal.style.display = 'none';
        void winModal.offsetWidth; // Truco para reiniciar el estilo
        winModal.style.display = 'block';
    }
}

// Llama a updateModalTheme cuando cambie el tema
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    themeToggle.textContent = document.body.classList.contains('light-mode') ? '🌙' : '🌓';
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    // Actualizar el tema del modal si está abierto
    updateModalTheme();
}


// Iniciar el juego
generateSecretNumber();
