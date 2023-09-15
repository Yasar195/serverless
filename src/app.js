const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const users = require('./users/users')
const departments = require('./departments/departments');
const connection = require('./utils/Connect')
const branches = require('./branch/branch');
const leads = require('./leads/leads');
const staff = require('./staff/staff');
const tours = require('./tours/tours');
const audio = require('./audio/audio')
const leaves = require('./leaves/leaves')
const rooms = require('./rooms/rooms')
const snapshots = require('./snapshots/snapshots')
const vehicles = require('./vehicles/vehicles')
const bookings = require('./bookings/bookings')
const progress = require('./progress/progress')
const transactions = require('./transactions/transactions')
const foods = require('./food/food')
const fileUpload = require('express-fileupload');
const { authenticate, router } = require('../src/auth/auth')
const cors = require('cors');

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

app.post('/application/users', async (req, res)=> {
    const customer = req.body
    const upload = new Promise((resolve, reject)=> {
        if(customer.customer_name && customer.customer_id && customer.customer_phone && customer.customer_vehicle && customer.customer_whatapp && customer.customer_progress && customer.customer_source && customer.customer_address && customer.customer_city && customer.customer_remarks && customer.dep_id && customer.user_id && customer.branch_id && String(customer.customer_pax) && customer.customer_category){
            connection.query(`insert into customers (cid, customer_name, customer_phone,customer_vehicle, customer_whatsapp, customer_progress, customer_pax, customer_source, customer_address, customer_category, customer_city, customer_remarks, dep_id, user_id, branch_id) values (${customer.customer_id}, '${customer.customer_name}', '${customer.customer_phone}', '${customer.customer_vehicle}', '${customer.customer_whatapp}', '${customer.customer_progress}', ${customer.customer_pax}, '${customer.customer_source}', '${customer.customer_address}', '${customer.customer_category}','${customer.customer_city}', '${customer.customer_remarks}', ${customer.dep_id}, '${customer.user_id}', ${customer.branch_id});`, (err)=> {
                if(err){
                    reject()
                }
                else{
                    resolve()
                }
            })
        }
        else{
            reject()
        }
    })

    upload.then(()=> {
        res.status(200).json({
            result: "user data upload success",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "user data upload failed",
            success: false
        })
    })
})

// app.use(authenticate)
app.use('/users', users)
app.use('/departments', departments)
app.use('/branches', branches)
app.use('/auth', router)
app.use('/leads', leads)
app.use('/staffs', staff)
app.use('/tours', tours)
app.use('/audio', audio)
app.use('/leaves', leaves)
app.use('/rooms', rooms)
app.use('/vehicles', vehicles)
app.use('/bookings', bookings)
app.use('/progress', progress)
app.use('/transactions', transactions)
app.use('/snapshots', snapshots)
app.use('/foods', foods)


app.all('*', (req, res)=> {
    res.status(404).json({
        result: "requested resource not found",
        success: false
    })
})


module.exports = app