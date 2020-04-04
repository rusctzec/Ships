// Dependencies
const db = require("../models");
const isAuthenticated = require("../config/middleware/isAuthenticated");
// Routes
module.exports = function(app) {
  app.get("/", function(req, res) {
    // If the user already has an account send them to the members page
    
    if (req.user) {
      // Here we've add our isAuthenticated middleware to this route.
      // If a user who is not logged in tries to access this route they will be redirected to the signup page
    }
    else {
      res.render("login", {
        title: "Log In or Sign Up",
        script: ['login.js'],
        link: [
          {
            text: 'Register',
            link: '/register'
          }
        ]
      });
    }
  });
  app.get("/register", function (req, res) {
    // If the user already has an account send them to the members page
    if (req.user) {
      res.redirect("/");
      return;
    }
    
    res.render("signup", {
      title: "Log In or Sign Up",
      script: ['signup.js'],
      link: [
        {
          text: 'Login',
          link: '/'
        }
      ]
    });
  });
}