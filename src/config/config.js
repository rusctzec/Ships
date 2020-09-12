module.exports = {
    development: {
        username: process.env_db_user || "postgres",
        password: process.env.db_pass || "root",
        database: process.env.db_db || "ships_db",
        host: process.env.db_host || "127.0.0.1",
        dialect: "postgres"
    },
    test: {
        username: "postgres",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "postgres"
    },
    production: {
        dialect: "postgres",
        protocol: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
}