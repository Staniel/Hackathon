function showCharts(pollname)
{  
$(".charts-button.btn-primary").removeClass("btn-primary").addClass("btn-default").removeClass("active");
$("#button-"+pollname).addClass("btn-primary").addClass("active");
        var chart_opt={
        credits:{
                enabled:false
        },
        chart: {
                type: 'spline',
                zoomType: 'xy'
            },
        title: {           
            text:"",          
        },      
       xAxis: {
            categories: my_xAxis,
            tickInterval:3,
        },
        yAxis: {
            title: {   
            text:"value"            
            },            
            min:0
        },
        tooltip: {
        },
        legend: {       
              
            verticalAlign:"top",
            borderWidth: 0
        },
        series: chartData[pollname]
        };
        //chart_opt.title.text=pollname;       
        //chart_opt.tooltip.valueSuffix="1";       
        $('#charts-container1').highcharts(chart_opt);      
       //  var cobj=$('#charts-container1').highcharts();
       // cobj.series[4].hide();
       //  cobj.series[5].hide();
       // cobj.series[6].hide();
       //cobj.series[7].hide();
}
  function chartsRender(data1,data2)//data1:Roof data2:PM25in
        { 
          if(data1[0]==undefined||data2[0]==undefined)
          {
            alert("似乎没有那天的数据。。。");
            return;
          }
/*
普陀 32km
徐汇上师大 23km
青浦淀山湖 70km
静安 28km
浦东张江 43km
虹口 38km
杨浦 40km
*/
/*BAN LIST
"*青浦淀山湖"
"虹口凉城"
"浦东监测站"
*/

              var stationMap=["全市平均","普陀监测站","徐汇上师大","静安监测站","浦东张江","浦东川沙","卢湾师专附小","杨浦四漂"];
              var pollutantMap=["PM2_5","PM10","CO","NO2","O3","SO2"];
               
              if($("#charts-controller").html()=="")
              {
               var ctrs='<div class="btn-group">';
                for (var poll in pollutantMap)
                    ctrs+='<button type="button" id="button-'+pollutantMap[poll]+'" onclick="showCharts(\''+pollutantMap[poll]+'\')" class="btn btn-default charts-button">'+pollutantMap[poll]+'</button>';
                $("#charts-controller").html(ctrs+'</div>');  
              }
                  

                var dataObj={};
                for(var poll in pollutantMap)
                {
                  dataObj[pollutantMap[poll]]={};
                  for(var st in stationMap)
                  {
                    dataObj[pollutantMap[poll]][stationMap[st]]=new Array;                    
                  }
                  dataObj[pollutantMap[poll]]["闵行区"]=new Array; 
                }
               
                var idx1,idx2;
                idx2=0;
                my_xAxis=new Array();
                var submitted_time2=new Date(data2[idx2]['submitted_on']);
                var submitted_time1;
               // console.log(submitted_time2);
                for(idx1 in data1)
                  {
                  if(idx1%2==1)
                      continue;
                    submitted_time1=new Date(data1[idx1]['submitted_on']);
                    my_xAxis.push((submitted_time1.getHours() + ':' + (submitted_time1.getMinutes()/10*10)).replace(/([\-\: ])(\d{1})(?!\d)/g, '$10$2'));
                    for(var poll in pollutantMap)
                        {                          
                           dataObj[pollutantMap[poll]]['闵行区'].push(data1[idx1]["content"][pollutantMap[poll]]);
                        }
                    //console.log((submitted_time1.valueOf()-submitted_time2.valueOf())/1000);
                    if((Math.abs(submitted_time1.valueOf()-submitted_time2.valueOf())/1000)<660)
                    { 

                      var tarValue=""
                     // console.log("Match"+idx1);
                       for(var poll in pollutantMap)
                        {                          
                          for(var st in stationMap)
                          { 
                            if(data2[idx2]['content'][stationMap[st]]==undefined) //data of this station is missing
                            { 
                              console.log("station:"+stationMap[st]+" data missing@"+submitted_time2.toLocaleString());
                              tarValue=0;
                            }
                            else
                            {
                             tarValue=Number(data2[idx2]['content'][stationMap[st]][pollutantMap[poll]]);
                            }
                            if(isNaN(tarValue)||tarValue<0) 
                            {                            
                              tarLength=dataObj[pollutantMap[poll]][stationMap[st]].length; 
                              if(tarLength==0)
                                tarValue=0;
                              else
                                tarValue=dataObj[pollutantMap[poll]][stationMap[st]][tarLength-1];                              

                            }
                            dataObj[pollutantMap[poll]][stationMap[st]].push(tarValue);
                          }
                        }                      
                    idx2 +=1;                  
                    if(data2[idx2]!=undefined)
                      {                        
                        submitted_time2=new Date(data2[idx2]['submitted_on']);
                      }
                      else
                      {
                        submitted_time2=new Date("2000-01-01T01:01:01.088Z");
                      }
                    }
                    else
                    {
                      if(idx1<2)
                      {
                         for(var poll in pollutantMap)
                        {                          
                          for(var st in stationMap)
                              dataObj[pollutantMap[poll]][stationMap[st]].push(0);
                        }
                      }
                      else
                      {
                         for(var poll in pollutantMap)
                        {                          
                          for(var st in stationMap)
                              dataObj[pollutantMap[poll]][stationMap[st]].push(dataObj[pollutantMap[poll]][stationMap[st]].slice(-1)[0]);
                        }
                      }
                        
                    }                  
                  } 
    //data loop END
          chartData={}
          for(var poll in dataObj)
          {
             var newArr=new Array();
             for (var stname in dataObj[poll])
            {
                      newArr.push({"name":stname,"data":dataObj[poll][stname]});
            }
            chartData[poll]=newArr;
          }
          showCharts("PM2_5");

       
        // console.log(dataObj);
        //console.log(my_xAxis.length);
 
        }
