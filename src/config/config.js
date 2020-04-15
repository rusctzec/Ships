module.exports = {
    development: {
        username: "root",
        password: "test",
        database: "example_db",
        host: "127.0.0.1",
        dialect: "mysql"
    },
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql"
    },
    production: {
        username: process.env.db_user,
        password: process.env.db_pass,
        database: process.env.db_db,
        host: process.env.db_host,
        dialect: "mysql"
    }
}