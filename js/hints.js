// Called when hint button is clicked
function setHintModeOn() {
    if (!gGame.isOn || gGame.hints === 0 || gGame.isHintOn || gGame.revealedCount === 0) return;
    gGame.isHintOn = true;
    toggltHintModeNotification();
}

// Show the hint for 1 sec
function showHint(board, coords) {
    let cellI = coords.i;
    let cellJ = coords.j;

    // Let's reveal the clicked cell + neighbours for 1 sec
    for (let i = cellI - 1; i <= cellI + 1; i++) {

        if (i < 0 || i >= board.length) continue;

        for (let j = cellJ - 1; j <= cellJ + 1; j++) {

            if (j < 0 || j >= board[0].length) continue;
            if (board[i][j].isShown) continue;

            toggleCell({ i: i, j: j }); // If a cell is not shown, show it..
            setTimeout(() => {
                toggleCell({ i: i, j: j }); // .. After 1 sec, hide it again
            }, 1000);
        }
    }

    setEmoji(EMOJI.hint);
    renderHintButton(--gGame.hints);

    // After 1 sec, Turn off hint mode and hide notification
    setTimeout(() => {
        gGame.isHintOn = false;
        toggltHintModeNotification();
        setEmoji(EMOJI.normal);
    }, 1000);
}

// Toggles the visibility of the hint mode notification
function toggltHintModeNotification() {
    document.querySelector('.hint-mode').classList.toggle('hide');
}

// Re render hint button with amount of hints left
function renderHintButton(hints) {
    document.querySelector('.hints-left').innerText = hints;
}