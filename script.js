// Get DOM elements
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const navPromptElement = document.getElementById('nav-prompt');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const pauseButton = document.getElementById('pause-btn');

// Background canvas for effects
const bgCanvas = document.getElementById('background-canvas');
const bgCtx = bgCanvas.getContext('2d');

// Resize background canvas to fill the window
function resizeBackgroundCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    // Background animations removed for performance
}

// Initialize food particle effects only (removed background animations for performance)
function initBackgroundEffects() {
    // Only create food particle effect system for eating animations
    window.foodParticleEffect = new FoodParticleEffect(canvas, {
        particleColors: ['#ff00ff', '#ff33ff', '#ff66ff', '#ff99ff'],
        particleCount: 8,
        particleSize: { min: 2, max: 4 },
        particleLife: { min: 15, max: 30 },
        gravity: 0.05,
        fadeRate: 0.03
    });
}

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let baseSpeed = 7; // base frames per second (1x speed)
let speedMultiplier = 1; // current speed multiplier (0.2x to 3x)
let speed = baseSpeed; // current frames per second

// Game state
let gameRunning = false;
let score = 0;

// Snake initial position and velocity
let snake = [
    { x: 10, y: 10 } // Head of the snake
];
let velocityX = 0;
let velocityY = 0;

// Food initial position
let foodX = 5;
let foodY = 5;

// Get speed modal elements
const speedModal = document.getElementById('speed-modal');
const startGameBtn = document.getElementById('start-game-btn');

// Event listeners
startButton.addEventListener('click', showSpeedModal);
restartButton.addEventListener('click', resetGame);
startGameBtn.addEventListener('click', startGameWithSpeed);
pauseButton.addEventListener('click', pauseGame);

// Make navigation prompt clickable on mobile
navPromptElement.addEventListener('click', function() {
    if (window.innerWidth <= 767 && !gameRunning) {
        showSpeedModal();
    }
});

// Keyboard controls
document.addEventListener('keydown', changeDirection);

// Mobile controls
const mobileControls = document.querySelector('.mobile-controls');
const directionalPad = document.getElementById('directional-pad');

// Speed controls
const speedButtons = document.querySelectorAll('.speed-btn');

// Add event listeners for speed buttons
speedButtons.forEach(button => {
    button.addEventListener('click', handleSpeedChange);
});

function handleSpeedChange(e) {
    const newSpeedMultiplier = parseFloat(e.target.dataset.speed);
    
    // Remove active class from all buttons
    speedButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    e.target.classList.add('active');
    
    // Update speed multiplier and calculate new speed
    speedMultiplier = newSpeedMultiplier;
    speed = Math.floor(baseSpeed * speedMultiplier);
    
    // Ensure minimum speed of 1
    if (speed < 1) speed = 1;
}

function showSpeedModal() {
    speedModal.style.display = 'block';
    navPromptElement.style.display = 'none';
}

function startGameWithSpeed() {
    speedModal.style.display = 'none';
    startGame();
}

// Add touch and click event listeners for directional pad
directionalPad.addEventListener('touchstart', handleDirectionalPadTouch);
directionalPad.addEventListener('click', handleDirectionalPadClick);

function handleDirectionalPadTouch(e) {
    e.preventDefault();
    const direction = getDirectionFromTouch(e);
    if (direction) {
        highlightDirection(direction);
        handleMobileDirection(direction);
    }
}

function handleDirectionalPadClick(e) {
    e.preventDefault();
    const direction = getDirectionFromClick(e);
    if (direction) {
        highlightDirection(direction);
        handleMobileDirection(direction);
    }
}

function getDirectionFromTouch(e) {
    return getDirectionFromCoordinates(e.touches[0].clientX, e.touches[0].clientY);
}

function getDirectionFromClick(e) {
    return getDirectionFromCoordinates(e.clientX, e.clientY);
}

function getDirectionFromCoordinates(clientX, clientY) {
    const rect = directionalPad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    // Determine which quadrant the touch/click is in
    const threshold = 20; // Minimum distance from center
    
    if (Math.abs(x) < threshold && Math.abs(y) < threshold) {
        return null; // Too close to center
    }
    
    if (Math.abs(x) > Math.abs(y)) {
        // Horizontal movement
        return x > 0 ? 'right' : 'left';
    } else {
        // Vertical movement
        return y > 0 ? 'down' : 'up';
    }
}

function highlightDirection(direction) {
    // Remove all highlight classes
    directionalPad.classList.remove('highlight-up', 'highlight-down', 'highlight-left', 'highlight-right');
    
    // Add the appropriate highlight class
    directionalPad.classList.add(`highlight-${direction}`);
    
    // Remove highlight after a short delay
    setTimeout(() => {
        directionalPad.classList.remove(`highlight-${direction}`);
    }, 200);
}

