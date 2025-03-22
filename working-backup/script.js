// DOM elements
const cannonElement = document.getElementById('cannon');
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
const soundToggle = document.getElementById('sound-toggle');

// Display elements
const angleValueElement = document.getElementById('angle-value');
const powerValueElement = document.getElementById('power-value');
const windValueElement = document.getElementById('wind-value');
const massValueElement = document.getElementById('mass-value');
const currentScoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const hitsElement = document.getElementById('hits');
const attemptsElement = document.getElementById('attempts');
const currentLevelElement = document.getElementById('current-level');
const targetScoreElement = document.getElementById('target-score');

// Sound elements
const cannonSound = document.getElementById('cannon-sound');
const bounceSound = document.getElementById('bounce-sound');
const crashSound = document.getElementById('crash-sound');
const successSound = document.getElementById('success-sound');
const levelUpSound = document.getElementById('level-up-sound');
const whooshSound = document.getElementById('whoosh-sound');

// Sound settings
let soundEnabled = true;

// Sound function
function playSound(sound) {
    if (soundEnabled) {
        sound.pause();
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Error playing sound:", e));
    }
}

// Sound toggle
soundToggle.addEventListener('change', () => {
    soundEnabled = soundToggle.checked;
    localStorage.setItem('clownCannonSoundEnabled', soundEnabled);
    
    if (soundEnabled) {
        playSound(successSound);
    }
});

// Game parameters
let angle = 45;
let power = 50;
let wind = 0;
let mass = 10;
let gravity = 9.8;
let isAnimating = false;

// Physics parameters
let airResistance = 0.01;
let windVariance = 0.1;
let physicsTimeScale = 0.3;
let trailFrequency = 15;

// Scoring system
let score = 0;
let highScore = 0;
let hits = 0;
let attempts = 0;
let currentLevel = 1;
let targetScores = [100, 250, 500, 750, 1000];

// Load high score from local storage if available
if (localStorage.getItem('clownCannonHighScore')) {
    highScore = parseInt(localStorage.getItem('clownCannonHighScore'));
    highScoreElement.textContent = highScore;
}

// Animation variables
let animationId = null;
let clownPosition = { x: 0, y: 0 };
let initialVelocity = { x: 0, y: 0 };
let currentVelocity = { x: 0, y: 0 };
let rotationAngle = 0;

// Create a fresh clown element for each shot
function createClown() {
    // Remove any existing clown
    const oldClown = document.getElementById('clown');
    if (oldClown) {
        oldClown.remove();
    }
    
    // Create a new clown element
    const clown = document.createElement('div');
    clown.id = 'clown';
    clown.className = 'clown';
    clown.innerHTML = `
        <div class="eye-left"></div>
        <div class="eye-right"></div>
        <div class="hair"></div>
        <div class="hat"></div>
        <div class="nose"></div>
        <div class="mouth"></div>
        <div class="hair-tuft"></div>
        <div class="hair-tuft"></div>
        <div class="hair-tuft"></div>
    `;
    
    // Add it to the game area
    document.querySelector('.game-area').appendChild(clown);
    
    return clown;
}

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
    // Prevent firing while animation is in progress
    if (isAnimating) {
        return;
    }
    
    // Create a new clown for this shot
    const clown = createClown();
    
    // Set animation flag
    isAnimating = true;
    
    // Play cannon sound
    playSound(cannonSound);
    
    // Display the clown
    clown.style.display = 'block';
    
    // Calculate initial velocity components
    const angleRad = angle * Math.PI / 180;
    const velocityMagnitude = power * 1.2;
    
    // Calculate power factor
    const normalizedPower = power / 100;
    const dynamicScaleFactor = (1.45 * normalizedPower * normalizedPower) + (0.1 * normalizedPower) + 0.05;
    
    // Set initial velocity
    initialVelocity = {
        x: velocityMagnitude * Math.cos(angleRad) * dynamicScaleFactor,
        y: velocityMagnitude * Math.sin(angleRad) * dynamicScaleFactor
    };
    
    // Correct near-vertical shots
    if (Math.abs(initialVelocity.x) < 0.1 && angle > 85) {
        initialVelocity.x = 0.1;
    }
    
    // Set current velocity
    currentVelocity = {...initialVelocity};
    
    // Calculate rotation speed
    const rotationSpeed = (power / mass) * 0.5;
    
    // Set starting position
    const cannonLength = 80;
    clownPosition = {
        x: 100 + cannonLength * Math.cos(angleRad),
        y: 50 + cannonLength * Math.sin(angleRad)
    };
    
    // Reset rotation angle
    rotationAngle = 0;
    
    // Cannon firing effect
    cannonElement.style.transform = `rotate(-${angle}deg) translateX(5px)`;
    cannonElement.classList.add('firing');
    
    // Reset cannon after recoil
    setTimeout(() => {
        cannonElement.style.transform = `rotate(-${angle}deg)`;
        cannonElement.classList.remove('firing');
    }, 200);
    
    // Update clown position
    updateClownPosition(clown);
    
    // Clear trajectory
    clearTrajectory();
    
    // Play whoosh sound
    playSound(whooshSound);
    
    // Start animation
    animationId = requestAnimationFrame(() => animateClown(clown, rotationSpeed));
    
    // Update feedback and stats
    feedbackElement.innerHTML = '<p>Clown launched!</p>';
    feedbackElement.className = 'feedback';
    statsElement.innerHTML = '';
    
    // Increment attempts
    attempts++;
    attemptsElement.textContent = attempts;
});

