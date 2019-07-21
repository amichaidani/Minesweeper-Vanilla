// ***********
// Global vars
// ***********

var gGame; // Game state - initiated in initGame()
var gBoard; // Board model

// Game icons
var MINE = '💣';
var FLAG = '🚩';

// Top bar emoji index
var EMOJI = {
    start: '💪',
    normal: '😋',
    lost: '🤬',
    won: '😎',
    hint: '🧐'
}

// ***********
// FUNCTIONS
// ***********
// On body load
function initPage() {
    renderLevelsButtons();
    initGame();
}

// initialize game
function initGame() {
    // Reset game Globals
    gGame = {
        isOn: true,
        revealedCount: 0,
        markedCount: 0,
        isHintOn: false,
        hints: 3
    }
    // Hide the 'play again' text
    hidePlayAgainMsg();
    // Clear game Timer
    timerClear();
    // Reset the hints button and hide the notification
    renderHintButton(gGame.hints)
    document.querySelector('.hint-mode').classList.add('hide');
    // Set emoji to normal state
    setEmoji(EMOJI.normal);
    // Build and render the game board
    gBoard = buildBoard();
    renderBoard(gBoard);
}

// called upon first click in cellClicked
function gameStart(startCoord) {
    placeMines(gBoard, startCoord);
    renderBoard(gBoard);
    timerStart();

    // Emoji time!
    setEmoji(EMOJI.start)
    setTimeout(() => {
        setEmoji(EMOJI.normal);
    }, 600);
}

// Build a gameboard and return it as array
function buildBoard() {
    let board = [];
    let boardSize = gLevel.curr.SIZE;

    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            board[i][j] = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board;
}

// Build HTML string of the table and inject it to the DOM
function renderBoard(board) {
    let elBoardContainer = document.querySelector('.board-container');
    let boardHTML = '<table><tbody>'; // Open table tag

    for (let i = 0; i < board.length; i++) {
        boardHTML += '<tr>'; // Open TR tag

        for (let j = 0; j < board[0].length; j++) {
            let tdId = `cell-${i}-${j}`;
            let currCell = board[i][j];
            let symbol;
            let countClass;

            if (currCell.isMine) { // If cell is mine - set the right symbol
                symbol = MINE;
            } else {
                if (currCell.minesAroundCount) { // if there is a negs count inside cell 
                    symbol = currCell.minesAroundCount;
                    countClass = 'class="count-' + currCell.minesAroundCount + '"'; // Give proper class 
                }
                else { // If cell is floor
                    symbol = '';
                    countClass = ' ';
                }
            }
            // Create the template string for current cell;
            boardHTML += `<td id="${tdId}" ${countClass} onclick="cellClicked(this)" oncontextmenu="cellMarked(this)">
                            ${symbol}
                            <div class="cell-hidden">
                                <div class="flag">${FLAG}</div>
                            </div>
                          </td>` // Create TD
        }

        boardHTML += '</tr>'; // Close TR tag
    }
    boardHTML += '</table></tbody>'; // Close table tag
    elBoardContainer.innerHTML = boardHTML // Inject the HTML str to the DOM
}

// Sets mine's count inside mine's neighbors objects
function setMinesNegsCount(board, mineCoord) {
    let cellI = mineCoord.i;
    let cellJ = mineCoord.j;

    for (let i = cellI - 1; i <= cellI + 1; i++) {

        if (i < 0 || i >= board.length) continue;

        for (let j = cellJ - 1; j <= cellJ + 1; j++) {

            if (j < 0 || j >= board[0].length) continue;
            if (i === cellI && j === cellJ) continue;

            let cell = board[i][j];
            if (!cell.isMine) cell.minesAroundCount++;
        }
    }
    return;
}

// When a TD is clicked
function cellClicked(elCell) {
    if (!gGame.isOn) return; // Died / won? return

    let cellCoords = getCellCoord(elCell.id);
    let currCell = gBoard[cellCoords.i][cellCoords.j];
    if (currCell.isShown) return; // If already shown - do nothing

    // If hint mode is on, show hint
    if (gGame.isHintOn) {
        showHint(gBoard, cellCoords);
        return;
    }

    // If marked, do nothing (placed here to allow hint for marked cells)
    if (currCell.isMarked) return;

    // If clicked on a mine, end game and return
    if (gBoard[cellCoords.i][cellCoords.j].isMine) {
        clickedOnMine();
        return;
    }

    // If a cell is legit, reveal and expand it, check for victory
    if (gGame.revealedCount === 0) gameStart(cellCoords); // If first click, start the game!
    
    // CR - you should expand show only if neighbours mines-count === 0 - only on empty cell !
    // CR = > currCell.minesAroundCount === 0
    expandShown(gBoard, cellCoords);
    checkVictory();
}

