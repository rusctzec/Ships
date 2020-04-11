$(document).ready(function () {
    // This file just does a GET request to figure out which user is logged in
    // and updates the HTML on the page
    $.get("/api/user_data").then(function (data) {
        console.log(data)
        if(data.email == undefined) {
            return;
        }
        $("#username").text(data.email);
        $("#links").hide();
        $("#userNav").show();
    });
});