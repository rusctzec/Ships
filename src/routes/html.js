// Dependencies
const db = require("../models");
const isAuthenticated = require("../config/middleware/isAuthenticated");
// Routes
module.exports = function(app) {
  
  app.get("/", function (req, res) {
    // If the user already has an account send them to the members page
    
    res.render("game", {
      title: "Game",
      script: ['script.js'],
      link: [
        {
          text: 'Login',
          link: '/login'
        },
        {
          text: 'Register',
          link: '/register'
        }
      ]
    });
  });
  app.get("/register", function (req, res) {
    console.log(req.user)
    // If the user already has an account send them to the members page
    if (req.user) {
      res.redirect("/");
      return;
    }
    res.render("signup");
  });
  app.get("/login", function (req, res) {
    // If the user already has an account send them to the members page
    if (req.user) {
      res.redirect("/");
      return;
    }
    res.render("login");
  });
};