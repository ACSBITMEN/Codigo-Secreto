// Variables globales
let secretNumber;
let attempts = 0;
let gameWon = false;
let timerInterval;
let startTime;
let timerStarted = false;

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

// Generar número secreto
function generateSecretNumber() {
    secretNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    console.log('Número Secreto:', secretNumber);
}

// Reiniciar el juego
function resetGame() {
    attempts = 0;
    gameWon = false;
    timerStarted = false;
    clearInterval(timerInterval);
    timerDisplay.textContent = 'Tiempo: 00:00';
    attemptsTableBody.innerHTML = '';
    generateSecretNumber();
    digitInputs.forEach(input => input.value = '');
    digitInputs[0].focus();
    hideModal();
}

// Mostrar modal
function showModal() {
    winModal.style.display = 'block';
}

// Ocultar modal
function hideModal() {
    winModal.style.display = 'none';
}

// Resaltar intentos después de ganar
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

// Actualizar el contador de tiempo
function updateTimer() {
    const now = new Date();
    const elapsedTime = Math.floor((now - startTime) / 1000); // en segundos
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `Tiempo: ${minutes}:${seconds}`;
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
    if (gameWon) return;

    let guessDigits = digitInputs.map(input => input.value);

    // Validar que todos los campos estén llenos y sean dígitos
    if (guessDigits.some(digit => !/^\d$/.test(digit))) {
        alert('Por favor, ingresa un dígito numérico en cada casilla.');
        return;
    }

    // Iniciar el contador de tiempo en el primer intento
    if (!timerStarted) {
        timerStarted = true;
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }

    let guess = guessDigits.join('');

    attempts++;
    let correctPosition = 0;
    let correctDigit = 0;

    const secretDigits = secretNumber.split('');
    const guessDigitsCopy = guessDigits.slice();
    const secretDigitsCopy = secretDigits.slice();

    // Comprobar dígitos en la posición correcta
    for (let i = 0; i < 3; i++) {
        if (guessDigits[i] === secretDigits[i]) {
            correctPosition++;
            secretDigitsCopy[i] = null;
            guessDigitsCopy[i] = null;
        }
    }

    // Comprobar dígitos correctos en posición incorrecta
    for (let i = 0; i < 3; i++) {
        if (guessDigitsCopy[i] !== null) {
            let index = secretDigitsCopy.indexOf(guessDigitsCopy[i]);
            if (index !== -1) {
                correctDigit++;
                secretDigitsCopy[index] = null;
                guessDigitsCopy[i] = null;
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
    correctPositionCell.classList.add('correct-position');
    row.appendChild(correctPositionCell);

    const correctDigitCell = document.createElement('td');
    correctDigitCell.textContent = correctDigit;
    correctDigitCell.classList.add('wrong-position');
    row.appendChild(correctDigitCell);

    attemptsTableBody.appendChild(row);

    // Comprobar condición de victoria
    if (correctPosition === 3) {
        gameWon = true;
        clearInterval(timerInterval); // Detener el contador de tiempo
        showModal();
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

// Iniciar el juego
generateSecretNumber();
