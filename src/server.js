const app = require('./app')
const server = require('http').createServer(app)
const serverless = require('serverless-http')
const PORT = process.env.PORT || 8080

if(process.env.ENVIRONMENT === "lambda"){
    module.exports.handler = serverless(app)
}
else{
    server.listen(PORT)
}