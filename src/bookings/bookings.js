const connection = require('../utils/Connect')
const router = require('express').Router()
const { generateRandomString } = require('../utils/utils')
const s3 = require('../utils/aws')
const { ConnectParticipant } = require('aws-sdk')

router.post('/', (req, res)=> {
    const key = `itineraries/${generateRandomString(10)}.pdf`
    if(!req.files){
        return res.status(400).json({
            result: "missing confirm itinerary",
            success: false
        })
    }

    const file = req.files.pdf
    const params = {
        Bucket: 'tele-profile',
        Key: key,
        Body: file.data,
    };
    const data = JSON.parse(req.body.data)
    const result = new Promise((resolve, reject)=> {
        if(data.customer_id&&data.amount_payable&&data.advance_amount&&data.tasks.length!=0&&data.bookables&&data.tour_id&&data.start_date&&data.end_date&&data.dep_id&&data.branch_id){
            const string = String(data.bookables)
            s3.upload(params, function (err) {
                if (err) {
                  reject()
                }
                else{
                    connection.query(`insert into bookings (customer_id, user_id, amount_payable, advance_amount, bookables, tour_id, start_date, end_date, dep_id, branch_id, confirm_itinerary) values (${data.customer_id}, '${res.locals.uid}', ${data.amount_payable}, ${data.advance_amount}, '${string}', ${data.tour_id}, '${data.start_date}', '${data.end_date}', ${data.dep_id}, ${data.branch_id}, '${key}') returning booking_id;`, (err, response)=> {
                        if(err){
                            reject()
                        }
                        else{
                            const booking_id = response.rows[0].booking_id;
                            data.tasks.forEach((day)=> {
                                connection.query(`insert into days(booking_id) values (${booking_id}) returning day_id;`, (err, dayres)=> {
                                    if(err){
                                        reject()
                                    }
                                    else{
                                        const day_id = dayres.rows[0].day_id;
                                        day.forEach(task=> {
                                            connection.query(`insert into tasks (day_id, task) values (${day_id}, '${task}');`, (err)=> {
                                                err? reject(): resolve()
                                            })
                                        })
                                    }
                                })
                            })
                        }
                    })
                }
            })
        }
        else{
            reject()
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: "bookings success",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "bookings failed",
            success: false
        })
    })
})

