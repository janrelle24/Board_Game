const board = document.getElementById("board");
const topNumbers = document.querySelector(".top");
const bottomNumbers = document.querySelector(".bottom");
const leftNumbers = document.querySelector(".left");
const rightNumbers = document.querySelector(".right");

const pattern = [
    ["×", "=", "÷", "=", "-", "=", "+", "="], 
    ["=", "÷", "=", "×", "=", "+", "=", "-"], 
    ["-", "=", "+", "=", "×", "=", "÷", "="], 
    ["=", "+", "=", "-", "=", "÷", "=", "×"], 
    ["×", "=", "÷", "=", "-", "=", "+", "-"], 
    ["=", "÷", "=", "×", "=", "+", "=", "-"], 
    ["-", "=", "+", "=", "×", "=", "÷", "="], 
    ["=", "+", "=", "-", "=", "÷", "=", "×"] 
];

const redNumbers = [2, -5, 8, -11, -7, 10, -3, 0, 4, -1, 6, -9];
const whiteNumbers = [-9, 6, -1, 4, 0, -3, 10, -7, -11, 8, -5, 2];
let numberIndex = 0;

for(let row = 0; row < 8; row++){
    for(let col = 0; col < 8; col++){
        const square = document.createElement("div");
        square.classList.add("square");
        square.dataset.row = row;
        square.dataset.col = col;

        
        if((row + col) % 2 === 0){
            square.classList.add("white");

            
            const symbol = document.createElement("span");
            const symbolChar = pattern[row][col];
            symbol.textContent = symbolChar;
            symbol.classList.add("symbol");

            
            if (symbolChar === "+") {
                symbol.classList.add("plus");
            } else if(symbolChar === "-") {
                symbol.classList.add("minus");
            }else if(symbolChar === "×") {
                symbol.classList.add("multiply");
            }else if(symbolChar === "÷") {
                symbol.classList.add("divide");
            }
            else{
                symbol.classList.add("equal");
            }
            square.appendChild(symbol);
        }
        else{
            square.classList.add("black");
        }

        //add chips
        const chip = document.createElement("div");
        // Example placement:
        // Rows 0–2 → white chips
        // Rows 5–7 → black chips
        if(row < 3 && square.classList.contains("white")){
            chip.classList.add("chip", "red-chip");
            chip.setAttribute("draggable", true);
            chip.textContent = redNumbers[numberIndex % redNumbers.length];
            numberIndex++;
            square.appendChild(chip);
        }else if(row > 4 && square.classList.contains("white")){
            chip.classList.add("chip", "white-chip");
            chip.setAttribute("draggable", true);
            chip.textContent = whiteNumbers[numberIndex % whiteNumbers.length];
            numberIndex++;
            square.appendChild(chip);
        }

        board.appendChild(square);
    }
}
// Add numbers (0–7) top & bottom
for(let i = 0; i < 8; i++){
    const topNum = document.createElement("div");
    const bottomNum = document.createElement("div");
    
    topNum.textContent = i;
    bottomNum.textContent = i;
    
    topNum.classList.add("number");
    bottomNum.classList.add("number");
    
    topNumbers.appendChild(topNum);
    bottomNumbers.appendChild(bottomNum);
}
// Add numbers (7-0) left & right
for(let i = 7; i >= 0; i--){
    const leftNum = document.createElement("div");
    const rightNum = document.createElement("div");
    leftNum.textContent = i;
    rightNum.textContent = i;

    leftNum.classList.add("number");
    rightNum.classList.add("number");

    leftNumbers.appendChild(leftNum);
    rightNumbers.appendChild(rightNum);
}
/*start modal functionality*/ 
document.addEventListener("DOMContentLoaded", () =>{
    const startModal = document.getElementById("startmodal");
    const startBtn = document.getElementById("startbtn");

    startModal.style.display = "flex";
    const gameContainer = document.querySelector(".game-container");
    gameContainer.style.pointerEvents = "none";
    gameContainer.style.opacity = "0.5";

    if(typeof stopAllTimers === "function") stopAllTimers();

    startBtn.addEventListener("click", ()=>{
        startModal.style.display = "none";

        gameContainer.style.pointerEvents = "auto";
        gameContainer.style.opacity = "1";

        if(typeof startWhiteTimer === "function") startWhiteTimer();
    });
});

// === Make chips clickable and movable ===
let draggedChip = null;
let currentPlayer = "white"; 
let activeChip = null; 

