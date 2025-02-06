const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Wczytanie obrazków
const bird = new Image();
const bg = new Image();
const pipeUp = new Image();
const pipeDown = new Image();
const grass = new Image();

bird.src = "https://mrozkar2137.github.io/wielkiecyce/images/emo8.png";
bg.src = "https://mrozkar2137.github.io/wielkiecyce/images/bg.png";
pipeUp.src = "https://mrozkar2137.github.io/wielkiecyce/images/pipeup.png";
pipeDown.src = "https://mrozkar2137.github.io/wielkiecyce/images/pipedown.png";
grass.src = "https://mrozkar2137.github.io/wielkiecyce/images/grass.png";

// Pozycja ptaka
let birdX = 50;
let birdY = 150;
let velocity = 0;
const gravity = 0.3;
const jump = -6;

// Rury
let pipes = [];
const pipeSpeed = 1.5;
const gap = 107;
const pipeSpacing = 200;

// Licznik punktów
let score = 0;
let gameStarted = false; // Flaga, czy gra się rozpoczęła

function addPipe() {
    let minPipeY = -80;
    let maxPipeY = -50;
    let pipeY = Math.floor(Math.random() * (maxPipeY - minPipeY + 1)) + minPipeY;
    pipes.push({ x: canvas.width, y: pipeY, passed: false });
}

function resetGame() {
    console.log("Reset gry! Wynik: " + score);

    // Losowanie dźwięku od 1 do 5
    let randomSoundIndex = Math.floor(Math.random() * 5) + 1;
    let deathSound = new Audio(`https://mrozkar2137.github.io/wielkiecyce/sounds/death${randomSoundIndex}.mp3`);
    
    // Odtworzenie losowego dźwięku przegranej
    deathSound.play();

    // Resetowanie gry
    birdY = 150;
    velocity = 0;
    score = 0;
    pipes = [];
    gameStarted = false; // Zatrzymujemy grę
    drawStartScreen(); // Rysujemy ekran startowy
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Punkty: " + score, 10, 30);
}

function checkCollision() {
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];

        // Sprawdzenie kolizji z rurami
        if (
            birdX + bird.width > pipe.x &&
            birdX < pipe.x + pipeUp.width &&
            (birdY < pipe.y + pipeUp.height || birdY + bird.height > pipe.y + pipeUp.height + gap)
        ) {
            console.log("Kolizja z rurą!");
            resetGame();
            return;
        }

        // Sprawdzenie, czy ptak minął rurę i przyznanie punktu
        if (pipe.x + pipeUp.width < birdX && !pipe.passed) {
            score++;
            pipe.passed = true;
            console.log("Punkty: ", score);
        }
    }

    // Kolizja z trawą
    if (birdY + bird.height >= canvas.height - grass.height) {
        console.log("Kolizja z ziemią!");
        resetGame();
    }
}

let lastTime = 0;
const fps = 60;
const frameTime = 1000 / fps;

function draw(currentTime) {
    if (!gameStarted) return; // Jeśli gra się nie zaczęła, nie rysujemy klatek

    if (currentTime - lastTime < frameTime) {
        requestAnimationFrame(draw);
        return;
    }
    lastTime = currentTime;

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pipes.length; i++) {
        ctx.drawImage(pipeUp, pipes[i].x, pipes[i].y);
        ctx.drawImage(pipeDown, pipes[i].x, pipes[i].y + pipeUp.height + gap);
        pipes[i].x -= pipeSpeed;

        if (pipes[i].x + pipeUp.width < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeSpacing) {
        addPipe();
    }

    ctx.drawImage(grass, 0, canvas.height - grass.height);
    ctx.drawImage(bird, birdX, birdY);

    velocity += gravity;
    birdY += velocity;

    checkCollision();
    drawScore();
    requestAnimationFrame(draw);
}

// Ekran startowy
function drawStartScreen() {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(grass, 0, canvas.height - grass.height);

    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Kliknij, aby zacząć!", canvas.width / 2 - 120, canvas.height / 2);
}

// Rozpoczęcie gry po kliknięciu lub naciśnięciu klawisza
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        pipes = []; // Resetujemy rury
        for (let i = 0; i < 3; i++) {
            pipes.push({ x: canvas.width + i * pipeSpacing, y: Math.floor(Math.random() * 150) - 150, passed: false });
        }
        draw(0);
    }
    velocity = jump; // Skok przy starcie
}

document.addEventListener("keydown", startGame);
document.addEventListener("mousedown", startGame);

drawStartScreen(); // Wyświetlamy ekran startowy