// Clear trajectory visuals
function clearTrajectory() {
    // Remove existing trajectory dots
    const existingDots = document.querySelectorAll('.trajectory-dot');
    existingDots.forEach(dot => dot.remove());
    
    // Clear path container
    const pathContainer = document.getElementById('trajectory-path');
    if (pathContainer) {
        pathContainer.innerHTML = '';
    }
    
    // Reset trajectory points
    trajectoryPoints = [];
}

// Update cannon rotation based on angle
function updateCannonRotation() {
    cannonElement.style.transform = `rotate(-${angle}deg)`;
}

// Update wind indicator
function updateWindIndicator() {
    const rotation = wind < 0 ? 180 : 0;
    const opacity = Math.abs(wind) / 10;
    
    windIndicatorElement.style.transform = `rotate(${rotation}deg)`;
    windIndicatorElement.style.opacity = 0.2 + opacity * 0.8;
    
    const scale = 0.5 + Math.abs(wind) / 10;
    windIndicatorElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;
}

// Update clown position on screen
function updateClownPosition(clown) {
    clown.style.left = `${clownPosition.x - 20}px`;  // Center horizontally
    clown.style.top = `${400 - clownPosition.y - 40}px`;  // Center vertically
    clown.style.transform = `rotate(${rotationAngle}deg)`;
}

// Store trajectory points for drawing
let trajectoryPoints = [];
let dotCounter = 0;

// Animate the clown's trajectory
function animateClown(clown, rotationSpeed) {
    // Stop animation if flag is false
    if (!isAnimating) {
        return;
    }
    
    // Calculate physics
    const dt = (1 / 60) * physicsTimeScale;
    
    // Apply air resistance
    const airFactor = 1 - (airResistance / mass);
    currentVelocity.x *= airFactor;
    currentVelocity.y *= airFactor;
    
    // Apply wind
    const windForce = wind * (0.1 / mass) * physicsTimeScale;
    currentVelocity.x += windForce;
    
    // Apply gravity
    currentVelocity.y -= gravity * dt;
    
    // Update position
    clownPosition.x += currentVelocity.x * physicsTimeScale;
    clownPosition.y += currentVelocity.y * physicsTimeScale;
    
    // Update rotation
    rotationAngle += rotationSpeed;
    if (rotationAngle > 360) {
        rotationAngle -= 360;
    }
    
    // Special case for low power
    if (power < 20 && Math.abs(currentVelocity.x) < 0.5 && Math.abs(currentVelocity.y) < 0.5) {
        // Force landing on ground
        clownPosition.y = 50;
        landClown(clown, false);
        return;
    }
    
    // Track trajectory for drawing
    dotCounter++;
    if (dotCounter >= trailFrequency) {
        trajectoryPoints.push({
            x: clownPosition.x,
            y: clownPosition.y
        });
        dotCounter = 0;
        
        // Draw trajectory
        drawTrajectoryPath();
    }
    
    // Update clown position
    updateClownPosition(clown);
    
    // Check for landing
    const groundLevel = 50;
    const mattressHeight = 30;
    
    // Get mattress position
    const mattressRect = mattressElement.getBoundingClientRect();
    const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
    const mattressLeft = mattressRect.left - gameAreaRect.left;
    const mattressRight = mattressRect.right - gameAreaRect.left;
    
    // Check if above mattress
    const isAboveMattress = (clownPosition.x >= mattressLeft && clownPosition.x <= mattressRight);
    
    // Check for landing on mattress
    if (isAboveMattress && clownPosition.y <= (groundLevel + mattressHeight)) {
        clownPosition.y = groundLevel + mattressHeight;
        updateClownPosition(clown);
        landClown(clown, true);
        return;
    }
    
    // Check for landing on ground
    if (clownPosition.y <= groundLevel) {
        clownPosition.y = groundLevel;
        updateClownPosition(clown);
        landClown(clown, false);
        return;
    }
    
    // Check if out of bounds
    if (clownPosition.x < 0 || clownPosition.x > 800) {
        landClown(clown, false);
        feedbackElement.innerHTML = '<p>The clown flew out of bounds!</p>';
        feedbackElement.className = 'feedback failure';
        return;
    }
    
    // Continue animation
    animationId = requestAnimationFrame(() => animateClown(clown, rotationSpeed));
}

