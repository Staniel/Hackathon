// pageApp app.js
var app = angular.module('user_centerApp', ["ngRoute"]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    controller:pandectCtr,
    templateUrl:'/static/templates/user_center/pandect.html'
  }).
  when('/acc_settings', {
    controller:acc_settingsCtr,
    templateUrl:'/static/templates/user_center/acc_settings.html'
  }).
  when('/acc_chpass', {
    controller:acc_chpassCtr,
    templateUrl:'/static/templates/user_center/acc_chpass.html'
  }).
  otherwise({redirectTo: '/'});
}]);

