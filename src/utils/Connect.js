const { Client } = require('pg')
require('dotenv').config()

let client = null;

let p = new Promise((resolve, reject) => {
    client = new Client({
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        ssl: {
            rejectUnauthorized: false
        }
    })
    if(client !== ""){
        resolve(client);
    }
    else{
        reject();
    }
})

p.then((client)=> {
    client.connect()
})
.catch((err)=> {
    console.log(err)
})

module.exports = client;