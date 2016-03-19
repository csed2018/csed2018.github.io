var active = [];
var past = [];
var this_week = [];
var tomorrow = [];

var DAY = 86400000;
var now = new Date();
var tomorrow_date = new Date(now.getTime() + DAY);
var week_date = new Date(now.getTime() + 7*DAY);

function is_active(d){                
    var arg = new Date(d.year, d.month, d.day, d.hours, d.minutes, 0, 0);
    return (arg.getTime() > now.getTime());
}

function in_this_week(d){
    var arg = new Date(d.year, d.month, d.day, d.hours, 0, 0, 0);
    return (arg.getTime() > now.getTime() && arg.getTime() <= week_date.getTime());
}

function in_tomorrow(d){
    var arg = new Date(d.year, d.month, d.day, d.hours, 0, 0, 0);
    return (arg.getTime() > now.getTime() && arg.getTime() <= tomorrow_date.getTime());
}

function getDate(d){
    return d.day + "/" + (d.month+1) + "/" + d.year + " - " + d.hours + ":" + ("0" + d.minutes).slice(-2);
}

function my_parse(arr){
    console.log("start filtering the array");
    var i;
    for(i = 0; i < arr.length; i++) {
        if (is_active(arr[i].date)){
            active.push(arr[i]);
        } else {
            past.push(arr[i]);
        }
    }

    active.sort(function(a, b){
        var aDate = new Date(a.date.year, a.date.month, a.date.day, a.date.hours, a.date.minutes, 0, 0);
        var bDate = new Date(b.date.year, b.date.month, b.date.day, b.date.hours, b.date.minutes, 0, 0);
        return (aDate.getTime() - bDate.getTime());
    });
    
    // filter tommorow and this week tasks
    for(i=0; i < active.length; i++){
        if(in_this_week(active[i].date)){
            active[i].index = i;
            this_week.push(active[i]);
            if(in_tomorrow(active[i].date)){
                tomorrow.push(active[i]);
            }
        }
    }
    
    past.sort(function(a,b){
        var aDate = new Date(a.date.year, a.date.month, a.date.day, a.date.hours, a.date.minutes, 0, 0);
        var bDate = new Date(b.date.year, b.date.month, b.date.day, b.date.hours, b.date.minutes, 0, 0);
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

function display_active(){
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
            var text3 =            "</small> \
                                    </p> \
                                </div> \
                                <div class=\"timeline-body\"><p>" // description;
            var text4 = "          </p>\
                                </div>\
                            </div>\
                        </li>";
            return text1 + "[" + item.subject + "] " + item.title + text2 + getDate(item.date) + text3 + item.description + text4;
        });
}

function display_recent(arr, header){
    var element = document.getElementById("recent_list_header");
    element.innerHTML = header;
    display_list("recent_list", arr, function(item, index){
        var text1 = "<a href=\"#as"+item.index+"\" class=\"list-group-item\"> <i class=\"fa fa-tasks fa-fw\"></i>";
        var text2 = "<span class=\"pull-right text-muted small\"><em>";
        var text3 = "</em></span></a>";
        return text1 + item.title + text2 + getDate(item.date) + text3;
    });
}

function display_past(){
    display_list("past_list", past, function(item, index){
        var text1 = "<li class=\"left clearfix\">\
                        <span class=\"chat-img pull-left\">\
                            <img src=\"http://placehold.it/50/55C1E7/fff\" alt=\"User Avatar\" class=\"img-circle\" />\
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


function display(){
    display_number("active_number", active);
    display_number("week_number", this_week);
    display_number("tomorrow_number", tomorrow);
    display_number("past_number", past);
    display_recent(this_week, "Week Assignments");
    display_active();
    display_past();
}
