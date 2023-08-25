const { Pool, Client } = require('pg')
require('dotenv').config()

const pool = new Pool({
    user: 'teleadmin',
    password: 'rK3QGqgSy2GT8XMIqEX4',
    port: 5432,
    host: 'teledb.cdhbopkauw3e.ap-south-1.rds.amazonaws.com',
    database: 'dash',
    max: 2,
    connectionTimeoutMillis: 40000,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: false,
    ssl: {
        rejectUnauthorized: false
    }
})



// // pool.connect().then(()=> console.log('connected')).then((er)=> console.log(er))

// const connect = async () => {
//     console.log('hai')
//     const client = await pool.connect()
//     console.log('hello')
//     const {rows} = await client.query('select * from departments;')
//     console.log(rows)
// }

// p.then((client)=> {
//     client.connect()
// })
// .catch((err)=> {
//     console.log(err)
// })

// pool.on('connect', ()=> console.log('connection est'))
// pool.on('release', ()=> console.log('release'))
// pool.on('remove', ()=> console.log('removed'))

module.exports = pool;