document.addEventListener("dragstart", (e) =>{
    const chip = e.target;
    if(!chip.classList.contains("chip")) return;
        
    const chipColor = chip.classList.contains("red-chip") ? "red" : "white";

        //Only allow the current player's chips to move
    if(chipColor !== currentPlayer){
        e.preventDefault();
        return;
    }

    draggedChip = chip;
    showValidMoves(chip);
    setTimeout(() => (draggedChip.style.opacity = "0.5"), 0);
    
});

document.addEventListener("dragend", (e) =>{
    if(draggedChip){
        draggedChip.style.opacity = "1";
        draggedChip = null;
        clearHighlights();
    }
});

board.addEventListener("dragover", (e) =>{
    e.preventDefault(); 
});

board.addEventListener("drop", (e) =>{
    e.preventDefault();
    const target = e.target.closest(".square");
    if(!target || !target.classList.contains("white")) return; 
    if(target.querySelector(".chip")) return; 
    if(!draggedChip) return; 

    const fromSquare = draggedChip.parentElement;
    const fromRow = parseInt(fromSquare.dataset.row);
    const fromCol = parseInt(fromSquare.dataset.col);
    const toRow = parseInt(target.dataset.row);
    const toCol = parseInt(target.dataset.col);

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    const chipColor = draggedChip.classList.contains("white-chip") ? "white" : "red";
    const isKing = draggedChip.classList.contains("king"); 

    //must move diagonally 1 step
    if(!isKing && Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1){
        
        if(hasAnyCapture(chipColor)) return; 


        if(
            (chipColor === "red" && rowDiff === 1) ||
            (chipColor === "white" && rowDiff === -1) ||
            isKing
        ){
            target.appendChild(draggedChip);
            checkKingPromotion(draggedChip, toRow);
            clearHighlights();
            switchTurn();
            return;
        } 
    }
    // === Capture move (jumping over opponent) ===
    if(!isKing && Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2){
        const middleRow = fromRow + rowDiff / 2 ;
        const middleCol = fromCol + colDiff / 2;

        const middleSquare = document.querySelector(
            `.square[data-row="${middleRow}"][data-col="${middleCol}"]`
        );
        

        const middleChip = middleSquare.querySelector(".chip");
        

        if(!middleChip) return; 

        const middleColor = middleChip.classList.contains("white-chip") ? "white" : "red";

        
        if(middleColor === chipColor) return; 


        
        const capturedValue = parseFloat(middleChip.dataset.value || middleChip.dataset.number || middleChip.textContent);

        
        middleSquare.removeChild(middleChip);
        
        
        target.appendChild(draggedChip);
        
        if (!draggedChip.dataset.value) draggedChip.dataset.value = draggedChip.textContent;
        
        const operatorSpan = target.querySelector(".symbol");
        const operatorSymbol = operatorSpan ? operatorSpan.textContent.trim() : null;
        
        if(operatorSymbol === "÷" && capturedValue === 0){
            alert("❌ Illegal move! Cannot divide by zero.");
                return 0;
            /*
            if(chipValue / capturedValue){
                return 0;
            }
            /*
            // === Move chip back to original square ===
            if (fromSquare && draggedChip && !fromSquare.querySelector(".chip")) {
                fromSquare.appendChild(draggedChip);
            }

            // === Restore captured chip if it was taken visually ===
            if (middleSquare && middleChip && !middleSquare.querySelector(".chip")) {
                middleSquare.appendChild(middleChip);
            }

            // === Fully reset drag & capture state ===
            draggedChip = null;
            activeChip = null;

            // re-enable all chips for the current player
            document.querySelectorAll(`.${currentPlayer}-chip`).forEach(chip => {
                chip.setAttribute("draggable", true);
                chip.style.opacity = "1";
            });

            // clear board highlights (valid moves etc.)
            clearHighlights();

            // === short delay to let browser reset drag events ===
            setTimeout(() => {
                board.style.pointerEvents = "auto";
            }, 150);

            // stop any further capture logic
            resetDragState();
            return 0;*/
        }
        //SCORING CALCULATION
        
        if (typeof window.applyOperation === "function") {
            window.applyOperation(draggedChip, target, capturedValue, middleChip || capturedChip);
        }
        
        checkKingPromotion(draggedChip, toRow);

        //check if the same chip can make another capture
        if(canCaptureAgain(target, chipColor, draggedChip)){
            activeChip = draggedChip; 
            showValidMoves(draggedChip);
            
        }else{
            activeChip = null;
            clearHighlights();
            switchTurn();
        }
        return;
    }
    // === KING movement and capture ===
    if (isKing && Math.abs(rowDiff) === Math.abs(colDiff)){
        const dr = Math.sign(rowDiff);
        const dc = Math.sign(colDiff);
        let r = fromRow + dr;
        let c = fromCol + dc;
        let capturedChip = null;

        while (r !== toRow && c !== toCol){
            const square = document.querySelector(
                `.square[data-row="${r}"][data-col="${c}"]`
            );
            const chipHere = square.querySelector(".chip");
            if (chipHere){
                const colorHere = chipHere.classList.contains("white-chip") ? "white" : "red";
                if (colorHere === chipColor) return; 
                if (capturedChip) return; 
                capturedChip = chipHere;
            }
            r += dr;
            c += dc;
        }
        // === If capture exists elsewhere, force capture ===//
        if (!capturedChip && hasAnyCapture(chipColor)) return;

        // === Perform capture if valid ===
        if (capturedChip){
            
            const capturedValue = parseFloat(capturedChip.dataset.value || capturedChip.dataset.number || capturedChip.textContent);
            const operatorSpan = target.querySelector(".symbol");
            const operatorSymbol = operatorSpan ? operatorSpan.textContent.trim() : null;
            // === Check for illegal divide by zero ===
            if(operatorSymbol === "÷" && capturedValue === 0){
                alert("❌ Illegal move! Cannot divide by zero.");
                return 0;
                /*
                if(chipValue / capturedValue){
                    return 0;
                }*/
                /*
                if(fromSquare && draggedChip && !fromSquare.querySelector(".chip")){
                    fromSquare.appendChild(draggedChip);
                }
                if(middleChip && middleChip && !middleSquare.querySelector(".chip")){
                    middleSquare.appendChild(middleChip);
                }
                draggedChip = null;
                activeChip = null;
                selectedChip = null;
                validMoves = [];
                isCapturing = false;
                pendingCapture = false;
    
                clearHighlights();
    
                document.querySelectorAll(`.${currentPlayer}-chip`).forEach(chip => {
                    chip.setAttribute("draggable", true);
                    chip.style.opacity = "1";
                });
    
                const board = document.getElementById("board");
                board.style.pointerEvents = "none";
                setTimeout(() => {
                    board.style.pointerEvents = "auto";
                }, 100);

                return;*/
            }

            capturedChip.parentElement.removeChild(capturedChip); 
            if (!draggedChip.dataset.value) draggedChip.dataset.value = draggedChip.textContent;
            //SCORING CALCULATION
            
            if (typeof window.applyOperation === "function") {
                window.applyOperation(draggedChip, target, capturedValue, capturedChip);
            }
            
        }
        target.appendChild(draggedChip);
        checkKingPromotion(draggedChip, toRow);

        
        // === Check for further captures (mandatory chaining) ===
        if (capturedChip && canCaptureAgain(target, chipColor, draggedChip)){
            activeChip = draggedChip;
            showValidMoves(draggedChip);
        }else{
            activeChip = null;
            clearHighlights();
            switchTurn();
        }
    }
}); 
function resetDragState() {
    draggedChip = null;
    activeChip = null;
    document.querySelectorAll(".chip").forEach(chip => {
        chip.setAttribute("draggable", true);
        chip.style.opacity = "1";
    });
    clearHighlights();
}
//king promotion
function checkKingPromotion(chip, row){
    const isWhite = chip.classList.contains("white-chip");
    const isRed = chip.classList.contains("red-chip");

    if((isWhite && row === 0) || (isRed && row === 7)){
        //avoid duplicate king promotion
        if(!chip.classList.contains("king")){
            chip.classList.add("king");
            
            const chipNumber = chip.dataset.number || chip.dataset.value || chip.textContent.trim() || 0;
            chip.dataset.number = chipNumber;
            chip.dataset.value = chipNumber; 

            
            chip.innerHTML = `
                <div class="king-symbol">♕</div>
                <div class="chip-number">${chipNumber}</div>
            `;
            

            chip.style.border = "4px solid gold";
            chip.style.boxShadow = "0 0 10px gold";
        }
    }
}

