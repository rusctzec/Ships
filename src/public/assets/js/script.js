$(document).ready(function () {
    // This file just does a GET request to figure out which user is logged in
    // and updates the HTML on the page
    $.get("/api/user_data").then(function (data) {
        console.log(data)
        if(data.username == undefined) {
            return;
        }
        $("#user").text(data.username);
        $("#links").hide();
        $("#userNav").show();
    });

    resizeCallback();
    $(window).resize(resizeCallback);

    function resizeCallback() {

        // find and set ideal canvas size while preserving aspect ratio
        var canvas = $("canvas");
        var container = $("#canvas-container");

        var width = canvas.width(); var height = canvas.height();
        var maxWidth = container.width(); var maxHeight = container.height();

        var ratio = maxWidth / width;
        if (height*ratio > maxHeight) {
            ratio = maxHeight / height;
        }

        canvas.width(width * ratio);
        canvas.height(height * ratio);
    }
});