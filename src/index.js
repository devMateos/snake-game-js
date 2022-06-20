const STATE_RUNNING = 1; // Juego corriendo
const STATE_LOSING = 2; // Perdiendo

const SPEED = 100; // Intervalo de tiempo entre los desplazamientos del gusano (en milisegundos)
const SQUARE_SIZE = 10; // Tamaño de los cuadros que se van a dibujar sobre el área de juego

// Ancho y alto virtual de nuestro espacio de juego
const BOARD_WIDTH = 60;
const BOARD_HEIGHT = 60;

const GROW_SCALE = 1; // Cuánto crecerá el gusano cada vez que coma
const DIRECTIONS_MAP = { // Cambia la dirección hacia la que se mueve el gusano. El primer elemento es el desplazamiento que hará en el eje X y el segundo el desplazamiento que hará en el eje Y
    A: [-1, 0],
    D: [1, 0],
    S: [0, 1],
    W: [0, -1],
    a: [-1, 0],
    d: [1, 0],
    s: [0, 1],
    w: [0, -1]
};

// Variables de la lógica del juego
let state = {
    canvas: null,
    context: null,
    worm: [{ x: 0, y: 0 }],
    direction: { x: 1, y: 0 },
    food: { x: 0, y: 0 },
    growing: 0,
    runState: STATE_RUNNING
};

//función para generar posiciones aleatorias
function randomXY() {
    return {
        x: parseInt(Math.random() * BOARD_WIDTH),
        y: parseInt(Math.random() * BOARD_HEIGHT)
    };
}

//
function tick() {
    const head = state.worm[0];
    const dx = state.direction.x;
    const dy = state.direction.y;
    const highestIndex = state.worm.length - 1;
    let tail = {};
    let interval = SPEED;

    Object.assign(tail, state.worm[state.worm.length - 1]);

    let didScore = (head.x === state.food.x && head.y === state.food.y);

    if (state.runState === STATE_RUNNING) {
        for (let i = highestIndex; i > -1; i--) {
            const sq = state.worm[i];

            if (i === 0) {
                sq.x += dx;
                sq.y += dy;
            } else {
                sq.x = state.worm[i - 1].x;
                sq.y = state.worm[i - 1].y;
            }
        }
    } else if (state.runState === STATE_LOSING) {
        interval = 10;

        if (state.worm.length > 0) {
            state.worm.splice(0, 1);
        }

        if (state.worm.length === 0) {
            state.runState = STATE_RUNNING;
            state.worm.push(randomXY());
            state.food = randomXY();
        }
    }

    if (detectCollision()) {
        state.runState = STATE_LOSING;
        state.growing = 0;
    }

    if (didScore) {
        state.growing += GROW_SCALE;
        state.food = randomXY();
    }

    if (state.growing > 0) {
        state.worm.push(tail);
        state.growing -= 1;
    }

    requestAnimationFrame(draw);
    setTimeout(tick, interval);
}

function detectCollision() {
    const head = state.worm[0];

    if (head.x < 0
        || head.x >= BOARD_WIDTH
        || head.y >= BOARD_HEIGHT
        || head.y < 0
    ) {
        return true;
    }

    for (var idx = 1; idx < state.worm.length; idx++) {
        const sq = state.worm[idx];

        if (sq.x === head.x && sq.y === head.y) {
            return true;
        }
    }

    return false;
}

// Función que dibuja cada uno de los cuadritos que componen el gusano o la comida
function drawPixel(color, x, y) {
    state.context.fillStyle = color;
    state.context.fillRect(
        x * SQUARE_SIZE,
        y * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
    );
}
// Función principal de dibujado
function draw() {
    state.context.clearRect(0, 0, 600, 600);    //Borramos el contexto
    // Recorrido por cada uno de los puntos que abarca la variable worm
    for (var i = 0; i < state.worm.length; i++) {
        const { x, y } = state.worm[i];
        drawPixel("#F79F71", x, y);
    }
    // Función para dibujar la comida
    const { x, y } = state.food;
    drawPixel("yellow", x, y);
}

//Inicializando los valores necesarios
window.onload = function () {
    state.canvas = document.querySelector("canvas");    //Inicialización del evento canvas
    state.context = state.canvas.getContext("2d");      //Inicialización del contexto de dibujo
    //Mecanismo de presión de teclas
    window.onkeydown = function (e) {
        const direction = DIRECTIONS_MAP[e.key];
        //Validando si la dirección de la tecla existe de acuerdo a la tecla
        if (direction) {
            const [x, y] = direction;
            //Comprobación de que la tecla pulsada no es la dirección a la que el gusano se está desplazando actualmente
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }

    tick();
};
