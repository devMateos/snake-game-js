const STATE_RUNNING = 1; // Juego corriendo
const STATE_LOSING = 2; // Perdiendo

const TICK = 80; // Intervalo de tiempo entre los desplazamientos del gusano (en milisegundos)
const SQUARE_SIZE = 10; // Tamaño de los cuadros que se van a dibujar sobre el área de juego

// Ancho y alto virtual de nuestro espacio de juego
const BOARD_WIDTH = 60;
const BOARD_HEIGHT = 60;
const GROW_SCALE = 1; // Cuánto crecerá el gusano
const DIRECTIONS_MAP = { // Cambia la dirección hacia la que se mueve el gusano
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
    prey: { x: 0, y: 0 },
    growing: 0,
    runState: STATE_RUNNING
};

function randomXY() {
    return {
        x: parseInt(Math.random() * BOARD_WIDTH),
        y: parseInt(Math.random() * BOARD_HEIGHT)
    };
}

function tick() {
    const head = state.worm[0];
    const dx = state.direction.x;
    const dy = state.direction.y;
    const highestIndex = state.worm.length - 1;
    let tail = {};
    let interval = TICK;

    Object.assign(tail, state.worm[state.worm.length - 1]);

    let didScore = (head.x === state.prey.x && head.y === state.prey.y);

    if (state.runState === STATE_RUNNING) {
        for (let idx = highestIndex; idx > -1; idx--) {
            const sq = state.worm[idx];

            if (idx === 0) {
                sq.x += dx;
                sq.y += dy;
            } else {
                sq.x = state.worm[idx - 1].x;
                sq.y = state.worm[idx - 1].y;
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
            state.prey = randomXY();
        }
    }

    if (detectCollision()) {
        state.runState = STATE_LOSING;
        state.growing = 0;
    }

    if (didScore) {
        state.growing += GROW_SCALE;
        state.prey = randomXY();
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

// Función que dibuja cada uno de los cuadritos que componen el gusano
function drawPixel(color, x, y) {
    state.context.fillStyle = color;
    state.context.fillRect(
        x * SQUARE_SIZE,
        y * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
    );
}

function draw() {
    state.context.clearRect(0, 0, 600, 600);

    for (var idx = 0; idx < state.worm.length; idx++) {
        const { x, y } = state.worm[idx];
        drawPixel("#F79F71", x, y);
    }

    const { x, y } = state.prey;
    drawPixel("yellow", x, y);
}

window.onload = function () {
    state.canvas = document.querySelector("canvas");
    state.context = state.canvas.getContext("2d");

    window.onkeydown = function (e) {
        const direction = DIRECTIONS_MAP[e.key];

        if (direction) {
            const [x, y] = direction;
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }

    tick();
};
