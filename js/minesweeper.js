
var time = 0;
var difficulty;
function buildGrid() {

    // Fetch grid and clear out old elements.
    var grid = document.getElementById("minefield");
    grid.innerHTML = "";
    
    var columns = 9;
    var rows = 9;   
    var mineCounter = 10; 

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

    //Randomly create mines. Set counter to 10, and subtract 
    // Build DOM Grid
    var tile;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {
            let isMine = Math.round(Math.random());
            if(isMine) mineCounter--;
            if (mineCounter < 1) isMine = 0;
            
            tile = createTile(x,y, isMine);
            grid.appendChild(tile);
        }
    }
    
    var style = window.getComputedStyle(tile);

    var width = parseInt(style.width.slice(0, -2));
    var height = parseInt(style.height.slice(0, -2));
    
    grid.style.width = (columns * width) + "px";
    grid.style.height = (rows * height) + "px";
}

function createTile(x,y, isMine) {
    var tile = document.createElement("div");
    tile.classList.add(`x:${x},y:${y}!`);
    tile.classList.add("tile");
    tile.classList.add("hidden");
    isMine ? tile.setAttribute("isMine",true) : tile.setAttribute("isMine",false)

    tile.addEventListener("auxclick", function(e) { e.preventDefault(); }); // Middle Click
    tile.addEventListener("contextmenu", function(e) { e.preventDefault(); }); // Right Click
    // tile.addEventListener("mouseup", (event) => handleTileClick(event,x, y) ); // All Clicks
    tile.addEventListener("mouseup", handleTileClick ); // All Clicks
    return tile;
}

function startGame() {

    buildGrid();
    startTimer();
    }

function smileyDown() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_down");
}

function smileyUp() {
    var smiley = document.getElementById("smiley");
    smiley.classList.remove("face_down");
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
    return {x,y}
}
function handleTileClick(event) {

    const tile = event.target;
    const {x,y} = getCoordinates(tile);

    let leftTop = document.getElementsByClassName(`x:${x-1},y:${y-1}`);
    let middleTop = document.getElementsByClassName(`x:${x},y:${y-1}`);
    let rightTop = document.getElementsByClassName(`x:${x+1},y:${y-1}`);
    let leftCenter = document.getElementsByClassName(`x:${x-1},y:${y}`);
    let rightCenter = document.getElementsByClassName(`x:${x+1},y:${y}`);
    let leftBottom = document.getElementsByClassName(`x:${x-1},y:${y+1}`);
    let middleBottom = document.getElementsByClassName(`x:${x},y:${y+1}`);
    let rightBottom = document.getElementsByClassName(`x:${x+1},y:${y+1}`);

    // Left Click
    if (event.which === 1) {

       if (!tile.classList.contains("flag")) {
        tile.classList.remove("hidden");
        tile.classList.add("tile_1");
        tile.removeEventListener("mouseup", handleTileClick);
       }
    }
    // Middle Click
    else if (event.which === 2) {
        //TODO try to reveal adjacent tiles
    }
    // Right Click
    else if (event.which === 3) {
        
        if (tile.classList.contains("hidden")) {
            tile.classList.remove("hidden");
            tile.classList.add("flag");
        } else {
            tile.classList.remove("flag");
            tile.classList.add("hidden");
        }
    }
}

function setDifficulty() {
    var difficultySelector = document.getElementById("difficulty");
    difficulty = difficultySelector.selectedIndex;
    //TODO implement me
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

/*
Set a function to generate 10 fields to randomly be mines (recursively to prevent duplicates) isMine:true, false
When someone clicks a tile, a count on the tiles around is done to display the number of mines around it
or if it is a mine

Right now mines are mostly true in the first few squres, which you don't want. You want more true randomness 

Get mines a different way that uses recursion and doesn't make the first click a mine. Have a generateMine function on 
first click


Loop through X values, then loop through Y values searching for where the X and y elements are the ones you want. Then 
reveal them. This is not ideal. 
A better way would be if you could do an O(1) get by className


Now you need to generate mines recursively after the player does his first click
*/