function fetchData(s1,s2)
{
   console.log("Ajax-Fetch:"+s1+"~"+s2);
   spinner.spin(spindiv);
   $.ajax({
                            type: "POST",
                            url: "http://10.50.6.70:8080/data/find",                      
                            timeout: 3000, 
                            data: { "key":"TANGTOU","submitted_after":s1,"submitted_before":s2},
                            success: function(data) {
                                             $.ajax({
                                                type: "POST",
                                                url: "http://10.50.6.70:8080/data/find",
                                                timeout: 3000, 
                                                data: { "key":"BAZHE","submitted_after":s1,"submitted_before":s2},
                                                success: function(data2) {
                                                   // console.log(data);
                                                   // console.log(data2);
                                                    chartsRender(data,data2);
                                                    spinner.stop();
                
                                                },
                                                error: function (XMLHttpRequest, textStatus, errorThrown) {
                                                 
                                              }
                                            });                                

                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {                             
                        }
                      });
}

  $(document).ready(function(){
      
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
             dt=new Date();
             dt.setTime(ev.date.valueOf()+dt.getTimezoneOffset()*60*1000);
             //console.log(dt);
             var timeOffset=dt.valueOf()/1000-dt.getHours()*3600-dt.getMinutes()*60-dt.getSeconds();
             dt.setTime((timeOffset)*1000);
             s1=dt.toISOString();
             dt.setTime((timeOffset+86399)*1000);
             s2=dt.toISOString();

             fetchData(s1,s2);     

       });;
        var dt=new Date();
        $("#date-picker-input").attr("value",(dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate()).replace(/([\-\: ])(\d{1})(?!\d)/g, '$10$2'));

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
     var timeBoundary=new Date();
     var timeOffset=timeBoundary.valueOf()/1000-timeBoundary.getHours()*3600-timeBoundary.getMinutes()*60-timeBoundary.getSeconds()-1;
     timeBoundary.setTime(timeOffset*1000);


//STEP1 ajax BEGIN
            $.ajax({
              type: "POST",
              url: "http://10.50.6.70:8080/data/find",
              timeout: 3000, 
              data: { "key":"TANGTOU","submitted_after":timeBoundary.toISOString()},
              success: function(data) { 
// STEP1 ajax callback BEGIN
// STEP2 ajax BEGIN
                    if(data[0]==undefined)
                         {
                                 alert("请求数据失败，请检查本地日期设置");
                                 return;
                         }
                       $.ajax({
                            type: "POST",
                            url: "http://10.50.6.70:8080/data/find",
                            timeout: 3000, 
                            data: { "key":"BAZHE","submitted_after":timeBoundary.toISOString()},
                            success: function(data2) {// STEP2 ajax callback BEGIN  
                                
                                var latest_submit2=data2.slice(-1)[0];   
                                var tableString="";      
                                //console.log(latest_submit);
                                for(var station in latest_submit2["content"])
                                {
                                if(station=="全市平均")   
                                  continue;      
                                tableString=tableString+"<tr><td>"+station+"</td><td>"
                                +latest_submit2["content"][station]["PM2_5"]+"</td><td>"
                                +latest_submit2["content"][station]["PM10"]+"</td><td>"
                                +latest_submit2["content"][station]["CO"]+"</td><td>"
                                +latest_submit2["content"][station]["NO2"]+"</td><td>"
                                +latest_submit2["content"][station]["O3"]+"</td><td>"
                                +latest_submit2["content"][station]["SO2"]+"</td></tr>";                  
                                }
                                tableString=tableString+"<tr><td><b>平均值<b/></td><td>"
                                +latest_submit2["content"]["全市平均"]["PM2_5"]+"</td><td>"
                                +latest_submit2["content"]["全市平均"]["PM10"]+"</td><td>"
                                +latest_submit2["content"]["全市平均"]["CO"]+"</td><td>"
                                +latest_submit2["content"]["全市平均"]["NO2"]+"</td><td>"
                                +latest_submit2["content"]["全市平均"]["O3"]+"</td><td>"
                                +latest_submit2["content"]["全市平均"]["SO2"]+"</td></tr>";     
                                $("#main-table-tbody").append(tableString).find("tr").first().addClass("danger");

                                chartsRender(data,data2);
// STEP2 ajax callback END
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                             
                        }
                      });
// STEP2 ajax END
                function toStandardFormat(dt)
                {
                   return (dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds()).replace(/([\-\: ])(\d{1})(?!\d)/g, '$10$2');
                }
            

                  var latest_submit=data.slice(-1)[0];              
                  $("#update-time-span").text(toStandardFormat(new Date(latest_submit["submitted_on"])));
                 
                  var tableString="<tr><td>闵行区</td><td>"
                  +latest_submit["content"]["PM2_5"]+"</td><td>"
                  +latest_submit["content"]["PM10"]+"</td><td>"
                  +latest_submit["content"]["CO"]+"</td><td>"
                  +latest_submit["content"]["NO2"]+"</td><td>"
                  +latest_submit["content"]["O3"]+"</td><td>"
                  +latest_submit["content"]["SO2"]+"</td></tr>";
                  $("#main-table-tbody").append(tableString);
// STEP2 ajax callback END
              },
              error: function (XMLHttpRequest, textStatus, errorThrown) {
               
          }
        });
//STEP1 ajax END
      });