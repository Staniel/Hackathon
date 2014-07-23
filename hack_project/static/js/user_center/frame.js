var menu_obj;
var page_spinner;
var menu_page_map = {
    "menu_pandect": "pandect",
    "menu_about": "about",
    "menu_acc_settings": "acc_settings",
    "menu_acc_chpass": "acc_chpass",
    "menu_dev_add": "dev_add",
    "menu_dev_manage": "dev_manage",
};
function showPage(data) {
    page_spinner.stop();
    $("#content-div").hide().html(data).fadeIn();
}
function fetchPage(item_id) {
    if (! (item_id) || menu_page_map[item_id] == undefined) {
        return false;
    }
    window.location.hash = "id_" + item_id;
    $("#content-div").html("<div id='page_spinner_div'></div>");
    page_spinner.spin($('#page_spinner_div')[0]);
    $.get("./page/" + menu_page_map[item_id], showPage);
    return true;
}
function mainItemHandler(evt) {
    evt.preventDefault();
    var sel_obj = $(this);
    var item_id = this.id;
    if (sel_obj.hasClass("active"))
     return;
    if (item_id == "menu_logout") {
        if (confirm("确认登出?"))
         window.location = "/logout"
        return;
    }
    var coll = sel_obj.next("div.collapse");
    if (coll.length > 0 || fetchPage(item_id)) {
        menu_obj.find("div.in").collapse("hide");
        menu_obj.find("li.active").removeClass("active");
        sel_obj.addClass("active");
        sel_obj.next("div.collapse").collapse("show");
        menu_obj.find(".sub_selected").removeClass("sub_selected");
        coll.collapse("show");
    }
}
function subItemHandler(evt)
 {
    evt.preventDefault();
    var sel_obj = $(this);
    var item_id = this.id;
    if (sel_obj.hasClass("sub_selected"))
     return;
    if (fetchPage(item_id))
     {
        menu_obj.find(".sub_selected").removeClass("sub_selected");
        sel_obj.addClass("sub_selected");
    }
}
function ajax_action(data_to_post, succ_callback) {
    $.ajax({
        type: "POST",
        url: "/user_center/action",
        data: data_to_post,
        error: function(request) {
            alert("Connection error");
        },
        success: succ_callback
    });
}
$(document).ready(function() {
    var opts = {
        lines: 11,
        length: 25,
        width: 6,
        radius: 15,
        corners: 1,
        rotate: 0,
        direction: 1,
        color: '#000',
        speed: 1,
        trail: 60,
        shadow: false,
        hwaccel: false,
        className: 'spinner',
        zIndex: 1,
        top: 'auto',
        left: 'auto'
    };
    page_spinner = new Spinner(opts);
    menu_obj = $("#menu-list");
    menu_obj.on("click", "li", mainItemHandler);
    menu_obj.on("click", "a.list-group-item", subItemHandler);
    if (window.location.hash.length < 2)
     {
        $("#menu_pandect").click();
    }
     else
     {
        var hash_add = window.location.hash.replace("#id_", "");
        $("a#" + hash_add).parents("div.collapse").prev("li").click();
        $("#" + hash_add).click();
    }
});
