const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', async (req, res) => {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.customer_id && data.user_id && data.dep_id && data.branch_id){
            connection.query(`update customers set assigned=true where customer_id=${data.customer_id};`, (err)=> {
                if(err){
                    reject()
                }
                if(data.follow_date){
                    connection.query(`insert into leads (user_id, customer_id, follow_up, follow_up_date, dep_id, branch_id) values ('${data.user_id}', ${data.customer_id}, true, '${data.follow_date}', ${data.dep_id}, ${data.branch_id});`, (err, response) => {
                        if(err){
                            reject()
                        }
                        resolve()
                    })
                }
                else{
                    connection.query(`insert into leads (user_id, customer_id, dep_id, branch_id) values ('${data.user_id}', ${data.customer_id}, ${data.dep_id}, ${data.branch_id});`, (err, response) => {
                        if(err){
                            reject()
                        }
                        resolve()
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
        if(req.query.dep_id){
            connection.query(`select users.user_name, leads.follow_up_date, customers.customer_name from leads join users on leads.user_id = users.user_id join customers on leads.customer_id = customers.customer_id where leads.dep_id=${req.query.dep_id} and leads.follow_up=true;`, (err, result)=> {
                if(err){
                    reject()
                }
                resolve(result.rows)
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
        connection.query(`select * from customers join leads on customers.customer_id=leads.customer_id where leads.user_id = '${res.locals.uid}' and leads.follow_up=true;`, (err, result)=> {
            if(err){
                reject()
            }
            resolve(result.rows)
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

router.get('/', async (req, res) => {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select * from customers join leads on customers.customer_id=leads.customer_id where leads.user_id = '${res.locals.uid}' and leads.follow_up=false;`, (err, result)=> {
            if(err){
                reject()
            }
            resolve(result.rows)
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
        connection.query(`select count(*) from customer_response where user_id='${res.locals.uid}';`, (err, result)=> {
            if(err){
                reject()
            }
            data.calls = result.rows[0].count
            connection.query(`select count(*) from leads where user_id='${res.locals.uid}' and follow_up=true;`, (err, response) => {
                if(err){
                    reject()
                }
                data.follow_ups = response.rows[0].count
                resolve(data)
            })
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

module.exports = router;