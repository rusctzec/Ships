$(document).ready(function () {
    var signUpForm = $("#signup");
    var username = $("#username");
    var email = $("#email");
    var password = $("#password");

    signUpForm.on("submit", function (event) {
        event.preventDefault();
        var userData = {
            email: email.val().trim(),
            password: password.val().trim(),
            username: username.val().trim(),
        };
        if (!userData.email || !userData.password || !userData.username) {
            return;
        }
        signUpUser(userData.email, userData.password, userData.username);
    });


    function signUpUser(email, password,username) {
        $.post("/api/signup", {
                username: username,
                email: email,
                password: password
            })
            .then(function (data) {
                window.location.replace("/");
            })
            .catch(handleLoginErr);
    }

    function handleLoginErr(err) {
        console.log("ERR", err);

        $("#alert")
        .text(err.responseJSON.error)
        .animate({
            height: $("#alert").get(0).scrollHeight
        }, 200, function(){
            $(this).height('auto');
        });
    }

});