var EmailAddressValid=false;
function checkEmail()
{
    var _callback=function(data){
        if(data.vaild===true){
            EmailAddressValid=true;
            $("#email-group").addClass("has-success").find("p").text("邮箱地址可用");
        }
        else{
            EmailAddressValid=false;
            $("#email-group").addClass("has-error").find("p").text("邮箱地址不可用,请检查输入");
        }
    }
   $("#email-group").removeClass("has-success").removeClass("has-error").find("p").text("正在验证...");
   EmailAddressValid=false;
   $.ajax({
        type: 'POST',
        url: '/reg/checkemail',
        data: {'email':$("#InputEmail").val()},
        dataType:"json",
        success:_callback 
    });   
    return true; 
}

function checkPassword()
{
    var plen=$("#InputPassword1").val().length;
    $("#password-group").removeClass("has-success").removeClass("has-error");
    if(plen<6||plen>100){
        $("#password-group").addClass("has-error").find("p").text("密码过短");
        return false;
    }
    else{
        $("#password-group").find("p").text("密码可用");
        return true;
    }
}

function checkRepeatPassword()
{
    $("#password2-group").removeClass("has-success").removeClass("has-error");
    if($("#InputPassword2").val()==$("#InputPassword1").val()){
        $("#password2-group").addClass("has-success").find("p").text("输入一致");
        return true;
    }
    else{
        $("#password2-group").addClass("has-error").find("p").text("两次输入不一致");
        return false;
    }
}
function checkNickname()
{
    $("#nickname-group").removeClass("has-error");
    var nlen=$("#InputNickname").val().length;
    if(nlen>2&&nlen<50){
       $("#nickname-group").addClass("has-error").find("p").text("昵称可用");
        return true;
    }
    else{
      $("#nickname-group").addClass("has-error").find("p").text("昵称过长或过短");
      return false;
    }

}
function checkSubmit()
{
    if(EmailAddressValid&&checkNickname()&&checkPassword()&&checkRepeatPassword())
    {
        return true;
    }
    else
    {
        alert("表单未正确填写");
        return false;
    }
}
$("#InputEmail").blur(checkEmail);
$("#InputNickname").blur(checkNickname);
$("#InputPassword1").blur(checkPassword);
$("#InputPassword2").blur(checkRepeatPassword);
$("#reg-form").submit(checkSubmit);

