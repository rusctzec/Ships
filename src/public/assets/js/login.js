$(document).ready(function () {
    // Getting references to our form and input
    var signUpForm = $("#login");
    var email = $("#email");
    var password = $("#password");

    // When the signup button is clicked, we validate the email and password are not blank
    signUpForm.on("submit", function (event) {
        event.preventDefault();
        var userData = {
            email: email.val().trim(),
            password: password.val().trim()
        };

        if (!userData.email || !userData.password) {
            return;
        }
        // If we have an email and password, run the signUpUser function
        signUpUser(userData.email, userData.password);
        email.val("");
        password.val("");
    });

    // Does a post to the signup route. If successful, we are redirected to the members page
    // Otherwise we log any errors
    function signUpUser(email, password) {
        $.post("/api/login", {
                email: email,
                password: password
            })
            .then(function (data) {
                window.location.replace("/");
                // If there's an error, handle it by throwing up a bootstrap alert
            })
            .catch(handleLoginErr);
    }

    function handleLoginErr(err) {
        $("#alert .msg").text(err.responseJSON);
        $("#alert").fadeIn(500);
    }
});