// === Helper: Check if player has any capture available ===
function hasAnyCapture(color){
    const chips = document.querySelectorAll(
        color === "white" ? ".white-chip" : ".red-chip"
    );
    for(const chip of chips){
        const square = chip.parentElement;
        if(canCaptureAgain(square, color, chip)) return true;
    }
    return false;
}
// === Helper: Check if a chip can capture again === === King & normal piece capture detection ===
function canCaptureAgain(square, color, chip){
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const isKing = chip.classList.contains("king");
    
    const directions =[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
    ];

    for (const [dr, dc] of directions){
        let r = row + dr;
        let c = col + dc;
        let enemyFound = false;

        while(r >= 0 && r < 8 && c >= 0 && c < 8){
            const target = document.querySelector(
                `.square[data-row="${r}"][data-col="${c}"]`
            );

            if(!target || !target.classList.contains("white")) break;

            const chipAtTarget = target.querySelector(".chip");

            if(chipAtTarget){
                const targetColor = chipAtTarget.classList.contains("white-chip") ? "white" : "red";

                if(targetColor === color) break;
                if(enemyFound) break;
                enemyFound = true;
            }else{
                if(enemyFound) return true;
                if(!isKing) break;
            }
            r += dr;
            c += dc;
        }
    }
    return false; 
}

