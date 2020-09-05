let canvas = document.getElementById("gameCanvas");
let context = canvas.getContext("2d");

const BALL_COLOR = "#e0e0e0";
const BALL_SIZE = 10;
const PADDLE_COLOR = "#e0e0e0";
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 120;
const PLAYER_PADDLE_DY = 6;
const MAX_ANGLE = Math.PI / 3; // 60 degrees

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballDX = -4;
let ballDY = 0;
let ballTop;
let ballBottom;
let opponentPaddleDY = 3;
let upIsPressed = false;
let downIsPressed = false;
let ballYTop; // stores the ball y position relative to the top of the paddle
let ballYCenter; // stores the ball y position relative to the center of the paddle
let relativeBallYCenter; // stores the ball y position relative to the center of the paddle between -1 and 1
let angle; // stores angle that the ball will bounce off of a paddle with
let maxBallSpeed = 6;
let mouseY;
let playerScore = 0;
let opponentScore = 0;

// paddles initialized opposite each other
let opponentPaddle = {name: "opponent", x: 765, y: (canvas.height - PADDLE_HEIGHT)/2};
let playerPaddle = {name: "player", x: 20, y: (canvas.height - PADDLE_HEIGHT)/2};

document.addEventListener("keydown", e => {
    if (e.keyCode === 38) {
        upIsPressed = true;
    }
    else if (e.keyCode === 40) {
        downIsPressed = true;
    }
});

document.addEventListener("keyup", e => {
    if (e.keyCode === 38) {
        upIsPressed = false;
    }
    else if (e.keyCode === 40) {
        downIsPressed = false;
    }
});

document.addEventListener("mousemove", e => {
    mouseY = e.clientY - canvas.offsetTop;
    if (mouseY > 0 && mouseY < canvas.height) {
        playerPaddle.y = mouseY - PADDLE_HEIGHT / 2;
        if (playerPaddle.y < 0) {
            playerPaddle.y = 0;
        }
        else if (playerPaddle.y > canvas.height - PADDLE_HEIGHT) {
            playerPaddle.y = canvas.height - PADDLE_HEIGHT;
        }
    }
});


/**
 * Draws the ball
 */
function drawBall() {
    context.beginPath();
    context.arc(ballX, ballY, BALL_SIZE, 0, Math.PI * 2);
    context.fillStyle = BALL_COLOR;
    context.fill();
    context.closePath();
}

/**
 * Draws a paddle
 * 
 * @param {Paddle} paddle 
 */
function drawPaddle(paddle) {
    context.beginPath();
    context.rect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.fillStyle = PADDLE_COLOR;
    context.fill();
    context.closePath();
}

/**
 * Move the opponent paddle side to side across the screen
 * Change directions to bounce off walls
 * Change directions if the paddle is moving away from the ball (optional)
 */
function moveOpponentPaddle() {
    if (opponentPaddle.y < 0 || 
        opponentPaddle.y + PADDLE_HEIGHT > canvas.height) {
        opponentPaddleDY = -opponentPaddleDY;
    }
    // optional to make the paddle chase the ball
    else if ((ballY < opponentPaddle.y && opponentPaddleDY > 0) ||
            (ballY > opponentPaddle.y + PADDLE_HEIGHT && opponentPaddleDY < 0)) {
        opponentPaddleDY = -opponentPaddleDY;
    }

    opponentPaddle.y += opponentPaddleDY;
}

/**
 * Handles collision between the ball and the walls 
 */
function handleCollision() {
    ballTop = ballY - BALL_SIZE;
    ballBottom = ballY + BALL_SIZE;

    if (ballX < 0) {
        opponentScore++;
        reposition();
        if (opponentScore === 10) {
            alert(`GAME OVER, Score:${playerScore}`);
            document.location.reload();
        }     
    }
    else if (ballX > canvas.width) {
        playerScore++;
        reposition();
    }
    // Handle collision with the walls
    else if (ballTop + ballDY < 0 || ballBottom > canvas.height) {
        ballDY = -ballDY;
    }

    // Handle collision with the player paddle on the left
    // true if left side of the ball is within the paddle
    if ((ballX - BALL_SIZE + ballDX < playerPaddle.x + PADDLE_WIDTH) && 
        (ballX - BALL_SIZE + ballDX > playerPaddle.x) &&
        (ballY < playerPaddle.y + PADDLE_HEIGHT) && 
        (ballY > playerPaddle.y)) {
        bounceBall(playerPaddle);
    }

    // Handle collision with the opponent paddle on the right
    // true if right side of the ball is within the paddle
    if ((ballX + BALL_SIZE + ballDX < opponentPaddle.x + PADDLE_WIDTH) && 
        (ballX + BALL_SIZE + ballDX > opponentPaddle.x) &&
        (ballY < opponentPaddle.y + PADDLE_HEIGHT) && 
        (ballY > opponentPaddle.y)) {
        bounceBall(opponentPaddle);
    }
}

/**
 * Repositions the ball to the center of the canvas
 */
function reposition() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballDX = -4;
    ballDY = 0;
    maxBallSpeed = 6;
}

/**
 * Changes the angle of the bounce of the ball depending on where it hits the paddle
 * 
 * @param {Paddle} paddle 
 */
function bounceBall(paddle) {
    // Changes the angle of the ball depending on where it hits
    ballYTop = ballY - paddle.y;
    ballYCenter = ballYTop - PADDLE_HEIGHT / 2;
    relativeBallYCenter = ballYCenter / (PADDLE_HEIGHT / 2);
    angle = MAX_ANGLE * relativeBallYCenter;

    // The trig keeps the speed of the ball the constant
    if (paddle.name === "player") {
        ballDY = maxBallSpeed * Math.sin(angle);
        ballDX = maxBallSpeed * Math.cos(angle); 
    }
    else if (paddle.name === "opponent") {
        ballDY = maxBallSpeed * Math.sin(angle);
        ballDX = -maxBallSpeed * Math.cos(angle);
    }

    maxBallSpeed += 1; // Speeds up the ball every hit
}

/**
 * Draws the score
 */
function drawScore() {
    context.font = "64px Courier New";
    context.textAlign = "center";
    context.fillStyle = "e0e0e0";
    context.fillText(`${playerScore}                ${opponentScore}`, canvas.width / 2, 60);
}

/**
 * Draws the game
 */
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    moveOpponentPaddle();
    drawPaddle(playerPaddle);
    drawPaddle(opponentPaddle);
    handleCollision();
    drawScore();
    requestAnimationFrame(draw);
    ballX += ballDX;
    ballY += ballDY;
    if (upIsPressed) {
        playerPaddle.y -= PLAYER_PADDLE_DY;
        if (playerPaddle.y < 0) {
            playerPaddle.y += PLAYER_PADDLE_DY;
        }
    }
    else if (downIsPressed) {
        playerPaddle.y += PLAYER_PADDLE_DY;
        if (playerPaddle.y > canvas.height - PADDLE_HEIGHT) {
            playerPaddle.y -= PLAYER_PADDLE_DY;
        }
    }
}

draw();
