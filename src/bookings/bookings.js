const connection = require('../utils/Connect')
const router = require('express').Router()
const s3 = require('../utils/aws')

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, bookings.booking_date, customers.customer_name, bookings.amount_payable, bookings.amount_paid from bookings join customers on bookings.customer_id=customers.customer_id where bookings.dep_id=${req.query.dep_id} order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        data.forEach((row)=> {
            const balance = parseInt(row.amount_payable) - parseInt(row.amount_paid)
            row.balance_amount = balance
        })

        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "fetching bookings failed",
            success: false
        })
    })
})

router.get('/complete', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, bookings.booking_date, customers.customer_name, bookings.start_date, bookings.end_date from bookings join customers on bookings.customer_id=customers.customer_id where bookings.dep_id=${req.query.dep_id} and bookings.payment_complete=true order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "fetching completed bookings failed",
            success: false
        })
    })
})

router.put('/makecomplete', (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.booking_id){
            connection.query(`update bookings set payment_complete=true where booking_id=${data.booking_id};`, (err)=> {
                if(err){
                    reject()
                }
                resolve()
            })
        }
        else{
            reject()
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: "update bookings success",
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "update bookings failed",
            success: false
        })
    })
})

router.get('/notadvance', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, bookings.booking_date, customers.customer_name, bookings.advance_amount, bookings.amount_payable, tour.tour_name, users.user_name, tour.tour_code, bookings.start_date, bookings.end_date from bookings join customers on bookings.customer_id=customers.customer_id join tour on bookings.tour_id=tour.tour_id join users on bookings.user_id=users.user_id where bookings.dep_id=${req.query.dep_id} and advance_paid=false and bookings.payment_complete=false and bookings.is_notif=false order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "fetching not advanced bookings failed",
            success: false
        })
    })
})

router.get('/incomplete', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, customers.customer_name, bookings.start_date, bookings.end_date, bookings.amount_payable, bookings.amount_paid from bookings join customers on bookings.customer_id=customers.customer_id where bookings.dep_id=${req.query.dep_id} and bookings.advance_paid=true and bookings.is_notif=false and bookings.payment_complete=false order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};;`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        data.forEach((row)=> {
            const balance = parseInt(row.amount_payable) - parseInt(row.amount_paid)
            row.balance_amount = balance
        })
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "fetching incomplete bookings failed",
            success: false
        })
    })
})

router.post('/sendnotification', (req, res)=> {
    const body = req.body;
    const result = new Promise((resolve, reject)=> {
        if(body.booking_id&&body.message){
            connection.query(`update bookings set is_notif=true, messages='${body.message}' where booking_id=${body.booking_id};`, (err)=> {
                if(err){
                    console.log(err)
                    reject()
                }
                resolve()
            })
        }
        else{
            reject()
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: "notification send successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "notification send failed",
            success: false
        })
    })
})

router.get('/incomplete', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_date, customers.customer_name, bookings.advance_amount, bookings.amount_payable, bookings.amount_paid, tour.tour_name, users.user_name, tour.tour_code, bookings.start_date, bookings.end_date from bookings join customers on bookings.customer_id=customers.customer_id join tour on bookings.tour_id=tour.tour_id join users on bookings.user_id=users.user_id where bookings.dep_id=${req.query.dep_id} and advance_paid=false order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "fetching incomplete bookings failed",
            success: false
        })
    })
})

router.put('/makepayments', (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.booking_id&&data.amount){
            connection.query(`insert into transactions (booking_id, amount) values (${data.booking_id}, ${data.amount});`, (err)=> {
                if(err){
                    reject()
                }
                connection.query(`update bookings set messages=null, is_notif=false, advance_paid=true, amount_paid=amount_paid+${parseInt(data.amount)} where booking_id=${data.booking_id};`, (err)=> {
                    if(err){
                        reject()
                    }
                    resolve()
                })
            })
        }
        else{
            reject()
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: "payments updated",
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "payment updation failed",
            success: false
        })
    })
})

router.get('/accounts/notifications', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, bookings.booking_date, customers.customer_name, bookings.advance_amount, bookings.amount_payable, bookings.amount_paid, users.user_name, bookings.start_date, bookings.messages, bookings.end_date from bookings join customers on bookings.customer_id=customers.customer_id join users on bookings.user_id=users.user_id where bookings.dep_id=${req.query.dep_id} and bookings.is_notif=true order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        data.forEach((row)=> {
            const balance = parseInt(row.amount_payable) - parseInt(row.amount_paid)
            row.balance_amount = balance
        })
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "fetching not advanced bookings failed",
            success: false
        })
    })
})

module.exports = router