// Initialize game
function init() {
    drawGame(); // Draw initial state
}

// Start or pause game
function startGame() {
    // Start the game
    gameRunning = true;
    // Hide navigation prompt when game starts
    navPromptElement.style.display = 'none';
    // Hide start button and show pause button
    startButton.style.display = 'none';
    pauseButton.classList.add('show');
    // Show mobile controls on mobile devices when game starts
    if (window.innerWidth <= 767) {
        mobileControls.classList.add('show');
    }
    gameLoop();
}

// Pause game
function pauseGame() {
    gameRunning = false;
    // Show start button and hide pause button
    startButton.style.display = 'block';
    pauseButton.classList.remove('show');
    // Show navigation prompt when game is paused
    navPromptElement.style.display = 'block';
    // Hide mobile controls when paused
    mobileControls.classList.remove('show');
}

// Reset game
function resetGame() {
    // Reset snake
    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    
    // Reset score
    score = 0;
    scoreElement.textContent = score;
    
    // Reset speed to base values
    baseSpeed = 7;
    speed = Math.floor(baseSpeed * speedMultiplier);
    if (speed < 1) speed = 1;
    
    // Reset food
    placeFood();
    
    // Hide game over screen
    gameOverElement.style.display = 'none';
    
    // Show navigation prompt
    navPromptElement.style.display = 'block';
    
    // Hide speed modal and mobile controls
    speedModal.style.display = 'none';
    mobileControls.classList.remove('show');
    
    // Background animations removed for performance
    
    // Reset game state
    gameRunning = false;
    
    // Show start button and hide pause button
    startButton.style.display = 'block';
    pauseButton.classList.remove('show');
    
    // Draw initial state
    drawGame();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    setTimeout(() => {
        clearCanvas();
        moveSnake();
        checkCollision();
        drawFood();
        drawSnake();
        
        // Continue loop if game is still running
        if (gameRunning) {
            gameLoop();
        }
    }, 1000 / speed);
}

// Clear canvas
function clearCanvas() {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add grid lines for better visibility
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
    ctx.lineWidth = 0.5;
    
    // Draw vertical grid lines
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// Move snake
function moveSnake() {
    // Create new head based on current velocity
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    
    // Add new head to beginning of snake array
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === foodX && head.y === foodY) {
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Create particle burst effect at food position
        if (window.foodParticleEffect) {
            const foodCenterX = (foodX * gridSize) + (gridSize / 2);
            const foodCenterY = (foodY * gridSize) + (gridSize / 2);
            window.foodParticleEffect.createBurst(foodCenterX, foodCenterY);
        }
        
        // Add screen shake effect
        canvas.classList.add('shake');
        setTimeout(() => {
            canvas.classList.remove('shake');
        }, 300);
        
        // Background animation effects removed for performance
        
        // Place new food
        placeFood();
        
        // Increase base speed slightly every 5 food items, but keep multiplier effect
        if (score % 50 === 0) {
            baseSpeed += 0.5;
            speed = Math.floor(baseSpeed * speedMultiplier);
            if (speed < 1) speed = 1;
        }
    } else {
        // Remove tail if snake didn't eat food
        snake.pop();
    }
}

