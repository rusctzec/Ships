
import path from 'path';
import express from 'express';
import socketIO from 'socket.io';
import exphbs from 'express-handlebars';
import expressSession from 'express-session';
import _sequelizeStore from 'connect-session-sequelize';
import db from './models';
import passport from 'passport';
import passportSocketIo from 'passport.socketio';
import cookieParser from 'cookie-parser';
import { Lib } from 'lance-gg';


const SequelizeStore = _sequelizeStore(expressSession.Store);
const sequelizeStore = new SequelizeStore({
  db: db.sequelize
})

var PORT = process.env.PORT || 7070;

// define routes and socket
const app = express();
app.get('/', function(req, res) { res.render("game"); });
app.use('/', express.static(path.join(__dirname, '../dist/')));
app.use('/', express.static(path.join(__dirname, '../public/')));
let requestHandler = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));



// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(expressSession({
  key: 'express.sid',
  secret: '675e0d149bab4058bdf8dfb4ca2ba8f3',
  store: sequelizeStore,
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
app.engine("handlebars", exphbs({
  defaultLayout: "main",
  layoutsDir: path.resolve(__dirname, "../views/layouts/"),
  partialsDir: path.resolve(__dirname, "../views/partials/"),
}));
app.set("view engine", "handlebars");

// Game Instances
import ExServerEngine from './server/ExServerEngine.js';
import ExGameEngine from './common/ExGameEngine.js';

const io = socketIO(requestHandler);

const gameEngine = new ExGameEngine({ traceLevel: Lib.Trace.TRACE_NONE });
const serverEngine = new ExServerEngine(io, gameEngine, { debug: {}, updateRate: 6, timeoutInterval: 0 });

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: '675e0d149bab4058bdf8dfb4ca2ba8f3',
  store: sequelizeStore,
  success: (data, accept) => accept(),
  fail: (data, message, error, accept) => accept(),
}));

// create/update session table in database
sequelizeStore.sync();

// start the game
serverEngine.start();

// Routes
require("./routes/api.js")(app);
require("./routes/html.js")(app);