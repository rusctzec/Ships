
import path from 'path';
import express from 'express';
import socketIO from 'socket.io';
import { Lib } from 'lance-gg';

var PORT = process.env.PORT || 7070;

// define routes and socket
const app = express();
app.get('/', function(req, res) { res.render("game"); });
app.use('/', express.static(path.join(__dirname, '../dist/')));
app.use('/', express.static(path.join(__dirname, '../public/')));
let requestHandler = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Instances
import ExServerEngine from './server/ExServerEngine.js';
import ExGameEngine from './common/ExGameEngine.js';

const gameEngine = new ExGameEngine({ traceLevel: Lib.Trace.TRACE_NONE });
const serverEngine = new ExServerEngine(io, gameEngine, { debug: {}, updateRate: 6, timeoutInterval: 0 });

// start the game
serverEngine.start();

// Requiring necessary npm packages
import session from 'express-session';

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* PASSPORT CONFIGURATION: */
var passport = require("./config/passport");

app.use(require('express-session')({
  //change secret
  secret: '675e0d149bab4058bdf8dfb4ca2ba8f3',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


// Static directory
app.use(express.static(__dirname + "/public"));
app.use('/js', express.static(process.cwd() + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(process.cwd() + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(process.cwd() + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(process.cwd() + '/node_modules/nes.css/css')); // redirect CSS bootstrap

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
  defaultLayout: "main",
  layoutsDir: path.resolve(__dirname, "../views/layouts/"),
  partialsDir: path.resolve(__dirname, "../views/partials/"),
}));
app.set("view engine", "handlebars");


// Routes
require("./routes/api.js")(app);
require("./routes/html.js")(app);