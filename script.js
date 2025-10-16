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

    //must move diagonally 1 step
    if(Math.abs(colDiff) === 1 && Math.abs(rowDiff) === 1){
        //only allow if no captures are possible for this player
        if(hasAnyCapture(chipColor)) return; //must capture when possible

        //red moves downward (increasing row)
        if(chipColor === "red" && rowDiff !== 1) return;
        //white moves upward (decreasing row)
        if(chipColor === "white" && rowDiff !== -1) return;

        target.appendChild(draggedChip);
        clearHighlights();
        switchTurn();
        return;
    }
    // === Capture move (jumping over opponent) ===
    if(Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2){
        const middleRow = fromRow + rowDiff / 2 ;
        const middleCol = fromCol + colDiff / 2;

        const middleSquare = document.querySelector(
            `.square[data-row="${middleRow}"][data-col="${middleCol}"]`
        );

        if(!middleSquare) return; //no middle square found

        const middleChip = middleSquare.querySelector(".chip");
        if(!middleChip) return; //no chip to capture

        const middleColor = middleChip.classList.contains("white-chip") ? "white" : "red";

        //must jump over opponent's chip
        if(middleColor === chipColor) return; //can't jump over own chip



        //remove the captured chip
        middleSquare.removeChild(middleChip);
        //move chip to target square
        target.appendChild(draggedChip);

        clearHighlights();

        //check if the same chip can make another capture
        if(canCaptureAgain(target, chipColor)){
            activeChip = draggedChip; //set the active chip for potential multi-jump
            showValidMoves(draggedChip);
            console.log("You can capture again!");
        }else{
            activeChip = null;
            switchTurn();
        }
    }
});

// === Helper: Check if player has any capture available ===
function hasAnyCapture(color){
    const chips = document.querySelectorAll(
        color === "white" ? ".white-chip" : ".red-chip"
    );
    for(const chip of chips){
        const square = chip.parentElement;
        if(canCaptureAgain(square, color)) return true;
    }
    return false;
}
// === Helper: Check if a chip can capture again ===
function canCaptureAgain(square, color){
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const directions = [
        [-2, -2],
        [-2, 2],
        [2, -2],
        [2, 2],
    ];

    for(const [dr, dc] of directions){
        const newRow = row + dr;
        const newCol = col + dc;    
        const middleRow = row + dr / 2;
        const middleCol = col + dc / 2;

        const target = document.querySelector(
            `.square[data-row="${newRow}"][data-col="${newCol}"]`
        );

        const middle = document.querySelector(
            `.square[data-row="${middleRow}"][data-col="${middleCol}"]`
        );

        if(!target || !middle) continue; //out of bounds
        if(!target.classList.contains("white")) continue; //can only land on white squares
        if(target.querySelector(".chip")) continue; //target square must be empty

        const middleChip = middle.querySelector(".chip");
        if(!middleChip) continue; //no chip to jump over
        const middleColor = middleChip.classList.contains("white-chip") ? "white" : "red";

        if(middleColor !== color) return true; //can't jump over own chip
    }
    return false; //no captures available
}

// === Highlighting Functions ===
function showValidMoves(chip){
    clearHighlights();

    const color = chip.classList.contains("white-chip") ? "white" : "red";
    const square = chip.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    const dirs = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
    ];

    for(const [dr, dc] of dirs) {
        const newRow = row + dr;
        const newCol = col + dc;
        const jumpRow = row + dr * 2;
        const jumpCol = col + dc * 2;

        const moveSquare = document.querySelector(
            `.square[data-row="${newRow}"][data-col="${newCol}"]`
        );
        const jumpSquare = document.querySelector(
            `.square[data-row="${jumpRow}"][data-col="${jumpCol}"]`
        );

        //Normal move highlight
        if(
            moveSquare &&
            moveSquare.classList.contains("white") &&
            !moveSquare.querySelector(".chip") &&
            !hasAnyCapture(color)
        ){
            moveSquare.classList.add("highlight-move");
        }
        //capture move highlight
        if(
            moveSquare &&
            jumpSquare &&
            moveSquare.querySelector(".chip") &&
            !jumpSquare.querySelectory(".chip") &&
            jumpSquare.classList.contains("white")
        ){
            const enemyChip = moveSquare.querySelector(".chip");
            const enemyColor = enemyChip.classList.contains("white-chip") ? "white" : "red";

            if(enemyColor !== color){
                jumpSquare.classList.add("highlight-capture");
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
