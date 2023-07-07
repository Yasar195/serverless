const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const users = require('./users/users')
const departments = require('./departments/departments');
const branches = require('./branch/branch');
const leads = require('./leads/leads');
const staff = require('./staff/staff');
const tours = require('./tours/tours');
const pdf = require('./pdf/pdf');
const audio = require('./audio/audio')
const leaves = require('./leaves/leaves')
const rooms = require('./rooms/rooms')
const vehicles = require('./vehicles/vehicles')
const bookings = require('./bookings/bookings')
const fileUpload = require('express-fileupload');
const { authenticate, router } = require('../src/auth/auth')
const cors = require('cors')

app.get('/', (req, res)=> {
    res.status(200).json({
        status: 200,
        headers: req.headers,
        body: "Hello world"
    })
})

app.use(fileUpload())
app.use(cors())
app.use(bodyParser.json())
app.use(authenticate)
app.use('/users', users)
app.use('/departments', departments)
app.use('/branches', branches)
app.use('/auth', router)
app.use('/leads', leads)
app.use('/staffs', staff)
app.use('/tours', tours)
app.use('/pdf', pdf)
app.use('/audio', audio)
app.use('/leaves', leaves)
app.use('/rooms', rooms)
app.use('/vehicles', vehicles)
app.use('/bookings', bookings)


module.exports = app