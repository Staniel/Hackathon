var menu_obj;
var page_spinner;
var menu_page_map={
    "menu_pandect":"pandect",
    "menu_about":"about",
    "menu_acc_settings":"acc_settings",
    "menu_acc_chpass":"acc_chpass",    
    "menu_dev_add":"dev_add",
    "menu_dev_manage":"dev_manage",
};

function do_fetch_page(item_id) {  
    if(item_id==""||menu_page_map[item_id]==undefined)
    {
        console.error("page name not found:"+item_id);
        return;
    }     
    window.location.hash="id_"+item_id;
    $("#content-div").html("<div id='page_spinner_div'></div>");
    page_spinner.spin(document.getElementById('page_spinner_div'));
    var page_call_back=function(data){

        page_spinner.stop();
        $("#content-div").hide().html(data).fadeIn();    
        console.log(menu_page_map[item_id]+" loaded");     
        }           
    $.get("./page/"+menu_page_map[item_id],page_call_back);
    console.log("begin load:"+menu_page_map[item_id]);    
}

function main_item() {	
	var sel_obj=$(this);
    var item_id=this.id;
    
     if(!sel_obj.hasClass("active")) {   		
        menu_obj.find(".in").collapse("hide");	
		menu_obj.find("li.active").removeClass("active");		
		sel_obj.addClass("active");
		$("#"+item_id+"_collapse").collapse("show");

        if(item_id=="menu_logout")
        {
           if(confirm("确认登出?"))
           {
                window.location="/logout";
            } 
            return;           
        }
        if(menu_page_map.hasOwnProperty(item_id))
        {
            menu_obj.find(".sub_selected").removeClass("sub_selected");
            do_fetch_page(item_id);
        } 
        
        
	}    
}
function sub_item()
{   
    var sel_obj=$(this); 
    var item_id=this.id;   

    if(!sel_obj.hasClass("sub_selected")){
    	menu_obj.find(".sub_selected").removeClass("sub_selected");
    	sel_obj.addClass("sub_selected");
        if(menu_page_map.hasOwnProperty(item_id))
        {
            do_fetch_page(item_id);
        }        
    }
}

$(document).ready(function(){

    var opts = {
              lines: 11,length: 25,width: 6, 
              radius: 15,corners: 1,rotate: 0, 
              direction: 1,color: '#000',speed: 1, 
              trail: 60,shadow: false,hwaccel: false, 
              className: 'spinner',zIndex: 1,top: 'auto', 
              left: 'auto'
    };    
    page_spinner = new Spinner(opts);

    menu_obj=$("#menu-list");
    menu_obj.on("click","li",main_item);
    menu_obj.on("click",".list-group-item",sub_item);   
    if(window.location.hash.length<2)
    {        
        $("#menu_pandect").click();        
    }
    else
    {
        var hash_add=window.location.hash.replace("#id_","") 
        $("a#"+hash_add).parents(".collapse").prev("li").click();   
        $("#"+hash_add).click()   
    }
});

function ajax_action(data_to_post,succ_callback){
$.ajax({                
                type: "POST",
                url:"/user_center/action",
                data:data_to_post,       
                error: function(request) {
                    alert("Connection error");
                },
                success:succ_callback
            });
}
