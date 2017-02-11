var active = [];
var past = [];
var this_week = [];
var tomorrow = [];

var DAY = 86400000;
var WEEK_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                 "Friday"];
var now = new Date();
var tomorrow_date = new Date(now.getTime() + DAY);
var week_date = new Date(now.getTime() + 6*DAY);

function isActive(arg){
    return (arg.getTime() > now.getTime());
}

function inThisWeek(arg){
    return (arg.getTime() > now.getTime() && arg.getTime() <= week_date.getTime());
}

function inTomorrow(arg){
    return (arg.getTime() > now.getTime() && arg.getTime() <= tomorrow_date.getTime());
}

function getDate(d){
    return " " + WEEK_DAYS[(d.getDay()+1)%7] + " - " + d.getDate() + "/" + (d.getMonth()+1) + " - " + d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2);
}

function my_parse(arr){
    // console.log("start filtering the array");
    var i;
    for(i = 0; i < arr.length; i++) {
        if (isActive(arr[i].date)){
            active.push(arr[i]);
        } else {
            past.push(arr[i]);
        }
    }

    active.sort(function(a, b){
        var aDate = a.date;
        var bDate = b.date;
        return (aDate.getTime() - bDate.getTime());
    });

    // filter tommorow and this week tasks
    for(i=0; i < active.length; i++){
        if(inThisWeek(active[i].date)){
            active[i].index = i;
            this_week.push(active[i]);
            if(inTomorrow(active[i].date)){
                tomorrow.push(active[i]);
            }
        }
    }

    past.sort(function(a,b){
        var aDate = a.date;
        var bDate = b.date;
        return (bDate.getTime() - aDate.getTime());
    });
}


function display_list(divID, arr, gethtml){
    var text = "";
    for(i = 0; i < arr.length; i++) {
        text += gethtml(arr[i], i);
    }
    var element = document.getElementById(divID);
    element.innerHTML = text;
}

function display_number(divID, arr){
    var element = document.getElementById(divID);
    var num = arr.length;
    element.innerHTML = num;
}


function display_active_timeline(){
    try {
        document.getElementById("tip_active_list").innerHTML = "Timeline";
    } catch (err){}
    document.getElementById("active_list_header").innerHTML = " Timeline ";
    var element = document.getElementById("active_list");
    element.innerHTML = "<ul id = \"active_timeline\" class=\"timeline\"></ul>";
    display_list("active_timeline", active, function(item, index){
            var inverted = "";
            if(index%2 == 1){
                inverted = "class=\"timeline-inverted\"";
            }
            var text1 = "<li id=\"as" + index + "\" " + inverted +"> \
                            <div class=\"timeline-badge\"><i class=\"fa fa-check\"></i> \
                            </div> \
                            <div class=\"timeline-panel\"> \
                                <div class=\"timeline-heading\"> \
                                    <h4 class=\"timeline-title\">"; // title
            var text2 =             "</h4>\
                                    <p><small class=\"text-muted\"><i class=\"fa fa-clock-o\"></i>"; // deadline
            var text3 =            "</small> --\
                                    <small class=\"text-muted\" id = \"dc"+index+"\"></small></p> \
                                </div> \
                                <div class=\"timeline-body\"><p>" // description;
            var text4 = "          </p>\
                                </div>\
                            </div>\
                        </li>";
            return text1 + "[" + item.subject + "] " + item.title + text2 + getDate(item.date) + "" + text3 + item.description + text4;
        });
    updateActiveAssignmentsCounters();
}

