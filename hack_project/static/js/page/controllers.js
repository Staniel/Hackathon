//pageApp controllers.js
function nav_controller($scope,$rootScope){
    $rootScope.$on('$routeChangeSuccess', function(){
        if(arguments[1].$$route&&arguments[1].$$route.controller)
            $scope.ctrName=arguments[1].$$route.controller.name;
    });  
}      
function indexCtr ($scope,$http,$window) { 
    Highcharts.setOptions({global: {useUTC: false}});
    $.getScript("/static/libs/js/bootstrap-datetimepicker.min.js",function(){
       $('#date-picker').datetimepicker({
        format:"yyyy-mm-dd",
        startDate: "2014-4-9",
        weekStart: 1,         
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
        }).on('changeDate', function(ev){
           if(typeof(spinner)!="undefined")
               spinner.spin(spindiv)
           var v=ev.date.valueOf();
           v=(v-v%86400000)-28800000;
           var b1=(new Date(v)).toISOString();
           var b2=(new Date(v+86400000)).toISOString();
           $http({url:"http://10.50.6.70:8080/data/find",method:"post",params:{key:"TANGTOU",submitted_after:b1,submitted_before:b2}}).success(
         function(data){
            if(data.length<1) {
              if(typeof(spinner)!="undefined")
                  spinner.stop()    
              alert("似乎没有那天的数据");
              $scope.chartConfig.series=[];
              return;
            }
            $scope.roofData=data;
            $http({url:"http://10.50.6.70:8080/data/find",method:"post",params:{key:"BAZHE",submitted_after:b1,submitted_before:b2}}).success(
         function(data){
            if(typeof(spinner)!="undefined")
                spinner.stop()    
            $scope.shanghaiData=data;
            $scope.renderChart($scope.roofData,$scope.shanghaiData);            
            });
         });

       });
      var dt=new Date();
      $("#date-picker-input").attr("value",(dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate()).replace(/([\-\: ])(\d{1})(?!\d)/g, '$10$2'));

    });
    $.getScript("/static/libs/js/spin.min.js",function(){
        var opts = {
          lines: 11, // The number of lines to draw
          length: 10, // The length of each line
          width: 5, // The line thickness
          radius: 15, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#000', // #rgb or #rrggbb or array of colors
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 'auto', // Top position relative to parent in px
          left: 'auto' // Left position relative to parent in px
      };
     spindiv=document.getElementById('loading-spin');
     spinner = new Spinner(opts);
    });
    $scope.switchChart=function(id){
      if(!$scope.chartArray[id])
        return;
      $scope.currentChartID=id;
      $scope.chartConfig.series=$scope.chartArray[id];
    }
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
      $scope.switchChart("CO");
    }

    var todayBound=getDayBound_UTC8(new Date()).toISOString();
    $http({url:"http://10.50.6.70:8080/data/find",method:"post",params:{key:"TANGTOU",submitted_after:todayBound}}).success(
         function(data){
               if(data.length>0){
                 $scope.tableData_roof=data[data.length-1];
                 $scope.tableUpdateTime=(new Date(data[data.length-1].submitted_on)).toLocaleTimeString();
               }            
               $scope.roofData=data;

                $http({url:"http://10.50.6.70:8080/data/find",method:"post",params:{key:"BAZHE",submitted_after:todayBound}}).success(
                   function(data){
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
}

function documentCtr($scope){}
function openapiCtr($scope){}
function dataCtr($scope,$routeParams,$window,$http){
  $scope.httpData={};
  //$scope.showMapDiv=true;
  $scope.msg="还没有查询";
  $scope.keyMapArray=["KEN","PM25","AQICN","KEEWIFI"];
  $scope.currentKey=$routeParams.key;
  if($scope.currentKey=="PM25"){
     $scope.showMapDiv=true;
  }
  $scope.timeGap=1;
  var dt=new Date();
  $("#date-picker-input").attr("value",(dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate()).replace(/([\-\: ])(\d{1})(?!\d)/g, '$10$2'));
  var v=(new Date()).valueOf(); 
  $scope.timeStart=v-(v+28800000)%86400000;
  $scope.switchTo=function(key){
    $window.location.hash="#/data/"+key;
  }
  $scope.httpDataRenderer={
    "PM25":function(){
            var idx;
            if(typeof($scope.resQueryIndex)=="undefined")
              idx=$scope.httpData.PM25.length-1;
            else
              idx=$scope.resQueryIndex;
            $scope.subMsg="当前显示数据: " + (new Date($scope.httpData.PM25[idx].submitted_on)).toLocaleString();
            console.log($scope.httpData.PM25[idx]);
          },
    "KEEWIFI":function(){},
  };
  $window.bmapCallback=function(){
    console.log("BMAP loaded.");
    $scope.bmap = new BMap.Map("mapDiv");           
    $scope.bmap.centerAndZoom(new BMap.Point(105,38),5);        
    $scope.bmap.addControl(new BMap.NavigationControl()); 
    $scope.bmap.addControl(new BMap.ScaleControl());           
   // $scope.bmap .enableScrollWheelZoom();
  
  }
  $.getScript("http://api.map.baidu.com/api?v=2.0&ak=DN45Mol7VgheNf5yG2MVQbuw&callback=bmapCallback");
  $.getScript("/static/libs/js/bootstrap-datetimepicker.min.js",function(){
        $('#date-picker').datetimepicker({
        format:"yyyy-mm-dd",
        startDate: "2014-4-9",
        weekStart: 1,         
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
        }).on('changeDate', function(ev){
           var v=ev.date.valueOf();
           $scope.timeStart=v-(v+28800000)%86400000;
  });
});

  $scope.doQuery=function(){  
    if($scope.currentKey=="_")
    {
      alert("请先选择一个数据来源");
      return;
    }
    if($scope.Querying){
    if(!confirm("有查询请求尚未返回,仍进行新的查询?"))
        return;
    }
    
    $scope.Querying=true;
    $scope.msg="请求数据中,请稍候....";   
    $scope.subMsg=undefined;
    var b1=(new Date($scope.timeStart)).toISOString();
    var b2=(new Date($scope.timeStart+Number($scope.timeGap)*86400000)).toISOString();
    var info="  - KEY=" + $scope.currentKey +" | TIME-LIMIT="+ b1 +"~"+ b2;
    console.log(info);
    $http({url:"http://10.50.6.70:8080/data/find",method:"post",params:{key:$scope.currentKey,submitted_after:b1,submitted_before:b2}}).success(
         function(data){
            $scope.resQueryIndex=undefined;
            $scope.Querying=false;
            console.log(data);         
            $scope.msg="查询结果: "+ data.length + "条记录."+ info; 
            $scope.httpData[$scope.currentKey]=data;
            if(!$scope.httpDataRenderer[$scope.currentKey]){
              $scope.subMsg=" ###数据来源未能识别,无法显示###";
            }
            else{
              $scope.httpDataRenderer[$scope.currentKey]();
            }   
       });

  }
}
function aboutCtr($scope){}