// Handle landing
function landClown(clown, onMattress) {
    // Stop animation
    cancelAnimation();
    
    // Set final position
    updateClownPosition(clown);
    
    // Apply landing effects
    if (onMattress) {
        // Landing on mattress
        clown.classList.add('bounce');
        mattressElement.classList.add('landing');
        mattressElement.classList.add('highlight');
        
        // Play sounds
        playSound(bounceSound);
        setTimeout(() => playSound(successSound), 300);
        
        // Show success message
        const landingText = document.createElement('div');
        landingText.className = 'landing-text success';
        landingText.textContent = 'LANDING SUCCESS!';
        document.querySelector('.game-area').appendChild(landingText);
        
        // Remove effects after animation
        setTimeout(() => {
            landingText.remove();
            mattressElement.classList.remove('landing');
            mattressElement.classList.remove('highlight');
        }, 2000);
    } else {
        // Landing on ground
        clown.classList.add('squish');
        
        // Play crash sound
        playSound(crashSound);
    }
    
    // Check landing results
    checkLanding(clown, onMattress);
    
    // Hide clown and enable firing after delay
    setTimeout(() => {
        // Hide clown
        clown.style.display = 'none';
        
        // Update feedback message
        feedbackElement.innerHTML = '<p>Ready for next shot!</p>';
        
        // Allow firing again
        isAnimating = false;
    }, 2000);
}

// Stop all animation
function cancelAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Draw a trajectory dot
function drawTrajectoryDot(x, y, size = 4, opacity = 0.6) {
    const dot = document.createElement('div');
    dot.className = 'trajectory-dot';
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${x}px`;
    dot.style.top = `${400 - y - size/2}px`;
    dot.style.opacity = opacity;
    
    document.querySelector('.game-area').appendChild(dot);
    return dot;
}

// Draw the entire trajectory path
function drawTrajectoryPath() {
    // Clear existing dots
    const existingDots = document.querySelectorAll('.trajectory-dot');
    existingDots.forEach(dot => dot.remove());
    
    // Get or create path container
    const pathContainer = document.getElementById('trajectory-path') || createPathContainer();
    
    // Draw trajectory line
    if (trajectoryPoints.length > 1) {
        let pathSVG = `<svg width="100%" height="100%" style="position:absolute; top:0; left:0; pointer-events:none;">
            <path d="M `;
            
        // Add points to path
        trajectoryPoints.forEach((point, i) => {
            pathSVG += `${point.x} ${400 - point.y} `;
            if (i === 0) pathSVG += " L ";
        });
        
        pathSVG += `" stroke="rgba(255,0,0,0.5)" stroke-width="2" fill="none" />`;
        
        // Add dots
        trajectoryPoints.forEach(point => {
            pathSVG += `<circle cx="${point.x}" cy="${400 - point.y}" r="3" fill="red" />`;
        });
        
        pathSVG += `</svg>`;
        pathContainer.innerHTML = pathSVG;
    }
    
    // Draw physical dots
    trajectoryPoints.forEach((point, index) => {
        const recencyFactor = index / trajectoryPoints.length;
        const size = 3 + recencyFactor * 3;
        const opacity = 0.3 + recencyFactor * 0.6;
        
        drawTrajectoryDot(point.x, point.y, size, opacity);
    });
}

// Create container for trajectory path
function createPathContainer() {
    const container = document.createElement('div');
    container.id = 'trajectory-path';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '5';
    document.querySelector('.game-area').appendChild(container);
    return container;
}

