// Requiring bcrypt for password hashing. Using the bcryptjs version as the regular bcrypt module sometimes causes errors on Windows machines
var bcrypt = require("bcryptjs");
// Creating our User model
module.exports = function (connection, Sequelize) {
    // Creates a "connection" model that matches up with DB
    const Example = connection.define("example", {
        // The email cannot be null, and must be a proper email before creation
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        // The password cannot be null
        password: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    // Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
    Example.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    };
    // Hooks are automatic methods that run during various phases of the User Model lifecycle
    // In this case, before a User is created, we will automatically hash their password
    Example.addHook("beforeCreate", function (example) {
        example.password = bcrypt.hashSync(example.password, bcrypt.genSaltSync(10), null);
    });
    return Example;
};