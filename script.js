// DOM elements
const cannonElement = document.getElementById('cannon');
const clownElement = document.getElementById('clown');
const mattressElement = document.getElementById('mattress');
const windIndicatorElement = document.getElementById('wind-indicator');
const feedbackElement = document.getElementById('feedback');
const statsElement = document.getElementById('stats');

// Input elements
const angleInput = document.getElementById('angle');
const powerInput = document.getElementById('power');
const windInput = document.getElementById('wind');
const massInput = document.getElementById('mass');
const gravitySelect = document.getElementById('gravity');
const fireButton = document.getElementById('fire');

// Display elements
const angleValueElement = document.getElementById('angle-value');
const powerValueElement = document.getElementById('power-value');
const windValueElement = document.getElementById('wind-value');
const massValueElement = document.getElementById('mass-value');

// Game parameters
let angle = 45;
let power = 50;
let wind = 0;
let mass = 10;
let gravity = 9.8;
let isAnimating = false;

// Animation variables
let animationId = null;
let startTime = 0;
let clownPosition = { x: 0, y: 0 };
let initialVelocity = { x: 0, y: 0 };

// Update input displays
angleInput.addEventListener('input', () => {
    angle = parseInt(angleInput.value);
    angleValueElement.textContent = angle;
    updateCannonRotation();
});

powerInput.addEventListener('input', () => {
    power = parseInt(powerInput.value);
    powerValueElement.textContent = power;
});

windInput.addEventListener('input', () => {
    wind = parseInt(windInput.value);
    windValueElement.textContent = wind;
    updateWindIndicator();
});

massInput.addEventListener('input', () => {
    mass = parseInt(massInput.value);
    massValueElement.textContent = mass;
});

gravitySelect.addEventListener('change', () => {
    gravity = parseFloat(gravitySelect.value);
});

// Fire the cannon
fireButton.addEventListener('click', () => {
    if (isAnimating) return;
    
    // Reset clown position
    clownElement.style.display = 'block';
    
    // Calculate initial velocity components
    const angleInRadians = angle * Math.PI / 180;
    const velocityMagnitude = power * 1.2; // Increased power multiplier from 0.5 to 1.2
    
    initialVelocity = {
        x: velocityMagnitude * Math.cos(angleInRadians),
        y: velocityMagnitude * Math.sin(angleInRadians)
    };
    
    // Set starting position at the end of cannon
    const cannonLength = 80;
    const cannonEndX = 50 + cannonLength * Math.cos(angleInRadians);
    const cannonEndY = 50 + cannonLength * Math.sin(angleInRadians);
    
    clownPosition = {
        x: cannonEndX,
        y: cannonEndY
    };
    
    // Cannon firing effect
    const cannonElement = document.getElementById('cannon');
    cannonElement.style.transform = `rotate(${angle}deg) translateX(5px)`;
    
    // Show cannon fire
    cannonElement.classList.add('firing');
    
    // Add firing effect
    cannonElement.style.setProperty('--cannon-recoil', '5px');
    
    // Reset cannon position after recoil
    setTimeout(() => {
        cannonElement.style.transform = `rotate(${angle}deg)`;
        cannonElement.style.setProperty('--cannon-recoil', '0px');
        cannonElement.classList.remove('firing');
    }, 200);
    
    // Update clown position
    updateClownPosition();
    
    // Start animation
    isAnimating = true;
    startTime = Date.now();
    animationId = requestAnimationFrame(animateClown);
    
    // Clear feedback and stats
    feedbackElement.innerHTML = '<p>Clown launched!</p>';
    feedbackElement.className = 'feedback';
    statsElement.innerHTML = '';
});

// Update cannon rotation based on angle
function updateCannonRotation() {
    cannonElement.style.transform = `rotate(${angle}deg)`;
}

// Update wind indicator
function updateWindIndicator() {
    const rotation = wind < 0 ? 180 : 0; // Flip the arrow if wind is negative
    const opacity = Math.abs(wind) / 10; // Scale opacity with wind strength
    
    windIndicatorElement.style.transform = `rotate(${rotation}deg)`;
    windIndicatorElement.style.opacity = 0.2 + opacity * 0.8; // Minimum opacity of 0.2
    
    // Scale the size of the arrow based on wind strength
    const scale = 0.5 + Math.abs(wind) / 10;
    windIndicatorElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;
}

// Update clown position on screen
function updateClownPosition() {
    // Convert position to screen coordinates
    const screenX = clownPosition.x;
    const screenY = 400 - 50 - clownPosition.y - 15; // Adjust for ground height and clown size
    
    clownElement.style.left = `${screenX}px`;
    clownElement.style.bottom = `${50 + clownPosition.y}px`;
}

// Animate the clown's trajectory
function animateClown() {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000; // seconds
    
    // Use a time scale factor to make the animation faster
    const timeScale = 1.8; // Increased from default 1.0 to 1.8
    const scaledTime = elapsedTime * timeScale;
    
    // Calculate position using projectile motion equations with wind
    const windEffect = (wind * scaledTime) / mass; // Wind effect reduced by mass
    
    clownPosition = {
        x: initialVelocity.x * scaledTime + windEffect + 80, // Add starting position offset
        y: initialVelocity.y * scaledTime - 0.5 * gravity * scaledTime * scaledTime + 15 // Add starting height offset
    };
    
    updateClownPosition();
    
    // Check if clown has hit the ground
    if (clownPosition.y <= 0) {
        endAnimation();
        checkLanding();
        return;
    }
    
    // Continue animation
    animationId = requestAnimationFrame(animateClown);
}

// End the animation
function endAnimation() {
    isAnimating = false;
    cancelAnimationFrame(animationId);
    
    // Ensure clown is on the ground
    clownPosition.y = 0;
    updateClownPosition();
}

// Check if the clown landed on the mattress
function checkLanding() {
    // Get mattress position and dimensions
    const mattressRect = mattressElement.getBoundingClientRect();
    const clownRect = clownElement.getBoundingClientRect();
    
    // Calculate horizontal distance traveled
    const distanceTraveled = clownPosition.x;
    
    // Calculate if clown landed on mattress
    const landedOnMattress = 
        clownRect.right >= mattressRect.left && 
        clownRect.left <= mattressRect.right;
    
    // Display result feedback
    if (landedOnMattress) {
        feedbackElement.innerHTML = '<p>Success! The clown landed safely on the mattress!</p>';
        feedbackElement.className = 'feedback success';
    } else {
        feedbackElement.innerHTML = '<p>Oops! The clown missed the mattress.</p>';
        feedbackElement.className = 'feedback failure';
    }
    
    // Display stats
    statsElement.innerHTML = `
        <h3>Flight Statistics:</h3>
        <p>Distance traveled: ${distanceTraveled.toFixed(2)} meters</p>
        <p>Max height reached: ${calculateMaxHeight().toFixed(2)} meters</p>
    `;
}

// Calculate maximum height reached by the clown
function calculateMaxHeight() {
    // Using the formula: max height = (v0y)²/(2g)
    const initialVelocityY = initialVelocity.y;
    return (initialVelocityY * initialVelocityY) / (2 * gravity);
}

// Initialize the game
function init() {
    updateCannonRotation();
    updateWindIndicator();
    
    // Position the mattress closer to the cannon
    const minPosition = 400;  // Reduced from 500 to 400
    const maxPosition = 550;  // Reduced from 650 to 550
    const randomPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
    mattressElement.style.right = `${800 - randomPosition}px`;
}

// Start the game
init();