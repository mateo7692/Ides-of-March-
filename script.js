// Game Variables
let phase = 1; // 1: You are the Assassin, 2: You are Caesar
let isLooking = false;
let isCharging = false;
let attackProgress = 0;
let gameActive = false;
let lookTimeout;

// DOM Elements
const instructionsText = document.getElementById('instructions');
const charFront = document.getElementById('character-front');
const charBack = document.getElementById('character-back');
const progressBar = document.getElementById('progress-bar');
const actionBtn = document.getElementById('action-btn');
const scene = document.getElementById('scene');

// Initializes the game or switches phases
function initGame(startingPhase) {
  phase = startingPhase;
  isLooking = false;
  isCharging = false;
  attackProgress = 0;
  gameActive = true;
  progressBar.style.width = '0%';
  scene.classList.remove('looking');
  clearTimeout(lookTimeout);

  if (phase === 1) {
    instructionsText.innerText = "PHASE 1: Hold the button to assassinate. Release immediately if Caesar turns around!";
    charFront.innerText = "Caesar";
    charBack.innerText = "You (Assassin)";
    scheduleCaesarLook(); // Start AI Caesar
    requestAnimationFrame(assassinLoop);
  } else {
    instructionsText.innerText = "PHASE 2: You are Caesar! Tap the button to look over your shoulder and catch your advisor.";
    charFront.innerText = "You (Caesar)";
    charBack.innerText = "Royal Advisor";
    requestAnimationFrame(caesarLoop); // Start AI Advisor
  }
}

// -----------------------------------------
// PHASE 1 LOGIC: Player is the Assassin
// -----------------------------------------
function scheduleCaesarLook() {
  if (!gameActive || phase !== 1) return;
  // Caesar looks back randomly between 1 and 3 seconds
  const timeUntilLook = Math.random() * 2000 + 1000; 
  
  lookTimeout = setTimeout(() => {
    if (!gameActive) return;
    isLooking = true;
    charFront.innerText = "Caesar (LOOKING!)";
    scene.classList.add('looking');
    checkPhase1Caught();

    // Caesar looks for 1.5 seconds before turning back
    setTimeout(() => {
      if (!gameActive) return;
      isLooking = false;
      charFront.innerText = "Caesar";
      scene.classList.remove('looking');
      scheduleCaesarLook(); // Schedule the next turn
    }, 1500); 
  }, timeUntilLook);
}

function assassinLoop() {
  if (!gameActive || phase !== 1) return;

  if (isCharging) {
    attackProgress += 0.6; // Speed of your attack meter
    checkPhase1Caught();
    
    // Win Condition for Phase 1
    if (attackProgress >= 100) {
      gameActive = false;
      alert("Success! You assassinated Caesar and took the throne for yourself.");
      initGame(2); // Flip the gameplay!
      return;
    }
  } else if (attackProgress > 0) {
    attackProgress -= 0.3; // Meter decays slightly if you stop holding
  }

  progressBar.style.width = attackProgress + '%';
  requestAnimationFrame(assassinLoop);
}

function checkPhase1Caught() {
  // If Caesar is looking and your finger is on the button
  if (isLooking && isCharging && phase === 1) {
    gameActive = false;
    alert("Caught! Caesar saw your dagger. Off to the dungeon you go.");
    initGame(1); // Restart phase 1
  }
}

// -----------------------------------------
// PHASE 2 LOGIC: Player is Caesar
// -----------------------------------------
function caesarLoop() {
  if (!gameActive || phase !== 2) return;

  if (!isLooking) {
    // The AI Advisor randomly decides to start sneaking up
    if (!isCharging && Math.random() < 0.02) {
      isCharging = true;
      charBack.innerText = "Advisor (SCHEMING!)";
    }
    
    // If the AI is attacking, their bar goes up
    if (isCharging) {
      attackProgress += 0.5;
    }
  } else {
    // Player (Caesar) is looking back right now
    if (isCharging) {
      gameActive = false;
      alert("You caught your advisor trying to assassinate you! You win the game!");
      initGame(1); // Game completely resets
      return;
    }
    // If they weren't attacking, the meter drains back down
    if (attackProgress > 0) {
      attackProgress -= 1; 
    }
  }

  // Loss Condition for Phase 2
  if (attackProgress >= 100) {
    gameActive = false;
    alert("Too late! Your advisor assassinated you. The cycle continues...");
    initGame(1);
    return;
  }

  progressBar.style.width = attackProgress + '%';
  requestAnimationFrame(caesarLoop);
}

// -----------------------------------------
// CONTROLS (Handles Mouse, Touch, and Keyboard)
// -----------------------------------------
function startAction(e) {
  if (e && e.type !== 'keydown') e.preventDefault();
  if (!gameActive) return;
  
  if (phase === 1) {
    isCharging = true;
  } else if (phase === 2) {
    isLooking = true;
    charFront.innerText = "You (LOOKING BACK!)";
    scene.classList.add('looking');
  }
}

function endAction(e) {
  if (e && e.type !== 'keyup') e.preventDefault();
  if (!gameActive) return;
  
  if (phase === 1) {
    isCharging = false;
  } else if (phase === 2) {
    isLooking = false;
    charFront.innerText = "You (Caesar)";
    scene.classList.remove('looking');
    // The AI advisor immediately hides their weapon when you turn back
    isCharging = false;
    charBack.innerText = "Royal Advisor";
  }
}

// Mouse / Touch Events
actionBtn.addEventListener('mousedown', startAction);
actionBtn.addEventListener('mouseup', endAction);
actionBtn.addEventListener('mouseleave', endAction);
actionBtn.addEventListener('touchstart', startAction, {passive: false});
actionBtn.addEventListener('touchend', endAction, {passive: false});

// Spacebar Events
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat) startAction(e);
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') endAction(e);
});

// Start the game!
initGame(1);
