'use restrict'

var app = angular.module('app', []);


app.service('TimeUtils', function(){
  var that = this;
  
  this.WEEK_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                   "Friday"];
  this.DAY = 24 * 60 * 60 * 1000;
  this.WEEK = 7 * this.DAY;
  
  this.getDayID = function(day) {
    for (var i = 0; i < that.WEEK_DAYS.length; i++)
      if (that.WEEK_DAYS[i] == day)
        return i;
    return NaN;
  }
  
  this.nextDay = function(nowTime) {
    var tmpDate = new Date(nowTime + 2 * 3600000); // update every day 10 pm
    return (tmpDate.getDay() + 1) % 7;
  }(Date.now());
  
  this.getDayName = function(dateObj) {
    return WEEK_DAYS[(dateObj.getDay()+1)%7];
  }
  
  this.isAhead = function(date){
    return (date > Date.now());
  }
  
  this.deltaNow = function(date) {
    return date - Date.now();
  }
  
  this.inWeek = function(d){    
    return that.isAhead(d) && that.deltaNow(d) < that.WEEK;
  }
  
  this.inDay = function(d){  
    return that.isAhead(d) && that.deltaNow(d) < that.DAY;
  }
  
  this.millisecondsToUnits = function(time) {
      time = time < 0 ? 0 : time;
      time = Math.floor(time/1000);
      var days = Math.floor(time/(24*60*60));
      time = time % (24*60*60);
      var hours = Math.floor(time/(60*60));
      time = time % (60*60);
      var minutes = Math.floor(time/60);
      time = time % 60;
      return {
          seconds: time,
          minutes: minutes,
          hours: hours,
          days: days
      };
  }
  
  /**
    @brief: put the given time in time units (years, days, hours, minutes, seconds)
    and return first (num) units starting from non-zero unit and last-one rounded
    @returns: up-rounded (num) of
    @param: time: time in milliseconds
    @param: num: number of
  */
  this.roundTime = function(time, num) {
    if(num <= 0) return {};
    var date = that.millisecondsToUnits(time);
    var units = [
        {value: date.days, label: "day"},
        {value: date.hours, label: "hour", max: 24},
        {value: date.minutes, label: "minute", max: 60},
        {value: date.seconds, label: "second", max: 60}
    ];
    num = Math.min(units.length, num);
    
    // round up all units not requested
    for (var i = units.length - 1; i >= num; i--) {
      if (units[i].value > 0.5 * units[i].max) {
        units[i].value = 0;
        units[i-1].value++;
      }
    }
    var ret = [];
    // find first non-zero element unit
    var i = 0;
    for(; i < units.length - num; ++i) {
      if (units[i].value > 0) break;
    }
    for(var j = 0; j < num; j++, i++) {
      if(units[i].value != 1) units[i].label += "s";
      ret.push({value: units[i].value, label: units[i].label});
    }
    return ret;
  }
});

app.service('AssignmentsUtils', function($timeout, TimeUtils){
  var that = this;
  var data = {
    subjects: {},
    past: [],
    active: [],
    activeCount: 0,
    weekCount: 0,
    dayCount: 0,
    pastCount: 0
  };
  this.data = data;
  
  this.updateAssinments = function(all) {
    data.active = [];
    data.past = [];
    data.subjects = {};
    for (var i = 0; i < all.length; i++) {
      data.subjects[all[i].subject] = data.subjects[all[i].subject] || {active:0, past:0};
      if (TimeUtils.isAhead(all[i].deadline)) {
        data.active.push(all[i]);
        data.subjects[all[i].subject].active++;
      } else {
        data.past.push(all[i]);
        data.subjects[all[i].subject].past++;
      }
    }
    
    data.active.sort(function(a, b){
        return (a.deadline - b.deadline);
    });
    
    data.past.sort(function(a, b){
        return (b.deadline - a.deadline);
    });
  }
  
  var tick = function() {
    for (var i = data.active.length - 1; i >=0 ; i--){
      if(!TimeUtils.isAhead(data.active[i].deadline)) {
        data.past = data.active.slice(0,i+1).reverse().concat(data.past);
        data.active = data.active.slice(i+1, data.active.length);
        break;
      }
    }
    data.weekCount = 0;
    data.dayCount = 0;
    data.activeCount = data.active.length;
    data.pastCount = data.past.length;
    for (var i = 0; i < data.active.length ; i++){
      if(TimeUtils.inDay(data.active[i].deadline)) {
        data.weekCount++;
        data.dayCount++;
      } else if(TimeUtils.inWeek(data.active[i].deadline)) {
        data.weekCount++;
      }
    }
    
    var all = data.assignments = data.active.concat(data.past);
    for (var i = 0; i < all.length; i++){
      var remaining = TimeUtils.roundTime (Math.abs(TimeUtils.deltaNow(all[i].deadline)), 2);
      all[i].remainingTime = remaining[0].value + " " + remaining[0].label;
    }
    
    $timeout(tick, 1000);
  }

  tick();
});

app.filter('scapeNewLines', function() {
  return function (text) {
    text = text.replace(/\n/g, "<br>");
    return text;
  }
});