router.put('/', (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.booking_id){
            connection.query(`delete from transactions where booking_id=${data.booking_id};`, (err)=> {
                if(err){
                    reject()
                }
                else{
                    connection.query(`select day_id from days where booking_id=${data.booking_id};`, (err, resday)=> {
                        if(err){
                            reject()
                        }
                        else{
                            resday.rows.forEach((day, index) => {
                                connection.query(`delete from tasks where day_id=${day.day_id};`, (err)=> {
                                    if(err){
                                        reject()
                                    }
                                    else{
                                        if(index === resday.rows.length-1){
                                            connection.query(`delete from days where booking_id=${data.booking_id};`, (err)=> {
                                                if(err){
                                                    reject()
                                                }
                                                else{
                                                    connection.query(`delete from bookings where booking_id=${data.booking_id} returning points, user_id;`, (err, resid)=> {
                                                        if(err){
                                                            reject()
                                                        }
                                                        else{
                                                            connection.query(`update users set points=points-${parseInt(resid.rows[0].points)} where user_id='${resid.rows[0].user_id}';`, (err)=> {
                                                                err? reject(): resolve()
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                })
                            })
                        }
                    })
                }
            })
        }
        else{
            reject()
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: "deletion success",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "deletion failed",
            success: false
        })
    })
})

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, bookings.booking_date, customers.customer_name, bookings.amount_payable, bookings.amount_paid from bookings join customers on bookings.customer_id=customers.customer_id where bookings.dep_id=${req.query.dep_id} order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                err? reject(): resolve(response.rows)
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

router.get('/service', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, bookings.start_date, bookings.end_date ,customers.customer_name, customers.customer_phone from bookings join customers on bookings.customer_id=customers.customer_id where bookings.dep_id=${req.query.dep_id} and bookings.status!='Completed' order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                err? reject(): resolve(response.rows)
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
            result: "fetching bookings failed",
            success: false
        })
    })
})

router.put('/purchase', (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.booking_id&&data.staff_id){
            connection.query(`update bookings set staff_id='${data.staff_id}' where booking_id=${data.booking_id};`, (err)=> {
                err ? reject(): resolve()
            })
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: "bookings updated",
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


router.get('/purchase/booked', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, bookings.booking_date, customers.customer_name, users.user_name, bookings.start_date, bookings.end_date, bookings.bookables from bookings join customers on bookings.customer_id=customers.customer_id join users on bookings.staff_id=users.user_id where bookings.dep_id=${req.query.dep_id} and bookings.advance_paid=true and staff_id is not null order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                err? reject(): resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        data.forEach((row)=> {
            row.bookables = row.bookables.split(',')
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


router.get('/staff', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select bookings.booking_id, bookings.booking_date, customers.customer_name, bookings.start_date, bookings.end_date from bookings join customers on bookings.customer_id=customers.customer_id where bookings.staff_id='${res.locals.uid}' limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
            err? reject(): resolve(response.rows)
        })
    })

    result.then((data)=> {
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

router.get('/staff/tasks', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.booking_id){
            connection.query(`select * from days where booking_id=${req.query.booking_id};`, (err, response)=> {
                if(err){
                    reject()
                }
                else{
                    const idArray = []
                    response.rows.forEach((day)=> idArray.push(day.day_id))
                    connection.query(`select * from tasks where (day_id in (${String(idArray)}));`, (err, resp)=> {
                        if(err){
                            reject()
                        }
                        else{
                            const groupedByDayId = resp.rows.reduce((result, item) => {
                                const existingGroup = result.find((group) => group[0].day_id === item.day_id);
                                if (existingGroup) {
                                  existingGroup.push(item);
                                } else {
                                  result.push([item]);
                                }
                                return result;
                            }, []);
                            resolve(groupedByDayId)
                        }
                    })
                }
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
            result: "fetching tasks failed",
            success: false
        })
    })
})

router.put('/staff/tasks', (req, res)=> {
    const data = req.body;
    console.log(data)
    const result = new Promise((resolve, reject)=> {
        if(data.task_id&&data.status){
            connection.query(`update tasks set status='${data.status}'${data.reason? `, reason='${data.reason}'`: ''} where task_id=${data.task_id};`, (err)=> {
                err? reject(): resolve()
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        res.status(200).json({
            result: 'updating task success',
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "updating tasks failed",
            success: false
        })
    })
})

router.get('/purchase', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, bookings.booking_date, customers.customer_name, bookings.start_date, bookings.end_date, bookings.bookables from bookings join customers on bookings.customer_id=customers.customer_id where bookings.dep_id=${req.query.dep_id} and bookings.advance_paid=true and staff_id is null order by booking_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                err? reject(): resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        data.forEach((row)=> {
            row.bookables = row.bookables.split(',')
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
                err? reject(): resolve(response.rows)
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
                err? reject(): resolve()
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
                err? reject(): resolve(response.rows)
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
                err? reject(): resolve(response.rows)
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
                err? reject(): resolve()
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
                err? reject(): resolve(response.rows)
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
        if(data.booking_id&&data.amount&&data.branch_id, data.dep_id){
            connection.query(`insert into transactions (booking_id, amount, dep_id, branch_id) values (${data.booking_id}, ${data.amount}, ${data.dep_id}, ${data.branch_id});`, (err)=> {
                if(err){
                    reject()
                }
                else{
                    const amount = parseInt(data.amount)
                    const points = Math.floor((amount*0.03)/20)
                    connection.query(`update bookings set messages=null, is_notif=false, advance_paid=true, points=points+${points}, amount_paid=amount_paid+${parseInt(data.amount)} where booking_id=${data.booking_id} returning user_id;`, (err, resuser)=> {
                        if(err){
                            reject()
                        }
                        else{
                            const user_id = resuser.rows[0].user_id
                            connection.query(`update users set points=points+${points} where user_id='${user_id}';`, (err)=> {
                                err? reject(): resolve()
                            })
                        }
                    })
                }
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
                err? reject(): resolve(response.rows)
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

router.get('/telecaller', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select bookings.booking_date, tour.tour_name, customers.customer_id, bookings.points from bookings join customers on bookings.customer_id = customers.customer_id join tour on bookings.tour_id=tour.tour_id where bookings.user_id='${res.locals.uid}' and EXTRACT(MONTH FROM bookings.booking_date) = EXTRACT(MONTH FROM CURRENT_DATE);`, (err, response)=> {
            err? reject(): resolve(response.rows)
        })
    })

    result.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching booking detailes failed',
            success: false
        })
    })
})

module.exports = router