function scapeHyperLinks(text) {
    text = text.replace(/{{/g, "<a href=\"");
    text = text.replace(/\#\$/g, "\">");
    text = text.replace(/}}/g, "</a>");
    return text;
}

// not tested yet
function scapeNewLines(text) {
    text = text.replace(/\n/g, "<br>\"");
    return text;
}

function parseGDOCS(json){
    var dataEntryArr = json.feed.entry;
    var i;
    var simpleArr = [];
    for(i = 0; i < dataEntryArr.length; i++) {
        var row = {};
        row.subject = dataEntryArr[i].gsx$subject.$t;
        row.title = dataEntryArr[i].gsx$title.$t;
        row.date = new Date(dataEntryArr[i].gsx$date.$t + "T" + dataEntryArr[i].gsx$time.$t + "Z");
        row.description = scapeHyperLinks(dataEntryArr[i].gsx$description.$t);
        simpleArr.push(row);
    }
    my_parse(simpleArr);
    display();
}

function parseEventsGDOCS(json){
    var dataEntryArr = json.feed.entry;
    if(dataEntryArr != null) {
        var i;
        var nowTime = (new Date).getTime();
        for(i = 0; i < dataEntryArr.length; i++) {
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