app.filter('scapeHyperLinks', function() {
  return function(text) {
    text = text.replace(/{{/g, "<a target=\"_blank\" href=\"");
    text = text.replace(/\#\$/g, "\">");
    text = text.replace(/}}/g, "</a>");
    return text;
  };
});

app.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});


app.service('AssignmentsData', function($http, AssignmentsUtils){
  $http.get('https://spreadsheets.google.com/feeds/list/1pBZaLcIZ8o2t6HoylMwun4EranZF4i2KvFoG5OmtNio/oltjd19/public/values?alt=json', {})
  .then(function(response){
    var dataEntryArr = response.data.feed.entry;
    var simpleArr = [];
    for(var i = 0; i < dataEntryArr.length; i++) {
        var row = {};
        row.subject = dataEntryArr[i].gsx$subject.$t;
        row.title = dataEntryArr[i].gsx$title.$t;
        var tmpDate = new Date(dataEntryArr[i].gsx$date.$t + "T" + dataEntryArr[i].gsx$time.$t + "Z");
        // subtract two hours (2 * 60 * 60 * 1000) to be in UTC
        row.deadline = new Date(tmpDate.getTime() - 7200000);
        row.description = dataEntryArr[i].gsx$description.$t || "";
        simpleArr.push(row);
    }
    AssignmentsUtils.updateAssinments(simpleArr);
  },function () {
    console.error('error quering data');
  });
});


app.controller('assignmentsCtrl', function($scope, 
              TimeUtils, AssignmentsUtils, AssignmentsData){
  var that = this;
  this.data = AssignmentsUtils.data;
  this.filterSubject = null;
  
  this.setFilterSubject = function(subject) {
    console.log(subject);
    this.filterSubject = subject;
  }
  
  this.isActive = function (a) {
    return TimeUtils.isAhead(a.deadline);
  }
  
  this.panelClass = function(task) {
    if (TimeUtils.inDay(task.deadline))
      return "-danger";
    if (TimeUtils.inWeek(task.deadline))
      return "-warning";
    if (TimeUtils.isAhead(task.deadline))
      return "-success";
    return "-default";
  }
  
});

app.controller('nextDayCtrl', function($scope, TableData){
  var that = this;
  this.data = TableData.data;

  var showAllTable = false;

  this.isAllTableShowed = function() {
    return showAllTable;
  }

  this.allTableClick = function() {
    showAllTable = !showAllTable;
  }
});

app.service('TableData', function($http, TimeUtils) {
  var that = this;
  this.data = {table: []};
  $http.get("https://spreadsheets.google.com/feeds/list/1pBZaLcIZ8o2t6HoylMwun4EranZF4i2KvFoG5OmtNio/oxukpy2/public/values?alt=json")
    .then (function (response) {
      var dataEntryArr = response.data.feed.entry;
      if(dataEntryArr == null)
        return;
      var data = [];

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
              period.dayID = TimeUtils.getDayID(period.day);
              period.notes = period.notes;
              period.isNextDay = (isNextDay === "nextDay");
              data.push(period);
          }
      }
      data.sort(function(a, b){
        return a.dayID != b.dayID ? a.dayID - b.dayID : a.num - b.num;
      });
      for(var i = 0, j = 0; i < data.length; i++) {
        if (i + 1 === data.length || (i + 1 < data.length && data[i].day !== data[i+1].day)) {
          data[i].last = true;
          data[Math.floor((i+j)/2)].mid = true;
          j = i + 1;
        }
      }
      that.data.table = data;
    }, function () {
      console.error('error requesting table data');
    });
});

app.service('DownCounterService', function($http, TimeUtils, $timeout){
  var that = this;
  this.mainEvent = {isActive: false};
  
  var query = function () {
    $http.get("https://spreadsheets.google.com/feeds/list/1pBZaLcIZ8o2t6HoylMwun4EranZF4i2KvFoG5OmtNio/ojorxse/public/values?alt=json")
    .then(function(response){
      var dataEntryArr = response.data.feed.entry;
      if(dataEntryArr == null)
        return;
      var nowTime = (new Date).getTime();
      for(var i = 0; i < dataEntryArr.length; i++) {
        var date = new Date(dataEntryArr[i].gsx$date.$t + "T" + dataEntryArr[i].gsx$time.$t + "Z");
        var caption = dataEntryArr[i].gsx$caption.$t;
        if(TimeUtils.isAhead(date)) {
          that.mainEvent.date = date;
          that.mainEvent.caption = caption;
          that.mainEvent.isActive = true;
          startTick();
          break;
        }
      }
    });
  }
  query();
  
  var startTick = function(){
      $timeout(function () {
        if (!that.mainEvent.isActive)
          return;
        if (TimeUtils.isAhead(that.mainEvent.date)) {
          that.mainEvent.remaining = TimeUtils.roundTime(
                                    TimeUtils.deltaNow(that.mainEvent.date), 2);
          $timeout(this, 500);
        } else {
          that.mainEvent.isActive = false;
          that.query();
        }
      }, 500);
  };
});

app.controller('downCounetrCtrl', function(DownCounterService){
  this.event = DownCounterService.mainEvent;
});
