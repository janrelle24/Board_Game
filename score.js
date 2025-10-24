let redScore = 0;
let whiteScore = 0;

function updateScoreboard(){
    const redEl = document.getElementById("red-score");
    const whiteEl = document.getElementById("white-score");
    if (redEl) redEl.textContent = `${redScore.toFixed()} pts`;
    if (whiteEl) whiteEl.textContent = `${whiteScore.toFixed()} pts`;
}
//Perform Calculation Based on Operator
function calculateCapture(chipValue, capturedValue, operator){
    chipValue = parseFloat(chipValue);
    capturedValue = parseFloat(capturedValue);

    if (Number.isNaN(chipValue) || Number.isNaN(capturedValue)) return NaN;

    switch (operator) {
        case '+': return chipValue + capturedValue;
        case '-': return chipValue - capturedValue;
        case '×': return chipValue * capturedValue;
        case '÷':
        case '/': return capturedValue !== 0 ? chipValue / capturedValue : NaN;
        default: return NaN;
    }
}
//Apply Operation When Landing
function applyOperation(chip, targetSquare, capturedChipValue, capturedChip){
    const operatorSpan = targetSquare.querySelector(".symbol");

    if (!operatorSpan) return;

    const operator = operatorSpan.textContent.trim();

    const chipValue = parseFloat(chip.dataset.value ?? chip.textContent);
    const capturedValue = parseFloat(capturedChipValue); 
    
    if(Number.isNaN(chipValue) || Number.isNaN(capturedValue)) return;

    const baseResult = calculateCapture(chipValue, capturedValue, operator);
    if (Number.isNaN(baseResult)) return;
//

    // king captures normal chips it double the score
    // Determine if a King captured a normal chip
    
    const capturingIsKing = chip.classList.contains("king");
    const capturedIsKing = capturedChip && capturedChip.classList && capturedChip.classList.contains("king");
    const isDoubleScore = capturingIsKing || capturedIsKing;

    const finalResult = isDoubleScore ? baseResult * 2 : baseResult;

    // Update scores
    if (chip.classList.contains("red-chip")) {
        redScore += finalResult;
    } else {
        whiteScore += finalResult;
    }

    // Display last operation
    
    const opEl = document.getElementById("last-operation");
    if (opEl) {
        opEl.textContent = `${chipValue} ${operator} ${capturedValue} = ${baseResult}`+
            (isDoubleScore ? ` King Bonus x2 → ${finalResult}` : "");
        }
    

    updateScoreboard();
}

    

// Reset scores when restarting
function resetScores(){
    redScore = 0;
    whiteScore = 0;
    //lastCaptureValue = 0;
    const opEl = document.getElementById("last-operation");
    if (opEl) opEl.textContent = "Last operation: none";
    updateScoreboard();
    
}

//  Determine winner at the end
function determineWinner(){
    let resultText = "";

    if(redScore > whiteScore){
        resultText = `🔴 Red Wins! (${redScore.toFixed(2)} pts vs ${whiteScore.toFixed(2)} pts)`;
    }
    else if(whiteScore > redScore){
        resultText = `⚪ White Wins! (${whiteScore.toFixed(2)} pts vs ${redScore.toFixed(2)} pts)`;
    }
    else{
        resultText = `It's a Tie! (${redScore.toFixed(2)} pts each)`;
    }

    // Show modal popup
    const modal = document.getElementById("winnerModal");
    const text = document.getElementById("winner-text");
    if (text) text.textContent = resultText;
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("show");
    }
    disableBoard();
    if (typeof stopAllTimers === "function") stopAllTimers();
}
function disableBoard(){
    document.querySelectorAll(".chip").forEach(chip =>{
        chip.setAttribute("draggable", false);
    });
}
window.applyOperation = applyOperation;
window.determineWinner = determineWinner;
window.resetScores = resetScores;