// Check landing results
function checkLanding(clown, landedOnMattress) {
    // Get positions
    const clownRect = clown.getBoundingClientRect();
    const mattressRect = mattressElement.getBoundingClientRect();
    
    // Calculate distance traveled
    const distanceTraveled = clownPosition.x;
    
    // Calculate overlap percentage
    let overlapPercentage = 0;
    if (landedOnMattress) {
        const clownWidth = clownRect.width;
        overlapPercentage = 100; // Simplified since we already detected landing
    }
    
    // Calculate landing perfection
    const mattressCenter = (mattressRect.left + mattressRect.right) / 2;
    const clownCenter = (clownRect.left + clownRect.right) / 2;
    const distanceFromCenter = Math.abs(clownCenter - mattressCenter);
    const mattressWidth = mattressRect.width;
    const perfection = 1 - (distanceFromCenter / (mattressWidth / 2));
    
    // Calculate score
    let pointsEarned = 0;
    if (landedOnMattress) {
        // Base points
        const basePoints = Math.round(50 + perfection * 50);
        
        // Bonus points
        let bonusPoints = 0;
        
        // Gravity bonus
        if (gravity < 3) {
            bonusPoints += 25;
        } else if (gravity < 5) {
            bonusPoints += 15;
        }
        
        // Wind bonus
        const windBonus = Math.round(Math.abs(wind) * 3);
        bonusPoints += windBonus;
        
        // Mass bonus
        if (mass < 5 || mass > 15) {
            bonusPoints += 10;
        }
        
        // Distance bonus
        if (distanceTraveled > 600) {
            bonusPoints += 20;
        } else if (distanceTraveled > 400) {
            bonusPoints += 10;
        }
        
        // Perfect landing bonus
        let perfectBonus = 0;
        if (perfection > 0.9) {
            perfectBonus = 50;
            feedbackElement.innerHTML = `<p>BULLSEYE! Perfect center landing. ${Math.round(overlapPercentage)}% on mattress!</p>`;
        } else {
            feedbackElement.innerHTML = `<p>SUCCESS! The clown landed successfully on the mattress.</p>`;
        }
        
        // Total points
        pointsEarned = basePoints + bonusPoints + perfectBonus;
        
        // Update score
        score += pointsEarned;
        hits++;
        
        // Show bonus points
        showBonusPoints(pointsEarned, clownRect.left, clownRect.top - 30);
        
        // Update UI
        currentScoreElement.textContent = score;
        hitsElement.textContent = hits;
        
        // Check for high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('clownCannonHighScore', highScore.toString());
        }
        
        // Check for level up
        if (score >= targetScores[currentLevel - 1] && currentLevel < targetScores.length) {
            levelUp();
        }
        
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
        <p>Impact velocity: ${Math.sqrt(currentVelocity.x*currentVelocity.x + currentVelocity.y*currentVelocity.y).toFixed(2)} m/s</p>
        <p>Points earned: ${pointsEarned}</p>
    `;
}

// Create floating bonus point indicator
function showBonusPoints(amount, x, y) {
    const bonusElement = document.createElement('div');
    bonusElement.className = 'bonus-indicator';
    bonusElement.textContent = `+${amount}`;
    bonusElement.style.left = `${x}px`;
    bonusElement.style.top = `${y}px`;
    document.querySelector('.game-area').appendChild(bonusElement);
    
    setTimeout(() => {
        bonusElement.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        bonusElement.remove();
    }, 1600);
}

// Level up function
function levelUp() {
    currentLevel++;
    currentLevelElement.textContent = currentLevel;
    
    // Play sound
    playSound(levelUpSound);
    
    if (currentLevel <= targetScores.length) {
        targetScoreElement.textContent = targetScores[currentLevel - 1];
        
        // Make game harder
        switch(currentLevel) {
            case 2:
                // Level 2 - Smaller mattress
                mattressElement.style.width = '100px';
                mattressElement.querySelector('.mattress-detail').style.width = '80px';
                break;
            case 3:
                // Level 3 - More wind
                windVariance = 0.5;
                break;
            case 4:
                // Level 4 - Even smaller mattress, moved further
                mattressElement.style.width = '80px';
                mattressElement.querySelector('.mattress-detail').style.width = '60px';
                mattressElement.style.right = '50px';
                break;
            case 5:
                // Level 5 - Maximum challenge
                windVariance = 1.0;
                airResistance = 0.03;
                break;
        }
        
        // Show level up message
        const levelUpMessage = document.createElement('div');
        levelUpMessage.className = 'level-up-message';
        levelUpMessage.innerHTML = `<h2>Level ${currentLevel}!</h2><p>The challenge increases!</p>`;
        document.body.appendChild(levelUpMessage);
        
        setTimeout(() => {
            levelUpMessage.remove();
        }, 3000);
    }
}

// Calculate maximum height
function calculateMaxHeight() {
    const initialVelocityY = initialVelocity.y;
    return (initialVelocityY * initialVelocityY) / (2 * gravity);
}

// Create placeholder sounds
function createPlaceholderSounds() {
    const sounds = [
        cannonSound, bounceSound, crashSound, 
        successSound, levelUpSound, whooshSound
    ];
    
    for (const sound of sounds) {
        if (!sound.getAttribute('src') || sound.getAttribute('src') === '') {
            const blob = new Blob([new Uint8Array([255, 227, 24, 196, 0, 0, 0, 3, 72, 1, 64, 0, 0, 4, 132, 16, 31, 227, 192, 225, 76, 255])], {type: 'audio/mpeg'});
            const url = URL.createObjectURL(blob);
            sound.src = url;
        }
    }
}

// Emergency reset function
function resetGame() {
    // Stop animation
    cancelAnimation();
    
    // Allow firing
    isAnimating = false;
    
    // Hide existing clown
    const clown = document.getElementById('clown');
    if (clown) {
        clown.style.display = 'none';
    }
    
    // Reset feedback
    feedbackElement.innerHTML = '<p>Game reset! Ready for next shot.</p>';
    
    return "Game reset successfully. You can now fire again.";
}

// Initialize the game
function init() {
    // Reset animation state
    isAnimating = false;
    cancelAnimation();
    
    // Position elements
    updateCannonRotation();
    updateWindIndicator();
    
    // Position mattress
    const mattressPosition = 550;
    mattressElement.style.right = `${800 - mattressPosition}px`;
    
    // Initialize scores
    currentScoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    hitsElement.textContent = hits;
    attemptsElement.textContent = attempts;
    currentLevelElement.textContent = currentLevel;
    targetScoreElement.textContent = targetScores[currentLevel - 1];
    
    // Load sound preference
    if (localStorage.getItem('clownCannonSoundEnabled') !== null) {
        soundEnabled = localStorage.getItem('clownCannonSoundEnabled') === 'true';
        soundToggle.checked = soundEnabled;
    }
    
    // Create placeholder sounds
    createPlaceholderSounds();
    
    // Hide any clown
    const clown = document.getElementById('clown');
    if (clown) {
        clown.remove();
    }
    
    // Set initial feedback
    feedbackElement.innerHTML = '<p>Adjust controls and press Fire to launch the clown!</p>';
    
    // Add emergency reset
    fireButton.addEventListener('dblclick', function() {
        resetGame();
    });
}

// Test function
function testMultiplePowerSettings() {
    console.log("========== AUTOMATED TESTING STARTED ==========");
    
    const powerSettings = [5, 10, 15, 20, 25, 30, 50, 75, 100];
    let currentSettingIndex = 0;
    
    // Set fixed angle
    angleInput.value = 45;
    angle = 45;
    angleValueElement.textContent = 45;
    updateCannonRotation();
    
    function fireNextSetting() {
        // Check if done
        if (currentSettingIndex >= powerSettings.length) {
            console.log("========== AUTOMATED TESTING COMPLETE ==========");
            feedbackElement.innerHTML = '<p>Testing complete! All power settings verified.</p>';
            return;
        }
        
        // Wait for previous animation
        if (isAnimating) {
            setTimeout(fireNextSetting, 500);
            return;
        }
        
        // Set power
        const currentPower = powerSettings[currentSettingIndex];
        powerInput.value = currentPower;
        power = currentPower;
        powerValueElement.textContent = currentPower;
        
        console.log(`Testing power setting: ${currentPower}`);
        feedbackElement.innerHTML = `<p>Testing power setting: ${currentPower}</p>`;
        
        // Fire cannon
        fireButton.click();
        
        // Check status after delay
        setTimeout(() => {
            // Move to next power setting
            currentSettingIndex++;
            setTimeout(fireNextSetting, 2500);
        }, 5000);
    }
    
    // Start testing
    fireNextSetting();
}

// Start the game
init();

// Expose for console
window.resetGame = resetGame;
window.testMultiplePowerSettings = testMultiplePowerSettings;