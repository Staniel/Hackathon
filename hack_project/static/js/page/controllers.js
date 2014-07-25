//pageApp controllers.js
function nav_controller($scope,$rootScope){
    $rootScope.$on('$routeChangeSuccess', function(){
        if(arguments[1].$$route)
            $scope.ctrName=arguments[1].$$route.controller.name;
    });  
}      

function indexCtr ($scope,$http) {   
    $scope.randomHeading={background:"url('/static/img/rand_h/"+Math.round(Math.random()*29)%14+".jpg') center"};
    function getDayBound_UTC8(jsTime){ //divide By TimeZone UTC+8:00
        var v = jsTime.valueOf();
        return new Date(v-(v+28800000)%86400000);
    };
    var todayBound=getDayBound_UTC8(new Date()).toISOString();
    $http({url:"http://10.50.6.70:8080/data/find",method:"post",data:{key:"TANGTOU",submitted_after:todayBound}}).success(
         function(data){
            console.log(data);
        });
 /*   $.ajax({
              type: "POST",
              url: "http://10.50.6.70:8080/data/find",
              timeout: 3000, 
              data: {  
                        "key":"TANGTOU",
                        "submitted_after":todayBound.toISOString()
              },
              success: function(data) { 
               console.log("roofData Loaded.");
               if(data.length>0)
                    $scope.tableData_roof=data[data.length-1];
                console.log($scope.tableData_roof);
               $scope.roofData=data;
               console.log($scope.tableData_roof.content.PM2_5);
              },
          });

    $.ajax({
              type: "POST",
              url: "http://10.50.6.70:8080/data/find",
              timeout: 3000, 
              data: {  
                        "key":"BAZHE",
                        "submitted_after":todayBound.toISOString()
              },
              success: function(data) {
               console.log("shanghai DataLoaded");
               if(data.length>0)
                    $scope.tableData_shanghai=data[data.length-1];
               $scope.shanghaiData=data;
              },
          });*/
}

function documentCtr($scope){}
function openapiCtr($scope){}
function dataCtr($scope){}
function aboutCtr($scope){}