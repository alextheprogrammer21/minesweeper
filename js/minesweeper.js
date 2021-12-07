var time = 0;
var mineCounter = 10;
var minesDisplayed = 10;
var unrevealedTiles = 81;

function buildGrid() {
    // Fetch grid and clear out old elements.
    var grid = document.getElementById("minefield");
    grid.innerHTML = "";
    
    var [columns, rows] = [0,0];
    if (setDifficulty() === 0) [columns, rows, mineCounter, minesDisplayed, unrevealedTiles] = [9, 9, 10, 10, 81];
    if (setDifficulty() === 1) [columns, rows, mineCounter, minesDisplayed, unrevealedTiles] = [16, 16, 40, 40, 256];
    if (setDifficulty() === 2) [columns, rows, mineCounter, minesDisplayed, unrevealedTiles] = [30, 16, 99, 99, 480];  

    // Build DOM Grid
    var tile;

    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {            
            tile = createTile(x,y);
            grid.appendChild(tile);
        }
    }
    
    var style = window.getComputedStyle(tile);

    var width = parseInt(style.width.slice(0, -2));
    var height = parseInt(style.height.slice(0, -2));
    
    grid.style.width = (columns * width) + "px";
    grid.style.height = (rows * height) + "px";
}

function startGame() {
    reset();
    buildGrid();
    startTimer();
    updateRemainingMines(0);
    }

function smileyDown(param) {
    var smiley = document.getElementById("smiley");
    smiley.classList.add(`face_${param}`);
}

function smileyUp(param) {
    var smiley = document.getElementById("smiley");
    smiley.classList.remove(`face_${param}`);
}

function getCoordinates(tile) {
    let tileClass = tile.className;
    let [findx, findy, nums, x, y] = [true, false, false, "", ""];
 
    for (let i = 0; i < tileClass.length; i++) {
        let char = tileClass[i];
        if (char === '!') break;
        if (nums && findx) x+=char;
        if (nums && findy) y+=char;
        if (char === ':') nums = true;
        if (char === ',') {
            [nums, findx, findy] = [false, false, true];
        }
    }
    return [x,y];
}

function createTile(x,y) {
    var tile = document.createElement("div");
    tile.classList.add(`x:${x},y:${y}!`);
    tile.classList.add("tile");
    tile.classList.add("hidden");

    tile.addEventListener("auxclick", function(e) { e.preventDefault(); }); // Middle Click
    tile.addEventListener("contextmenu", function(e) { e.preventDefault(); }); // Right Click
    tile.addEventListener("mouseup", handleTileClick ); // All Clicks

    return tile;
}

function generateMines() {
    let [col, row] = [0,0];

    if (mineCounter === 10) [col, row] = [9, 9];
    if (mineCounter === 40) [col, row] = [16, 16];
    if (mineCounter === 99) [col, row] = [30, 16];
    
    for (let i = 0; i < mineCounter; i++) {
        let x = Math.floor(Math.random() * col);
        let y = Math.floor(Math.random() * row);

        if (document.getElementsByClassName(`x:${x},y:${y}!`)[0].classList.contains("isMine") || document.getElementsByClassName(`x:${x},y:${y}!`)[0].classList.contains("freeSpace")) {
            i--;
        } else {
            document.getElementsByClassName(`x:${x},y:${y}!`)[0].classList.add("isMine");
        }
    }
}

function adjacentTiles(x,y) {
    [x,y] = [Number.parseInt(x), Number.parseInt(y)];
    adjtiles = [];

    leftTop = document.getElementsByClassName(`x:${x-1},y:${y-1}!`)[0];
    midTop = document.getElementsByClassName(`x:${x},y:${y-1}!`)[0];
    rightTop = document.getElementsByClassName(`x:${x+1},y:${y-1}!`)[0];
    leftMid = document.getElementsByClassName(`x:${x-1},y:${y}!`)[0];
    rightMid = document.getElementsByClassName(`x:${x+1},y:${y}!`)[0];
    leftBottom = document.getElementsByClassName(`x:${x-1},y:${y+1}!`)[0];
    midBottom = document.getElementsByClassName(`x:${x},y:${y+1}!`)[0];
    rightBottom = document.getElementsByClassName(`x:${x+1},y:${y+1}!`)[0];

    if (leftTop && leftTop.classList.contains("hidden")) adjtiles.push(leftTop);
    if (midTop && midTop.classList.contains("hidden")) adjtiles.push(midTop);
    if (rightTop && rightTop.classList.contains("hidden")) adjtiles.push(rightTop);
    if (leftMid && leftMid.classList.contains("hidden")) adjtiles.push(leftMid);
    if (rightMid && rightMid.classList.contains("hidden")) adjtiles.push(rightMid);
    if (leftBottom && leftBottom.classList.contains("hidden")) adjtiles.push(leftBottom);
    if (midBottom && midBottom.classList.contains("hidden")) adjtiles.push(midBottom);
    if (rightBottom && rightBottom.classList.contains("hidden")) adjtiles.push(rightBottom);

    return adjtiles;
}

