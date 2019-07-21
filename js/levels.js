// ***********
// Global vars
// ***********

// Game level
var gLevel = {
    curr: {},
    levels: []
}
// Create new levels
createLevel(4, 2);
createLevel(6, 5);
createLevel(8, 15);
createLevel(20, 40);

gLevel.curr = gLevel.levels[0]; // Set initial level to level 1

// ***********
// FUNCTIONS
// ***********
// Render levels buttons
function renderLevelsButtons() {
    let strHTML = '';
    for (let i = 0; i < gLevel.levels.length; i++) {
        strHTML += ` <button ${(gLevel.curr.level === i + 1) ? 'class="chosen-level"' : ''} data-level="${i + 1}" onclick="changeLevel(this)" onmouseover="showLevelInfo(this)" onmouseout="hideLevelInfo()">Level ${i + 1}</button>`
    }
    // Render buttons to DOM
    let elLevelButtonsDiv = document.querySelector('.level-buttons');
    elLevelButtonsDiv.innerHTML = strHTML;
}

// Change the global level properties, by user demand
function changeLevel(elBtn) {
    // Remove bold style from previous level button
    let elBtnPrevious = document.querySelector('[data-level="' + gLevel.curr.level + '"]');
    elBtnPrevious.classList.remove('chosen-level');
    
    // Match game's level to chosen option, and restart
    let chosenLevel = +elBtn.dataset.level;
    gLevel.curr = gLevel.levels[chosenLevel - 1]
    elBtn.classList.add('chosen-level');
    initGame(); // Restart game
}

// Create a new game level
function createLevel(size, mines) {
    gLevel.levels.push({ level: gLevel.levels.length + 1, SIZE: size, MINES: mines })
}

// Show level info when hovering on level button
function showLevelInfo(elBtn) {
    let level = gLevel.levels[(+elBtn.dataset.level) - 1];
    document.querySelector('.level-info').innerText = `Board: ${level.SIZE}*${level.SIZE}, Mines: ${level.MINES}`;
}

// Hide level info
function hideLevelInfo(elBtn) {
    document.querySelector('.level-info').innerText = '';
}