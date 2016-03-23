function parseGDOCS(json){
    var dataEntryArr = json.feed.entry;
    var i;
    var simpleArr = [];
    for(i = 0; i < dataEntryArr.length; i++) {
        var row = {};
        row.subject = dataEntryArr[i].gsx$subject.$t;
        row.title = dataEntryArr[i].gsx$title.$t;
        row.date = new Date(dataEntryArr[i].gsx$date.$t + "T" + dataEntryArr[i].gsx$time.$t);
        row.description = dataEntryArr[i].gsx$description.$t;
        row.description = row.description.replace(/{{/g, "<a href=\"");
        row.description = row.description.replace(/\#\$/g, "\">");
        row.description = row.description.replace(/}}/g, "</a>");
        simpleArr.push(row);
    }
    my_parse(simpleArr);
    display();
}