// If a clicked cell is safe, reveal and expand
function expandShown(board, coords) {
    console.log(coords)
    revealCell(board, coords);
    let cellI = coords.i;
    let cellJ = coords.j;
// CR - for recursion = need to put 'end condition' before entering the loops
// CR -> example - if (board[coords.i][coords.j].minesAroundCount > 0) return
    for (let i = cellI - 1; i <= cellI + 1; i++) {

        if (i < 0 || i >= board.length) continue;

        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === cellI && j === cellJ) continue;

            let cell = board[i][j];
            if (cell.isMine || cell.isShown || cell.isMarked) continue;

            if (cell.minesAroundCount) {
                revealCell(board, { i: i, j: j });
                continue;
            }
            revealCell(board, { i: i, j: j });
            expandShown(board, { i: i, j: j });
        }
    }
}

// Reveals a cell in model + DOM
function revealCell(board, coords) {
    if (board[coords.i][coords.j].isShown) return;
    gGame.revealedCount++; // +1 to the global revealed count! Yay!

    let cell = board[coords.i][coords.j]; // Get the cell object from the MODEL
    cell.isShown = true; // 'Reveal' in MODEL

    toggleCell(coords);
}

// Gets a cell coords, toggles 'hide' class on the overlay div
function toggleCell(coords) {
    let targetElCellId = '#cell-' + coords.i + '-' + coords.j;
    let elCell = document.querySelector(targetElCellId); // Get the element from the DOM
    // toggle the class 'cell-hidden'
    elCell.querySelector('.cell-hidden').classList.toggle('hide');
}

// Called on right click to mark a cell (suspected to be a mine)
function cellMarked(elCell) {
    // return if game hasnt started or in hint mode
    if (gGame.revealedCount === 0 || !gGame.isOn || gGame.isHintOn) return;

    let cellCoords = getCellCoord(elCell.id); // Get the clicked cell coords object {i:i,j:j}
    cell = gBoard[cellCoords.i][cellCoords.j]

    if (cell.isShown) return; // Already shown? do nothing

    // If not marked, then mark
    if (!cell.isMarked) {
        gGame.markedCount++;
        cell.isMarked = true;
        elCell.querySelector('.flag').style.display = 'block';
        checkVictory();
    } else {
        gGame.markedCount--;
        cell.isMarked = false;
        elCell.querySelector('.flag').style.display = 'none';

    }
}

// Game ends when all mines are marked 
// and all the other cells are shown
function checkVictory() {
    if (gGame.revealedCount === (gLevel.curr.SIZE ** 2) - gLevel.curr.MINES
        && gGame.markedCount === gLevel.curr.MINES) {
        gameEnd(EMOJI.won);
        updateHighScore(gTime.totalTime);
    }
}

// If clicked on mine
function clickedOnMine() {
    revealMines(gBoard); // Reveal all mines on board
    gameEnd(EMOJI.lost);
}

// Reveal all mines on board
function revealMines(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                revealCell(board, { i: i, j: j }, MINE);
            }
        }
    }
}

// Terminate game if lost or won, gets an emoji status as paramater
function gameEnd(emoji) {
    gGame.isOn = false;
    timerStop();
    setEmoji(emoji);
    renderHintButton(0);
    showPlayAgainMsg();
}

// Place mines in random cells, according to game's level
function placeMines(board, startCoord) {
    for (let i = 0; i < gLevel.curr.MINES; i++) {
        // Get random mine coord

        // CR - better call it - randMineCoord
        let mineCoord = getRandomEmptyCell(board);
        // If random mine placed on starting point, get another
        while (mineCoord.i === startCoord.i && mineCoord.j === startCoord.j) {
            mineCoord = getRandomEmptyCell(board);
        }

        board[mineCoord.i][mineCoord.j].isMine = true; // Place mine on model
        board[mineCoord.i][mineCoord.j].minesAroundCount = null; // If theres a count in chosen cell, delete it
        setMinesNegsCount(board, mineCoord); // Set count for negs of this current mine
    }
    // CR - no need to add empty return at the end of a function
    return;
}

// Gets a string such as: 'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var coord = {};
    coord.i = +strCellId.substring(5, strCellId.lastIndexOf('-'));
    coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
    return coord;
}

// Return a random EMPTY cell in the board
function getRandomEmptyCell(board) {
    let randCoord = {
        i: getRandomIntInclusive(0, board.length - 1),
        j: getRandomIntInclusive(0, board[0].length - 1),
    }

    while (board[randCoord.i][randCoord.j].isMine) {
        randCoord = {
            i: getRandomIntInclusive(0, board.length - 1),
            j: getRandomIntInclusive(0, board[0].length - 1),
        }
    }
    return randCoord;
}

// Change the status emoji in the DOM
function setEmoji(emoji) {
    document.querySelector('.status-emoji').innerText = emoji;
}

function showPlayAgainMsg() {
    document.querySelector('.play-again-msg').classList.remove('not-visible')
}

function hidePlayAgainMsg() {
    document.querySelector('.play-again-msg').classList.add('not-visible')
}

