'use strict';
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]
const db = {};

let connection;

if (process.env.DATABASE_URL) {
  connection = new Sequelize(process.env.DATABASE_URL, config);
} else {
  connection = new Sequelize(config.database, config.username, config.password, config);
}

db.User = require("./user")(connection,Sequelize);
db.User.sync()

db.sequelize = connection;
db.Sequelize = Sequelize;

module.exports = db;

