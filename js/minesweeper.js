
var time = 0;
var difficulty = 0;
var minesGenerated = false;
var mineCounter = 10;

function buildGrid() {

    // Fetch grid and clear out old elements.
    var grid = document.getElementById("minefield");
    grid.innerHTML = "";
    
    var columns = 9;
    var rows = 9;   

    if (difficulty === 1) {
        columns = 16;
        rows = 16;    
        mineCounter = 40;
    }

    if (difficulty === 2) {
        var columns = 30;
        var rows = 16;   
        mineCounter = 99;
    }

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

function createTile(x,y) {
    var tile = document.createElement("div");
    tile.classList.add(`x:${x},y:${y}!`);
    tile.classList.add("tile");
    tile.classList.add("hidden");

    tile.addEventListener("auxclick", function(e) { e.preventDefault(); }); // Middle Click
    tile.addEventListener("contextmenu", function(e) { e.preventDefault(); }); // Right Click
    // tile.addEventListener("mouseup", (event) => handleTileClick(event,x, y) ); // All Clicks
    tile.addEventListener("mouseup", handleTileClick ); // All Clicks
    return tile;
}

function startGame() {

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
    let findx = true;
    let findy = false;
    let nums = false;
    let x = "";
    let y = "";
    for (let i = 0; i < tileClass.length; i++) {
        let char = tileClass[i];
        if (char === '!') break;
        if (nums && findx) x+=char;
        if (nums && findy) y+=char;
        if (char === ':') nums = true;
        if (char === ',') {
            nums = false; 
            findx = false;
            findy = true;
        }
    }
    return [x,y]
}

function generateMines() {
    let col;
    let row;

    if (mineCounter === 10) [col, row] = [9, 9];
    if (mineCounter === 40) [col, row] = [16, 16];
    if (mineCounter === 99) [col, row] = [30, 16];
    
    x = Math.floor(Math.random() * col);
    y = Math.floor(Math.random() * row);
    if (document.getElementsByClassName(`x:${x},y:${y}!`)[0].classList.contains("isMine") || document.getElementsByClassName(`x:${x},y:${y}!`)[0].classList.contains("freeSpace")) {
        return generateMines();
    }
    return [x,y];
}

function adjacentTiles(x,y) {
    x = Number.parseInt(x);
    y = Number.parseInt(y);
    let adjtiles = [];

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
    const adjtiles = adjacentTiles(x,y);

    //Make it so that once you click on a tile, it will get the count of bombs next to it, then recursively 
    // reveal all adjacent tiles if there is no bomb, then continue to reveal adjacent tiles to the ones that have no bombs 
    // around it
    if (!tile.classList.contains("flag")) { 
        for (let i = 0; i < adjtiles.length; i++) {
            if(adjtiles[i].classList.contains("isMine")) count++;
        }
        tile.classList.remove("hidden");
        tile.classList.contains("isMine") ? tile.classList.add(`mine_hit`) : tile.classList.add(`tile_${count}`)
        // tile.removeEventListener("mouseup", handleTileClick);
        
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

        if (!minesGenerated) {
            for (let i = 0; i < adjtiles.length; i++) {
                adjtiles[i].classList.add("freeSpace");
            }
            tile.classList.add("freeSpace");
            for (let i = 0; i < mineCounter; i++) {
                const [x1,y1] = generateMines();
                document.getElementsByClassName(`x:${x1},y:${y1}!`)[0].classList.add("isMine");
            }
            minesGenerated = true;
        }    
        revealTile(tile, false);


    }
    // Middle Click
    else if (event.which === 2 && !tile.classList.contains("hidden")) {
        //Check how many flags are around the tile and make sure it's the same as the tile number, then reveal adjacent tiles
        // but not recursively?? Just reveal those specific tiles I think
        let tileClass = tile.className;
        let num = null;
        let flagCount = 0;
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
        console.log(flagCount,Number.parseInt(num))
        if (flagCount === Number.parseInt(num)) {
        adjtiles.forEach(tile => {
            revealTile(tile);
        })
    }
        }
    // Right Click
    else if (event.which === 3 && tile.classList.contains("hidden"))
    {
        
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
    difficulty = difficultySelector.selectedIndex;
}

function startTimer() {
    timeValue = 0;
    window.setInterval(onTimerTick, 1000);
}

function onTimerTick() {
    timeValue++;
    updateTimer();
}

function updateTimer() {
    document.getElementById("timer").innerHTML = timeValue;
}
function updateRemainingMines(change) {
    mineCounter+=change;
    document.getElementById("flagCount").innerHTML = mineCounter;
}
/*

Make sure everything works if you restart by clicking middle smiley. (Needs to generate new mines);
*/


// Remove the getCoordinates function and instead use closures to pass the x,y. Somehow figure out how you can 
// remove the event listener.

// If you hit a bomb, end the game