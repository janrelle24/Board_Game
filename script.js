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

document.addEventListener("dragstart", (e) =>{
    if(e.target.classList.contains("chip")){
        draggedChip = e.target;
        setTimeout(() => (draggedChip.style.opacity = "0.5"), 0);
    }
});

document.addEventListener("dragend", (e) =>{
    if(draggedChip){
        draggedChip.style.opacity = "1";
        draggedChip = null
    }
});

board.addEventListener("dragover", (e) =>{
    e.preventDefault(); //allow dropping
});

board.addEventListener("drop", (e) =>{
    e.preventDefault();
    const target = e.target;
    // --- get the square element no matter what was clicked ---
    const square = target.classList.contains("square")
        ? target
        : target.closest(".square");

    // --- validate drop target ---
    if(!square || !square.classList.contains("white")) return;
    if(square.querySelector(".chip")) return;

    // --- perform drop ---
    if(draggedChip){
        square.appendChild(draggedChip);
    }
});
