// pageApp app.js
var app = angular.module('pageApp', ["ngRoute","highcharts-ng"]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    controller:indexCtr,
    templateUrl:'/static/templates/page/index.html'
  }).
  when('/openapi', {
    controller:openapiCtr,
    templateUrl:'/static/templates/page/openapi.html'
  }).
  when('/data/:key', {
    controller:dataCtr,
    templateUrl:'/static/templates/page/data.html'
  }).
  when('/document', {
    controller:documentCtr,
    templateUrl:'/static/templates/page/document.html'
  }).
  when('/about', {
    controller:aboutCtr,
    templateUrl:'/static/templates/page/about.html'
  }).
  otherwise({redirectTo: '/'});
}]);

app.filter('TOLOCAL',function(){
    return function(item){
        if(!item)
          return false;
        return (new Date(item)).toLocaleString();  
    }
}); 
