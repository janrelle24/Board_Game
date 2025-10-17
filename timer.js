let redTime = 600; // 10 minutes in seconds
let whiteTime = 600; // 10 minutes in seconds
let redInterval = null;
let whiteInterval = null;

const redTimerDisplay = document.getElementById("red-timer");
const whiteTimerDisplay = document.getElementById("white-timer");

function formatTime(time){
    const min = String(Math.floor(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    return `${min}:${sec}`;
}

function updateTimerDisplay(){
    
    redTimerDisplay.textContent = `Red ⏱️ ${formatTime(redTime)}`;
    whiteTimerDisplay.textContent = `White ⏱️ ${formatTime(whiteTime)}`;

}



function startRedTimer(){
    clearInterval(whiteInterval);
    clearInterval(redInterval);

    redTimerDisplay.classList.add("active");
    whiteTimerDisplay.classList.remove("active");

    redInterval = setInterval(() =>{
        redTime--;
        updateTimerDisplay();
        if(redTime <= 0){
            clearInterval(redInterval);
            if (window.declareWinner) window.declareWinner("⚪ White (Time Out)");
        }
    }, 1000);
}

function startWhiteTimer(){
    clearInterval(redInterval);
    clearInterval(whiteInterval);

    whiteTimerDisplay.classList.add("active");
    redTimerDisplay.classList.remove("active");

    whiteInterval = setInterval(() =>{
        whiteTime--;
        updateTimerDisplay();
        if(whiteTime <= 0){
            clearInterval(whiteInterval);
            if (window.declareWinner) window.declareWinner("🔴 Red (Time Out)");
        }
    }, 1000);
}

function switchTurnTimers(newPlayer){
    if(newPlayer === "white"){
        startWhiteTimer();
    }
    else{
        startRedTimer();
    }
}

function stopAllTimers(){
    clearInterval(redInterval);
    clearInterval(whiteInterval);
    redTimerDisplay.classList.remove("active");
    whiteTimerDisplay.classList.remove("active");
}

// Start white’s timer first
updateTimerDisplay();
startWhiteTimer();

// Make available to other scripts
window.switchTurnTimers = switchTurnTimers;
window.stopAllTimers = stopAllTimers;