function display_active_table(){
    try {
        document.getElementById("tip_active_list").innerHTML = "Table";
    } catch (err){}
    document.getElementById("active_list_header").innerHTML = " Table ";
    var element = document.getElementById("active_list");
    element.innerHTML = "<table class=\"table table-striped table-bordered table-hover\">\
                            <thead>\
                                <tr>\
                                    <th>Subject</th>\
                                    <th>Title</th>\
                                    <th>Deadline</th>\
                                    <th>Description</th>\
                                </tr>\
                            </thead>\
                            <tbody id = \"active_table_body\"></tbody>\
                        </table>";
    display_list("active_table_body", active, function(item, index){
            return "<tr id=\"as"+index+"\">\
                       <td>" + item.subject + "</td>\
                       <td>" + item.title + "</td>\
                       <td>" + getDate(item.date) +
                           "<h6 style=\"color:grey;\" id=\"dc"+ index + "\"></h6> </td>\
                       <td>" + item.description +  "</td>\
                   </tr>";
         });
    updateActiveAssignmentsCounters();
}

function display_recent(arr, header){
    try {
        document.getElementById("tip_recent_list").innerHTML = header;
    } catch (err){}
    var element = document.getElementById("recent_list_header");
    element.innerHTML = header;
    display_list("recent_list", arr, function(item, index){
        var text1 = "<a href=\"#as"+item.index+"\" onClick = \"glowActiveAssignment(" + index + ")\" class=\"list-group-item\"> <i class=\"fa fa-tasks fa-fw\"></i>";
        var text2 = "<span class=\"pull-right text-muted small\"><em>";
        var text3 = "</em></span></a>";
        return text1 + "[" + item.subject + "] " + item.title + text2 + getDate(item.date) + text3;
    });
}



function display_past(){
    display_list("past_list", past, function(item, index){
        var text1 = "<li class=\"left clearfix\">\
                        <span class=\"chat-img pull-left\">\
                            <i class=\"fa fa-tasks fa-fw\" style=\"font-size:200%\"/></i>\
                        </span>\
                        <div class=\"chat-body clearfix\">\
                            <div class=\"header\">\
                                <strong class=\"primary-font\">";
        var text2 =            "</strong>\
                                <small class=\"pull-right text-muted\">\
                                    <i class=\"fa fa-clock-o fa-fw\"></i>";
        var text3 =            "</small></div><p>";
        var text4 =            "</p> </div> </li>";
        return text1 + "[" + item.subject + "] " + item.title + text2 + getDate(item.date) + text3 + item.description + text4;
    });
}

var prevActiveAssignment, prevActiveAssignmentStyle;
function glowActiveAssignment (index) {
    try{
        prevActiveAssignment.className = prevActiveAssignmentStyle;
    } catch (err) {
        prevActiveAssignment = null;
    }
    prevActiveAssignment = document.getElementById("as" + index);
    prevActiveAssignmentStyle = prevActiveAssignment.className;
    prevActiveAssignment.className = prevActiveAssignmentStyle + " tr_glow";
}

function displayActiveCounter(index, date) {
    var element = document.getElementById("dc"+index);
    var remain = " remain" +
                 (date.major > 1 || (date.major == 0 && date.minor > 1)
                 ? ""
                 : "s");
    if (element != null) {
        if (date.major == 0)
            element.innerHTML = date.minor + " " + date.minorString + remain;
        else
            element.innerHTML = date.major + " " + date.majorString + remain;
    }
}

function displayMainEvent(event) {
    var element = document.getElementById("dc00");
    if(event == null) {
        element.innerHTML = "";
    } else {
        document.getElementById('dc00major').innerHTML = event.major;
        document.getElementById('dc00minor').innerHTML = event.minor;
        document.getElementById('dc00majorlabel').innerHTML = event.majorString;
        document.getElementById('dc00minorlabel').innerHTML = event.minorString;
        document.getElementById('dc00caption').innerHTML = mainEvent.caption;
    }
}

function display(){
    display_number("active_number", active);
    display_number("week_number", this_week);
    display_number("tomorrow_number", tomorrow);
    display_number("past_number", past);
    display_recent(this_week, "Week Assignments");
    if(Math.floor((new Date()).getTime()/100)%2 == 0)
        display_active_table();
    else
        display_active_timeline();

    display_past();
}
