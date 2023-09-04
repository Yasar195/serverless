const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    max: 2,
    min: 0,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: false,
    ssl: {
        rejectUnauthorized: false
    }
})

module.exports = pool;