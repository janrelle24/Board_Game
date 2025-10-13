const board = document.getElementById("board");
const topNumbers = document.querySelector(".top");
const bottomNumbers = document.querySelector(".bottom");
const leftNumbers = document.querySelector(".left");
const rightNumbers = document.querySelector(".right");

for(let row = 0; row < 8; row++){
    for(let col = 0; col < 8; col++){
        const square = document.createElement("div");
        square.classList.add("sqaure");

        //alternate colors
        if((row + col) % 2 === 0){
            square.classList.add("white");
        }
        else{
            square.classList.add("black");
        }
        board.appendChild(square);
    }
}

// Add numbers (0–7) around the board
for(let i = 0; i < 8; i++){
    const topNum = document.createElement("div");
    const bottomNum = document.createElement("div");
    const leftNum = document.createElement("div");
    const rightNum = document.createElement("div");

    topNum.textContent = i;
    bottomNum.textContent = i;
    leftNum.textContent = i;
    rightNum.textContent = i;

    topNum.classList.add("number");
    bottomNum.classList.add("number");
    leftNum.classList.add("number");
    rightNum.classList.add("number");

    topNumbers.appendChild(topNum);
    bottomNumbers.appendChild(bottomNum);
    leftNumbers.appendChild(leftNum);
    rightNumbers.appendChild(rightNum);
}