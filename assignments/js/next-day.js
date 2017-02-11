var app = angular.module('nextDay', []);

var WEEK_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                 "Friday"];

var nextDayTable = [];
var generalNotes = [];

nextDay = function(nowTime) {
  var tmpDate = new Date(nowTime + 2 * 3600000); // update every day 10 pm
  return (tmpDate.getDay() + 1) % 7;
}(Date.now());

function getDayID(day) {
  for (var i = 0; i < WEEK_DAYS.length; i++)
    if (WEEK_DAYS[i] == day)
      return i;
  return NaN;
}

app.controller('nextDayCtrl', function($scope){

  $scope.table = nextDayTable;
  $scope.nextDay = nextDay;
  $scope.generalNotes = generalNotes;

  var showAllTable = false;

  this.isAllTableShowed = function() {
    return showAllTable;
  }

  this.allTableClick = function() {
    showAllTable = !showAllTable;
  }
});
