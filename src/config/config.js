module.exports = {
    development: {
        username: process.env_db_user || "root",
        password: process.env.db_pass || "test",
        database: process.env.db_db || "ships_db",
        host: process.env.db_host || "127.0.0.1",
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