// Draw snake
function drawSnake() {
    // Calculate pulse effect for snake glow
    const time = Date.now() * 0.001; // Convert to seconds
    const pulseFactor = Math.sin(time * 3) * 0.2 + 0.8; // Value between 0.6 and 1.0
    
    // Draw each segment of the snake
    snake.forEach((segment, index) => {
        // Draw head in a different color
        if (index === 0) {
            // Snake head with enhanced glow effect
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20 * pulseFactor;
            
            // Create gradient for head
            const headGradient = ctx.createRadialGradient(
                segment.x * gridSize + gridSize/2, 
                segment.y * gridSize + gridSize/2, 
                0, 
                segment.x * gridSize + gridSize/2, 
                segment.y * gridSize + gridSize/2, 
                gridSize/2
            );
            headGradient.addColorStop(0, '#ffffff');
            headGradient.addColorStop(0.3, '#00ffff');
            headGradient.addColorStop(1, '#0088ff');
            
            ctx.fillStyle = headGradient;
        } else {
            // Snake body with gradient based on position in snake
            const segmentPosition = Math.min(1, index / snake.length);
            const hue = 180 - segmentPosition * 60; // Cyan to blue gradient
            
            ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${0.8 * pulseFactor})`;
            ctx.shadowBlur = 15 * pulseFactor;
            
            // Create gradient for body segments
            const bodyGradient = ctx.createRadialGradient(
                segment.x * gridSize + gridSize/2, 
                segment.y * gridSize + gridSize/2, 
                0, 
                segment.x * gridSize + gridSize/2, 
                segment.y * gridSize + gridSize/2, 
                gridSize/2
            );
            bodyGradient.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.9)`);
            bodyGradient.addColorStop(0.7, `hsla(${hue}, 100%, 50%, 0.8)`);
            bodyGradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.7)`);
            
            ctx.fillStyle = bodyGradient;
        }
        
        // Draw rounded rectangle for snake segments with enhanced effects
        const segSize = gridSize - 2;
        const radius = 6; // Increased radius for more rounded corners
        const x = segment.x * gridSize + 1;
        const y = segment.y * gridSize + 1;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + segSize - radius, y);
        ctx.quadraticCurveTo(x + segSize, y, x + segSize, y + radius);
        ctx.lineTo(x + segSize, y + segSize - radius);
        ctx.quadraticCurveTo(x + segSize, y + segSize, x + segSize - radius, y + segSize);
        ctx.lineTo(x + radius, y + segSize);
        ctx.quadraticCurveTo(x, y + segSize, x, y + segSize - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        
        // Add inner highlight for 3D effect
        if (index === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(x + segSize/3, y + segSize/3, radius/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Reset shadow for other drawings
    ctx.shadowBlur = 0;
}

// Draw food
function drawFood() {
    // Calculate pulse effect for food glow
    const time = Date.now() * 0.001; // Convert to seconds
    const pulseFactor = Math.sin(time * 4) * 0.3 + 0.7; // Value between 0.4 and 1.0
    
    // Food with enhanced glow effect
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 20 * pulseFactor;
    
    // Draw food as a glowing orb
    const centerX = (foodX * gridSize) + (gridSize / 2);
    const centerY = (foodY * gridSize) + (gridSize / 2);
    const radius = (gridSize / 2 - 2) * (0.9 + pulseFactor * 0.1); // Pulsing size
    
    // Create gradient for food
    const foodGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
    );
    foodGradient.addColorStop(0, '#ffffff');
    foodGradient.addColorStop(0.3, '#ff88ff');
    foodGradient.addColorStop(0.7, '#ff00ff');
    foodGradient.addColorStop(1, '#880088');
    
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a highlight to make it look more 3D
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX - radius/3, centerY - radius/3, radius/2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Add outer glow ring
    ctx.strokeStyle = 'rgba(255, 0, 255, ' + (0.3 * pulseFactor) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    
    // Update food particle effect if it exists
    if (window.foodParticleEffect) {
        window.foodParticleEffect.update();
    }
    
    // Reset shadow for other drawings
    ctx.shadowBlur = 0;
}

// Place food at random position
function placeFood() {
    // Generate random coordinates
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    
    // Check if food is placed on snake
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
            // If food is on snake, try again
            placeFood();
            return;
        }
    }
}

// Handle mobile direction input
function handleMobileDirection(direction) {
    // If game is not running, start the game
    if (!gameRunning) {
        startGame();
    }
    
    // Prevent reverse direction (snake can't go in reverse)
    const goingUp = velocityY === -1;
    const goingDown = velocityY === 1;
    const goingLeft = velocityX === -1;
    const goingRight = velocityX === 1;
    
    // Change direction based on mobile button press
    switch (direction) {
        case 'up':
            if (!goingDown) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'down':
            if (!goingUp) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'left':
            if (!goingRight) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'right':
            if (!goingLeft) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
    }
}

// Change snake direction based on key press
function changeDirection(event) {
    // If game is not running and arrow key is pressed, start the game
    if (!gameRunning && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
                         event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        startGame();
    }
    
    // Prevent reverse direction (snake can't go in reverse)
    const goingUp = velocityY === -1;
    const goingDown = velocityY === 1;
    const goingLeft = velocityX === -1;
    const goingRight = velocityX === 1;
    
    // Change direction based on key press
    switch (event.key) {
        case 'ArrowUp':
            if (!goingDown) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'ArrowDown':
            if (!goingUp) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'ArrowLeft':
            if (!goingRight) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'ArrowRight':
            if (!goingLeft) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
    }
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision (starting from 4th segment)
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
    // Hide navigation prompt during game over screen
    navPromptElement.style.display = 'none';
    // Hide mobile controls and speed modal during game over
    mobileControls.classList.remove('show');
    speedModal.style.display = 'none';
    
    // Show start button and hide pause button
    startButton.style.display = 'block';
    pauseButton.classList.remove('show');
}

// Draw game
function drawGame() {
    clearCanvas();
    drawSnake();
    drawFood();
}

// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the game
    init();
    // Initialize background effects
    initBackgroundEffects();
    // Place initial food
    placeFood();
});