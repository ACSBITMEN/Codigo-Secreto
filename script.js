// script.js

// Variables globales
let secretNumber;
let attempts = 0;
let gameWon = false;
let gameLost = false;
let timerInterval;
let remainingTime = 180; // 3 minutos en segundos
const totalTime = 180; // Tiempo total en segundos

// Elementos del DOM
const digitInputs = [
    document.getElementById('digit1'),
    document.getElementById('digit2'),
    document.getElementById('digit3')
];
const guessButton = document.getElementById('guessButton');
const resetButton = document.getElementById('resetButton');
const attemptsTableBody = document.querySelector('#tablaResultados tbody');
const winModal = document.getElementById('winModal');
const modalOkButton = document.getElementById('modalOkButton');
const timerDisplay = document.getElementById('timer');
const themeToggle = document.getElementById('themeToggle');

// Generar número secreto
function generateSecretNumber() {
    secretNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    // console.log('Número Secreto:', secretNumber); // Eliminar en producción
}

// Reiniciar el juego
function resetGame() {
    attempts = 0;
    gameWon = false;
    gameLost = false;
    remainingTime = totalTime;
    clearInterval(timerInterval);
    timerInterval = null; // Reiniciar timerInterval
    timerDisplay.textContent = `Tiempo: ${formatTime(remainingTime)}`;
    document.documentElement.style.setProperty('--timer-color', '#4caf50'); // Reset color a verde
    attemptsTableBody.innerHTML = '';
    generateSecretNumber();
    digitInputs.forEach(input => {
        input.value = '';
        input.disabled = false; // Habilitar inputs en caso de estar deshabilitados
    });
    guessButton.disabled = false; // Habilitar botón de intentar
    digitInputs[0].focus();
    hideModal();
}

// Mostrar modal con título y mensaje
function showModal(title, message) {
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    modalTitle.textContent = title;
    modalMessage.textContent = message;
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
        const red = Math.floor(255 * (1 - percentage));
        const green = Math.floor(255 * percentage);
        const color = `rgb(${red}, ${green}, 0)`;
        document.documentElement.style.setProperty('--timer-color', color);

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
        showModal('¡Felicitaciones!', 'Has adivinado el Código secreto.');
    } else {
        gameLost = true;
        showModal('¡Tiempo Agotado!', 'El tiempo para adivinar el Código secreto ha finalizado.');
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

// Iniciar el juego
generateSecretNumber();
