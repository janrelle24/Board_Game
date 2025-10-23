let redTime = 300; // 5 minutes in seconds //300
let whiteTime = 300; // 5 minutes in seconds //300
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
            
            stopAllTimers();
            handleTimeout();
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
            
            stopAllTimers();
            handleTimeout();
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

function handleTimeout(){
    
    stopAllTimers();
    document.querySelectorAll(".chip").forEach(chip =>{
        chip.setAttribute("draggable", false);
    });
    
    if (typeof window.determineWinner === "function") {
        window.determineWinner(); 
    }
    
    const text = document.getElementById("winner-text");
    if (text) {
        text.textContent = `⏰ Time's up! ` + text.textContent;
    }
    const modal = document.getElementById("winnerModal");
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("show");
    }
}

function stopAllTimers(){
    clearInterval(redInterval);
    clearInterval(whiteInterval);
    redTimerDisplay.classList.remove("active");
    whiteTimerDisplay.classList.remove("active");
}


updateTimerDisplay();
stopAllTimers();
//startWhiteTimer();

// Make available to other scripts
window.switchTurnTimers = switchTurnTimers;
window.stopAllTimers = stopAllTimers;
window.startWhiteTimer = startWhiteTimer;
window.startRedTimer = startRedTimer;


