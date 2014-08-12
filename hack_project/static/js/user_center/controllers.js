//user_centerApp controllers.js

var navbarObject = $("#menu-list");
navbarObject.on("click", "li", function(evt){
      console.log(1);
      var targetObejct = $(this);
      if (targetObejct.hasClass("active"))
        return true;
      navbarObject.find("li.active").removeClass("active");
      targetObejct.addClass("active");
      navbarObject.find("div.in").collapse("hide");          
      targetObejct.next("div.collapse").collapse("show");  
  });
navbarObject.on("click", "a.list-group-item", function(evt){
  var targetObejct = $(this);
  if (targetObejct.hasClass("active"))
      return true;
  navbarObject.find(".sub_selected").removeClass("sub_selected");  
  targetObejct.addClass("sub_selected");  
});
function pandectCtr($scope) {

}

function acc_settingsCtr($scope){

}
function acc_chpassCtr($scope){}