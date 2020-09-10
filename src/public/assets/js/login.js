$(document).ready(function () {
    var loginForm = $("#login");
    var email = $("#email");
    var password = $("#password");

    loginForm.on("submit", function (event) {
        event.preventDefault();
        $("#alert").animate({height: 0}, 200)
        var userData = {
            email: email.val().trim(),
            password: password.val().trim()
        };

        if (!userData.email || !userData.password) {
            return;
        }
        loginUser(userData.email, userData.password);
        password.val("");
    });

    function loginUser(email, password) {
        $.post("/api/login", {
                email: email,
                password: password
            })
            .then(function (data) {
                window.location.replace("/");
            })
            .catch(handleLoginErr);
    }

    function handleLoginErr(err) {
        $("#alert")
        .animate({
            height: $("#alert").get(0).scrollHeight
        }, 200, function(){
            $(this).height('auto');
        });
    }
});