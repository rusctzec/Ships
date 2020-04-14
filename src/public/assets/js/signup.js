$(document).ready(function () {
    // Getting references to our form and input
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
        // If we have an email and password, run the signUpUser function
        signUpUser(userData.email, userData.password, userData.username);
        email.val("");
        password.val("");
    });

    
    // Does a post to the signup route. If successful, we are redirected to the members page
    // Otherwise we log any errors
    function signUpUser(email, password,username) {
        $.post("/api/signup", {
                username: username,
                email: email,
                password: password
            })
            .then(function (data) {
                window.location.replace("/");
                // If there's an error, handle it by throwing up a bootstrap alert
            })
            .catch(handleLoginErr);
    }

});