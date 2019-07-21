var gTimerInterval;
var gTime = {
    start: null,
    totalTime: null
}

// Start timer
function timerStart() {
    gTime.start = Date.now();
    gTimerInterval = setInterval(function () {
        let clock = Date.now() - gTime.start;
        document.querySelector(".timer").innerHTML = formatTime(clock);
    }, 10)
}

// Stop timer
function timerStop() {
    gTime.totalTime = Date.now() - gTime.start;
    clearInterval(gTimerInterval);
}

// Clear Timer
function timerClear() {
    clearInterval(gTimerInterval);
    document.querySelector(".timer").innerHTML = '00:00';
}

// Format Date
function formatTime(timeStamp) {
    // var milli = Math.floor((timeStamp / 10) % 100); -- Millies are too hectic for mine sweeper!
    var sec = Math.floor((timeStamp / 1000) % 60);
    var min = Math.floor((timeStamp / 1000 / 60) % 60);
    var formattedTime = ((min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec);
    return formattedTime;
}