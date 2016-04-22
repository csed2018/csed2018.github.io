var mainEvent = null;

function millisecondsToDate (time) {
    if (time < 0) {
        time = 0;
        window.location.reload(false);
    }
    time = Math.floor(time/1000);
    var day = Math.floor(time/(24*60*60));
    time = time % (24*60*60);
    var hour = Math.floor(time/(60*60));
    time = time % (60*60);
    var minute = Math.floor(time/60);
    return {
        minutes : minute,
        hours : hour,
        days : day
    };
}

function aproxDate (date) {
    var arr = [
        [date.days, "day"],
        [date.hours, "hour"],
        [date.minutes, "minute"]
    ];
    var i = 0
    for(; i < arr.length - 1; ++i) {
        if (arr[i][0] > 0)
            break;
    }
    if(arr[i][0] != 1)
        arr[i][1] += "s";
    if(arr[i+1][0] != 1)
        arr[i+1][1] += "s";
    return {
        major : arr[i][0],
        majorString : arr[i][1],
        minor : arr[i+1][0],
        minorString : arr[i+1][1]
    };
}
//1000 will  run it every 1 secon
var INTERVAL = 30 * 1000;
var counter = setInterval(updateActiveAssignmentsCounters, INTERVAL);

function updateActiveAssignmentsCounters() {
    var nowTime = (new Date()).getTime();
    for (var i = 0; i < active.length; ++i) {
        var time = active[i].date.getTime() - nowTime;
        var myDate = millisecondsToDate(time);
        displayActiveCounter(i, aproxDate(myDate));
    }
}

var mainEventCounter = setInterval(updateMainEvent, INTERVAL);

function updateMainEvent() {
    if(mainEvent != null) {
        var time = mainEvent.date.getTime() - (new Date()).getTime();
        var myDate = millisecondsToDate(time);
        displayMainEvent(aproxDate(myDate));
    }
}
