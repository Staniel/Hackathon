//pageApp controllers.js
function nav_controller($scope,$rootScope){
    $rootScope.$on('$routeChangeSuccess', function(){
        if(arguments[1].$$route&&arguments[1].$$route.controller)
            $scope.ctrName=arguments[1].$$route.controller.name;
    });  
}      
function indexCtr ($scope,$http,$window) { 
    Highcharts.setOptions({global: {useUTC: false}});
    $.getScript("/static/libs/js/bootstrap-datetimepicker.min.js");
    $.getScript("/static/libs/js/spin.min.js");
    $scope.randomHeading={background:"url('/static/img/rand_h/"+Math.round(Math.random()*29)%14+".jpg') center"};
    function getDayBound_UTC8(jsTime){ //divide By TimeZone UTC+8:00
        var v = jsTime.valueOf();
        return new Date(v-(v+28800000)%86400000);
    };

    $scope.renderChart=function(roof,shanghai){ 
      var tmpDataObj={CO:{},NO2:{},O3:{},PM2_5:{},PM10:{},SO2:{}}; 
    //  console.log(roof);
    //  console.log(shanghai);
      for(var i in shanghai){
        var time=new Date(shanghai[i].submitted_on);
        for(var station in shanghai[i].content){
          if(!shanghai[i].content.hasOwnProperty(station))
            continue;
          for(var type in shanghai[i].content[station]){
              if(!shanghai[i].content[station].hasOwnProperty(type))
                continue;
              if(!tmpDataObj[type][station])
                    tmpDataObj[type][station]=[];
              var value=Number(shanghai[i].content[station][type]);
              if(!isNaN(value))               
                tmpDataObj[type][station].push({x:time,y:value});
           }         
        }
      }
       for(var i in roof){
        var time=new Date(roof[i].submitted_on);    
          for(var type in roof[i].content){
              if(!roof[i].content.hasOwnProperty(type))
                continue;
              if(!tmpDataObj[type]["闵行区"])
                    tmpDataObj[type]["闵行区"]=[];
              var value=Number(roof[i].content[type]);
              if(!isNaN(value))                
                tmpDataObj[type]["闵行区"].push({x:time,y:value});
           }         
        
      }
      console.log(tmpDataObj);
      var chartArray={};
      for(var type in tmpDataObj){
         if(!tmpDataObj.hasOwnProperty(type))
           continue;
         chartArray[type]=[];
         for (var station in tmpDataObj[type]){
              if(!tmpDataObj[type].hasOwnProperty(station))
                continue;              
              chartArray[type].push({name:station,data:tmpDataObj[type][station]});      
           }
      }
     
      $scope.chartArray=chartArray;
      $scope.chartConfig.series=$scope.chartArray.CO;
    }

    var todayBound=getDayBound_UTC8(new Date()).toISOString();
    $http({url:"http://10.50.6.70:8080/data/find",method:"post",params:{key:"TANGTOU",submitted_after:todayBound}}).success(
         function(data){
               console.log("roofData Loaded.");
               if(data.length>0){
                 $scope.tableData_roof=data[data.length-1];
                 $scope.tableUpdateTime=(new Date(data[data.length-1].submitted_on)).toLocaleTimeString();
               }            
               $scope.roofData=data;

                $http({url:"http://10.50.6.70:8080/data/find",method:"post",params:{key:"BAZHE",submitted_after:todayBound}}).success(
                   function(data){
                      console.log("shanghaiData Loaded.");
                      if(data.length>0){
                      $scope.tableData_shanghai=data[data.length-1];
                    }            
                    $scope.shanghaiData=data;
                    $scope.renderChart($scope.roofData,$scope.shanghaiData);
                 });
        });
    
$scope.chartConfig = {
    options:{ 
            credits:{
                    enabled:false
            },
            chart: {
                    type: 'spline',
                    zoomType: 'xy'
            },
            legend: {                     
                verticalAlign:"top",
                borderWidth: 0
            },
        },       
        title: {           
            text:"",          
        },      
       xAxis: {
          type:"datetime"
        },
        yAxis: {
            title: {   
            text:"value"            
            },            
            min:0
        },              
        series: []
        };

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