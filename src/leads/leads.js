const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', async (req, res) => {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.customer_id && data.user_id && data.dep_id && data.branch_id){
            connection.query(`update customers set assigned=true, user_id='${data.user_id}' where customer_id=${data.customer_id};`, (err)=> {
                if(err){
                    reject()
                }
                else{
                    if(data.follow_date){
                        connection.query(`insert into leads (user_id, customer_id, follow_up, follow_up_date, dep_id, branch_id) values ('${data.user_id}', ${data.customer_id}, true, '${data.follow_date}', ${data.dep_id}, ${data.branch_id});`, (err) => {
                            err? reject(): resolve()
                        })
                    }
                    else{
                        connection.query(`insert into leads (user_id, customer_id, dep_id, branch_id) values ('${data.user_id}', ${data.customer_id}, ${data.dep_id}, ${data.branch_id});`, (err) => {
                            err? reject(): resolve()
                        })
                    }
                }
            })
        }
        else{
            reject()
        }
    })
    result.then(()=> {
        res.status(200).json({
            result: "leads assigned successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "leads assignation failed",
            success: false
        })
    })
})

router.get('/dash/followup', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select * from customers join users on customers.user_id=users.user_id where customers.assigned=false and customers.customer_progress!='Not started' and customers.customer_progress!='Booked' and customers.dep_id=${req.query.dep_id} and customers.branch_id=${req.query.branch_id} and customers.booked=false ${req.query.name? `and lower(customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.progress? `and customers.customer_progress='${req.query.progress}'`: ''} ${req.query.id? `and customers.customer_id=${req.query.id} or customers.cid=${req.query.id}`: ''} ${req.query.phone? `and customers.customer_phone like '%${req.query.phone}%'`: ''} and users.user_type='telecaller' limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, result)=> {
                err? reject(): resolve(result.rows)
            })
        }
    })
    
    result.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching follow ups failed',
            success: false
        })
    })
})

router.get('/followup', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select * from customers join leads on customers.customer_id=leads.customer_id where leads.user_id = '${res.locals.uid}' and leads.follow_up=true and leads.follow_up_date<=current_date ${req.query.name? `and lower(customers.customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.id? `and customers.cid=${req.query.id}`: ''} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, result)=> {
            err? reject(): resolve(result.rows)
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
            result: "fetching follow up failed",
            success: false
        })
    })
})

router.get('/fresh', async (req, res) => {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select * from customers join leads on customers.customer_id=leads.customer_id where leads.user_id = '${res.locals.uid}' and leads.follow_up=false and customers.customer_progress='Not started' ${req.query.name? `and lower(customers.customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.id? `and customers.cid=${req.query.id}`: ''} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, result)=> {
            err? reject(): resolve(result.rows)
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
            result: "fetching leads failed",
            success: false
        })
    })
})

router.get('/old', async (req, res) => {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select * from customers join leads on customers.customer_id=leads.customer_id where leads.user_id = '${res.locals.uid}' and leads.follow_up=false and customers.customer_progress!='Not started' ${req.query.name? `and lower(customers.customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.id? `and customers.cid=${req.query.id}`: ''} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, result)=> {
            err? reject(): resolve(result.rows)
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
            result: "fetching leads failed",
            success: false
        })
    })
})

router.get('/getanalytics', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        const data = {}
        connection.query(`select count(*) from customer_response where user_id='${res.locals.uid}' and EXTRACT(MONTH FROM call_date) = EXTRACT(MONTH FROM CURRENT_DATE);`, (err, result)=> {
            if(err){
                reject()
            }
            else{
                data.calls = parseInt(result.rows[0].count)
                connection.query(`select count(*) from leads where user_id='${res.locals.uid}' and follow_up=true;`, (err, response) => {
                    if(err){
                        reject()
                    }
                    else{
                        data.follow_ups = parseInt(response.rows[0].count)
                        connection.query(`select points, target_points from users where user_id='${res.locals.uid}';`, (err, poires)=> {
                            if(err){
                                reject()
                            }
                            else{
                                data.points = poires.rows[0].points
                                data.target_points = parseInt(poires.rows[0].target_points)
                                connection.query(`select count(*) from bookings where user_id='${res.locals.uid}' and EXTRACT(MONTH FROM booking_date) = EXTRACT(MONTH FROM CURRENT_DATE)`, (err, boores)=> {
                                    if(err){
                                        reject()
                                    }
                                    else{
                                        data.bookings = parseInt(boores.rows[0].count)
                                        resolve(data)
                                    }
                                })
                            }
                        })
                    }
                })
            }
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
            result: 'fetching analytics failed',
            success: false
       })     
    })
})

router.get('/tour', (req, res)=> {
    const result = new Promise((resolve, reject) => {
        if(req.query.tour_code){
            connection.query(`select * from leads join customers on leads.customer_id=customers.customer_id where customers.tour_code='${req.query.tour_code}' and leads.user_id='${res.locals.uid}';`, (err, response)=> {
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
            success:true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: 'fetching lead failed',
            success: false
        })
    })
})

router.get('/individual', (req, res)=> {
    const result = new Promise((resolve, reject) => {
        if(req.query.user_id){
            const isFollowup = req.query.follow_up === "true"? true: false
            connection.query(`select * from leads join customers on leads.customer_id=customers.customer_id join users on leads.user_id=users.user_id where leads.user_id='${req.query.user_id}' ${req.query.name? `and lower(customers.customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.id? `and customers.cid=${req.query.id}`: ''} ${req.query.phone? `and customers.customer_phone like '%${req.query.phone}%'`: ''} and leads.follow_up=${isFollowup} ${isFollowup? ``: `${req.query.progress? `and customers.customer_progress='Not started'`: `and customers.customer_progress!='Not started'`}`} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
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
            success:true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: 'fetching leads failed',
            success: false
        })
    })
})

router.put('/individual', (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject) => {
        if(data.lead_id&&data.customer_id&&data.progress){
            connection.query(`update customers set assigned=false, customer_progress='${data.progress}' where customer_id=${data.customer_id};`, (err)=> {
                if(err){
                    reject()
                }
                else{
                    connection.query(`delete from leads where lead_id=${data.lead_id};`, (err)=> {
                        err? reject(): resolve()
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
            result: "lead deletion successfull",
            success:true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: 'lead deletion failed',
            success: false
        })
    })
})

router.put('/individual/transfer', (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject) => {
        if(data.lead_id&&data.user_id&&data.customer_id){
            connection.query(`update customers set user_id='${data.user_id}' where customer_id=${data.customer_id};`, (err)=> {
                if(err){
                    reject()
                }
                else{
                    connection.query(`update leads set user_id='${data.user_id}' where lead_id=${data.lead_id};`, (err)=> {
                        err? reject(): resolve()
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
            result: "lead transfer successfull",
            success:true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: 'lead transfer failed',
            success: false
        })
    })
})

router.get('/:lead_id', (req, res) => {
    const result = new Promise((resolve, reject) => {
        if(req.params.lead_id){
            connection.query(`select * from leads join customers on leads.customer_id=customers.customer_id where leads.lead_id=${req.params.lead_id} and leads.user_id='${res.locals.uid}';`, (err, response)=> {
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
            success:true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: 'fetching lead failed',
            success: false
        })
    })
})

module.exports = router;