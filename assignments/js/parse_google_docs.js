function scapeHyperLinks(text) {
    text = text.replace(/{{/g, "<a href=\"");
    text = text.replace(/\#\$/g, "\">");
    text = text.replace(/}}/g, "</a>");
    return text;
}

// not tested yet
function scapeNewLines(text) {
    text = text.replace(/\n/g, "<br>");
    return text;
}

function parseGDOCS(json){
    var dataEntryArr = json.feed.entry;
    var i;
    var simpleArr = [];
    for(var i = 0; i < dataEntryArr.length; i++) {
        var row = {};
        row.subject = dataEntryArr[i].gsx$subject.$t;
        row.title = dataEntryArr[i].gsx$title.$t;
        var tmpDate = new Date(dataEntryArr[i].gsx$date.$t + "T" + dataEntryArr[i].gsx$time.$t + "Z");
        // subtract two hours (2 * 60 * 60 * 1000) to be in UTC
        row.date = new Date(tmpDate.getTime() - 7200000);
        row.description = scapeNewLines(scapeHyperLinks(dataEntryArr[i].gsx$description.$t));
        simpleArr.push(row);
    }
    my_parse(simpleArr);
    display();
}

function parseEventsGDOCS(json){
    var dataEntryArr = json.feed.entry;
    if(dataEntryArr != null) {
        var nowTime = (new Date).getTime();
        for(var i = 0; i < dataEntryArr.length; i++) {
            var event = {};
            event.date = new Date(dataEntryArr[i].gsx$date.$t + "T" + dataEntryArr[i].gsx$time.$t + "Z");
            event.caption = scapeHyperLinks(dataEntryArr[i].gsx$caption.$t);
            if(event.date.getTime() >= nowTime) {
                mainEvent = event;
                updateMainEvent();
                return;
            }
        }
    }
    displayMainEvent(null);
}

function parseNextDayTableGDOCS(json) {
  var dataEntryArr = json.feed.entry;
  if(dataEntryArr != null) {
      var data = [];
      var cnt = [0, 0, 0, 0, 0, 0, 0];

      for(var i = 0; i < dataEntryArr.length; i++) {
          var period = {};
          period.day = dataEntryArr[i].gsx$day.$t;
          period.enabled = dataEntryArr[i].gsx$enabled.$t === "fakss" ? false : true;
          period.num = Number(dataEntryArr[i].gsx$period.$t);
          period.subject = dataEntryArr[i].gsx$subject.$t;
          period.ptype = dataEntryArr[i].gsx$type.$t;
          period.notes = dataEntryArr[i].gsx$note.$t;
          var isNextDay = dataEntryArr[i].gsx$confirmed.$t;

          if (period.day && period.enabled && period.num && period.subject &&
              period.ptype) {
              period.dayID = getDayID(period.day);
              cnt[period.dayID]++;
              period.notes = scapeNewLines(scapeHyperLinks(period.notes));
              period.isNextDay = (isNextDay === "nextDay");
              data.push(period);
          }
      }
      data.sort(function(a, b){
          if (a.dayID != b.dayID) return a.dayID - b.dayID;
          return a.num - b.num;
      });
      for(var i = 0, j = 0; i < data.length; i++) {
          if (i + 1 === data.length || (i + 1 < data.length && data[i].day !== data[i+1].day)) {
              data[i].last = true;
              data[Math.floor((i+j)/2)].mid = true;
              j = i + 1;
          }
      }
      nextDayTable = data;

      for (var i = 0; i < 7; i++) {
          nextDay = (nextDay + i) % 7;
          if (cnt[nextDay] !== 0)
            break;
      }
  }
}

function getDate(d){
    if (d === undefined || d.getDay === undefined || d.getDay() != d.getDay())
        return undefined;
    return " " + WEEK_DAYS[(d.getDay()+1)%7] + " - " + d.getDate() + "/" + (d.getMonth()+1) + " - " + d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2);
}

function parseNextDayNotesGDOCS(json) {
  var dataEntryArr = json.feed.entry;
  if(dataEntryArr != null) {
      var data = [];
      for(var i = 0; i < dataEntryArr.length; i++) {
          var post = {};
          post.body = scapeNewLines(scapeHyperLinks(dataEntryArr[i].gsx$body.$t));
          try {
            post._date = new Date(dataEntryArr[i].gsx$date.$t + ' GMT+0200');
            post.date = getDate(post._date);
          } catch (e) {}
          if(post.body && post.date) {
            data.push(post);
          }
      }
      data.sort(function(a, b){
          return b._date - a._date;
      });
      generalNotes = data;
  }
}
