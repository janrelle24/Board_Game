let redScore = 0;
let whiteScore = 0;



function updateScoreboard(){
    const redEl = document.getElementById("red-score");
    const whiteEl = document.getElementById("white-score");
    if (redEl) redEl.textContent = `${redScore.toFixed(2)} pts`;
    if (whiteEl) whiteEl.textContent = `${whiteScore.toFixed(2)} pts`;
}
//Perform Calculation Based on Operator
function calculateCapture(chipValue, capturedValue, operator){
    chipValue = parseFloat(chipValue);
    capturedValue = parseFloat(capturedValue);

    switch (operator) {
        case '+': return chipValue + capturedValue;
        case '-': return chipValue - capturedValue;
        case '×': return chipValue * capturedValue;
        case '÷':
        case '/': return capturedValue !== 0 ? chipValue / capturedValue : chipValue;
        default: return chipValue;
    }
}
//Apply Operation When Landing
function applyOperation(chip, targetSquare, capturedChipValue){
    const operatorSpan = targetSquare.querySelector(".symbol");

    if (!operatorSpan) return;

    const operator = operatorSpan.textContent.trim();

    const chipValue = parseFloat(chip.dataset.value || chip.textContent);
    const capturedValue = parseFloat(capturedChipValue); 
    

    const result = calculateCapture(chipValue, capturedChipValue, operator);

    if(Number.isNaN(result)) return;

    // Update scores
    if (chip.classList.contains("red-chip")) {
        redScore += result;
    } else {
        whiteScore += result;
    }

    // Display last operation
    
    const opEl = document.getElementById("last-operation");
    if (opEl) opEl.textContent = `${chipValue} ${operator} ${capturedChipValue} = ${result}`;

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
}
function disableBoard(){
    document.querySelectorAll(".chip").forEach(chip =>{
        chip.setAttribute("draggable", false);
    });
}
window.applyOperation = applyOperation;
window.determineWinner = determineWinner;
window.resetScores = resetScores;
