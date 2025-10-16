const board = document.getElementById("board");
const topNumbers = document.querySelector(".top");
const bottomNumbers = document.querySelector(".bottom");
const leftNumbers = document.querySelector(".left");
const rightNumbers = document.querySelector(".right");

const pattern = [
    ["+", "=", "-", "=", "-", "=", "+", "="],
    ["=", "-", "=", "+", "=", "+", "=", "-"],
    ["-", "=", "+", "=", "+", "=", "-", "="], 
    ["=", "+", "=", "-", "=", "-", "=", "+"],
    ["+", "=", "-", "=", "-", "=", "+", "="],
    ["=", "-", "=", "+", "=", "+", "=", "-"],
    ["-", "=", "+", "=", "+", "=", "-", "="],
    ["=", "+", "=", "-", "=", "-", "=", "+"]
];

for(let row = 0; row < 8; row++){
    for(let col = 0; col < 8; col++){
        const square = document.createElement("div");
        square.classList.add("square");
        square.dataset.row = row;
        square.dataset.col = col;

        //alternate colors
        if((row + col) % 2 === 0){
            square.classList.add("white");

            //add symbols for white squares
            const symbol = document.createElement("span");
            const symbolChar = pattern[row][col];
            symbol.textContent = symbolChar;
            symbol.classList.add("symbol");

            // Optional: color them differently
            if (symbolChar === "+") {
                symbol.classList.add("plus");
            } else if(symbolChar === "-") {
                symbol.classList.add("minus");
            }else{
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
            square.appendChild(chip);
        }else if(row > 4 && square.classList.contains("white")){
            chip.classList.add("chip", "white-chip");
            chip.setAttribute("draggable", true);
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

// === Make chips clickable and movable ===
let draggedChip = null;
let currentPlayer = "white"; //white starts first
let activeChip = null; //for chaining the captures

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
    e.preventDefault(); //allow dropping
});

board.addEventListener("drop", (e) =>{
    e.preventDefault();
    const target = e.target.closest(".square");
    if(!target || !target.classList.contains("white")) return; //only allow drops on white squares
    if(target.querySelector(".chip")) return; //can't move unto another chip
    if(!draggedChip) return; //no chip to drop

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
        //only allow if no captures are possible for this player
        if(hasAnyCapture(chipColor)) return; //must capture when possible


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
        /**/ 

        const middleChip = middleSquare.querySelector(".chip");
        //if(!middleSquare) return; //no middle square found

        if(!middleChip) return; //no chip to capture

        const middleColor = middleChip.classList.contains("white-chip") ? "white" : "red";

        //must jump over opponent's chip
        if(middleColor === chipColor) return; //can't jump over own chip



        //remove the captured chip
        middleSquare.removeChild(middleChip);
        //move chip to target square
        target.appendChild(draggedChip);
        checkKingPromotion(draggedChip, toRow);

        //check if the same chip can make another capture
        if(canCaptureAgain(target, chipColor, draggedChip)){
            activeChip = draggedChip; //set the active chip for potential multi-jump
            showValidMoves(draggedChip);
            //console.log("You can capture again!");
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
                if (colorHere === chipColor) return; // blocked by own piece
                if (capturedChip) return; // can’t jump over 2+ pieces
                capturedChip = chipHere;
            }
            r += dr;
            c += dc;
        }
        if (capturedChip){
            capturedChip.parentElement.removeChild(capturedChip); // remove captured chip
        }else if(hasAnyCapture(chipColor)){
            return; //must capture if a capture exists elsewhere 
        }
        target.appendChild(draggedChip);
        checkKingPromotion(draggedChip, toRow);

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
//king promotion
function checkKingPromotion(chip, row){
    const isWhite = chip.classList.contains("white-chip");
    const isRed = chip.classList.contains("red-chip");

    if((isWhite && row === 0) || (isRed && row === 7)){
        chip.classList.add("king");
        chip.style.border = "4px solid gold";
        chip.style.boxShadow = "0 0 10px gold";
        chip.innerHTML = "♕"; //crown symbol
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
    return false; //no captures available
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
            
                    if (targetColor === color) break; // blocked by own piece
            
                    if (enemyFound) break; // can only capture one at a time
                    enemyFound = true;
                }else{
                    if (enemyFound) {
                        // landing spot after a jump
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
            // Normal move (only if no captures)
            if (
                !mustCapture &&
                moveSquare &&
                moveSquare.classList.contains("white") &&
                !moveSquare.querySelector(".chip")
            ){
                if (
                    (color === "white" && dr === -1) ||
                    (color === "red" && dr === 1)
                ) {
                    moveSquare.classList.add("highlight-move");
                }
            }
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

                    if (middleColor !== color){
                        jumpSquare.classList.add("highlight-capture");
                    }
            }
        }
        
    }
}

function clearHighlights(){
    document
        .querySelectorAll(".highlight-move, .highlight-capture")
        .forEach((sq) => sq.classList.remove("highlight-move", "highlight-capture"));
}

function switchTurn(){
    currentPlayer = currentPlayer === "white" ? "red" : "white";
    console.log(`Now it's ${currentPlayer.toUpperCase()}'s turn`);
}