// === Highlighting Functions === // === King-aware highlighting (can move/capture farther) ===
function showValidMoves(chip){
    clearHighlights();

    const color = chip.classList.contains("white-chip") ? "white" : "red";
    const isKing = chip.classList.contains("king");
    const square = chip.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    const dirs = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
    ];
    
    const mustCapture = hasAnyCapture(color);

    for(const [dr, dc] of dirs){
        // ======== KING MOVES ========
        if(isKing){
            let r = row + dr;
            let c = col + dc;
            let enemyFound = false;

            while(r >= 0 && r < 8 && c >= 0 && c < 8){
                const target = document.querySelector(
                    `.square[data-row="${r}"][data-col="${c}"]`
                );

                if (!target || !target.classList.contains("white")) break;

                const chipAtTarget = target.querySelector(".chip");

                if (chipAtTarget) {
                    const targetColor = chipAtTarget.classList.contains("white-chip") ? "white" : "red";
            
                    if (targetColor === color) break; 
            
                    if (enemyFound) break; 
                    enemyFound = true;
                }else{
                    if (enemyFound) {
                        
                        target.classList.add("highlight-capture");
                        
                    }else if(!mustCapture){
                        target.classList.add("highlight-move");
                        
                    }
                    
                }
                r += dr;
                c += dc;
            }
        }
        // ======== NORMAL PIECE MOVES ========
        else{
            const moveRow = row + dr;
            const moveCol = col + dc;
            const jumpRow = row + dr * 2;
            const jumpCol = col + dc * 2;

            const moveSquare = document.querySelector(
                `.square[data-row="${moveRow}"][data-col="${moveCol}"]`
            );
            const jumpSquare = document.querySelector(
                `.square[data-row="${jumpRow}"][data-col="${jumpCol}"]`
            );
            
            //capture move
            if (
                jumpSquare &&
                jumpSquare.classList.contains("white") &&
                !jumpSquare.querySelector(".chip") &&
                moveSquare &&
                moveSquare.querySelector(".chip")
            ){
                const middleChip = moveSquare.querySelector(".chip");
                const middleColor = middleChip.classList.contains("white-chip")
                    ? "white"
                    : "red";
                if(middleColor !== color){
                    jumpSquare.classList.add("highlight-capture");
                }
            }
            else if(!mustCapture &&
                moveSquare &&
                moveSquare.classList.contains("white") &&
                !moveSquare.querySelector(".chip")
            ){
                if (
                    (color === "white" && dr === -1) ||
                    (color === "red" && dr === 1)
                ){
                    moveSquare.classList.add("highlight-move");
                }
            }
        }
        
    }
    //if there are captures, remove normal move highlights completely
    if(mustCapture){
        document
            .querySelectorAll(".highlight-move")
            .forEach((sq) => sq.classList.remove("highlight-move"));
    }
}

function clearHighlights(){
    document
        .querySelectorAll(".highlight-move, .highlight-capture")
        .forEach((sq) => sq.classList.remove("highlight-move", "highlight-capture"));
}
function checkForWinner(){
    const whiteChips = document.querySelectorAll(".white-chip");
    const redChips = document.querySelectorAll(".red-chip");

    // Check if one player has no pieces
    if (whiteChips.length === 0 || redChips.length === 0) {
        if (typeof window.determineWinner === "function") window.determineWinner();
        return true;
    }

    
    return false;
}


//restart button
const restartBtn = document.getElementById("restartbtn");
if(restartBtn){
    restartBtn.addEventListener("click", () =>{
        if (typeof window.resetScores === "function") window.resetScores();
        location.reload();  
    });
}


function switchTurn(){
    currentPlayer = currentPlayer === "white" ? "red" : "white";
    
    if (typeof window.switchTurnTimers === "function") window.switchTurnTimers(currentPlayer);


    console.log(`Now it's ${currentPlayer.toUpperCase()}'s turn`);
    checkForWinner();
    
}