function revealTile(tile) {
    let [x,y] = getCoordinates(tile);
    let count = 0;
    let adjtiles = adjacentTiles(x,y);

    if (!tile.classList.contains("flag") && tile.classList.contains("hidden")) { 
        for (let i = 0; i < adjtiles.length; i++) {
            if(adjtiles[i].classList.contains("isMine")) count++;
        }
        tile.classList.remove("hidden");
        unrevealedTiles--;
        if (tile.classList.contains("isMine")) {
            unrevealedTiles++;
            tile.classList.add(`mine_hit`);
            return gameOver("lose");
        } else {
                tile.classList.add(`tile_${count}`)
                if (unrevealedTiles-mineCounter === 0) return gameOver("win");    
               }         
        if (!count) { // Recursively reveal tiles if there's no mines around it
            adjtiles.forEach(tile => {
                revealTile(tile);
            })
        }
    }
}

function handleTileClick(event) {

    const tile = event.target;
    let [x,y] = getCoordinates(tile);
    const adjtiles = adjacentTiles(x,y);
    // Left Click
    if (event.which === 1 && tile.classList.contains("hidden")) {
        if (!document.getElementsByClassName(`x:${0},y:${0}!`)[0].classList.contains("generated")) {
            for (let i = 0; i < adjtiles.length; i++) {
                adjtiles[i].classList.add("freeSpace");
            }
            tile.classList.add("freeSpace");
            generateMines();
            document.getElementsByClassName(`x:${0},y:${0}!`)[0].classList.add('generated');
        }    
        revealTile(tile);
    }
    // Middle Click
    else if (event.which === 2 && !tile.classList.contains("hidden")) {
        let [tileClass, num, flagCount] = [tile.className, null, 0];
        for (let i = 0; i < tileClass.length; i++) {
            if (tileClass[i] === "_") {
                num = tileClass[i+1];
            }
        }
        adjtiles.forEach(tile => {
            if (tile.classList.contains("flag")) {
                flagCount++
            }
        })
        if (flagCount === Number.parseInt(num)) {
        adjtiles.forEach(tile => {
            revealTile(tile);
            })
        }
    }
    // Right Click
    else if (event.which === 3 && tile.classList.contains("hidden")) {
        if (!tile.classList.contains("flag")) {
            tile.classList.add("flag");
            updateRemainingMines(-1);
        } else {
            tile.classList.remove("flag");
            updateRemainingMines(+1);
        }
    }
}
function setDifficulty() {
    var difficultySelector = document.getElementById("difficulty");
    var difficulty = difficultySelector.selectedIndex;
    return difficulty;
}
function startTimer() {
    timeValue = 0;
    time++;
    intervalId = window.setInterval(onTimerTick, 1000);
}
function onTimerTick() {
    timeValue++;
     updateTimer();
}
function updateTimer() {
    document.getElementById("timer").innerHTML = timeValue;
}
function updateRemainingMines(change) {
    minesDisplayed+=change;
    document.getElementById("flagCount").innerHTML = minesDisplayed;
}
function reset() {
    document.getElementById("result").innerHTML = ""; 
    document.getElementById("minefield").style.pointerEvents = "all";  
    var smiley = document.getElementById("smiley");
    if (smiley.classList.contains('face_lose')) smiley.classList.remove('face_lose');
    if (smiley.classList.contains('face_win')) smiley.classList.remove('face_win');
    if (time > 0) {
    window.clearInterval(intervalId);  
    intervalId = null;
    time = 0;
    }
}
function gameOver(result) {
    document.getElementById("minefield").style.pointerEvents = "none";
    window.clearInterval(intervalId);  
    intervalId = null;
    var smiley = document.getElementById("smiley");
    smiley.classList.add(`face_${result}`);
    if (result === "lose") {
        document.getElementById("result").innerHTML = "Game over. You've lost.";
    }
    if (result === "win") {
        const score = document.getElementById('timer').innerHTML;
        document.getElementById("result").innerHTML = `GG you've won. Your score is: ${score}`;
    }
}