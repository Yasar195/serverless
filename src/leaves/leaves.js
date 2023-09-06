const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', async (req, res) => {
    const data = req.body
    const result = new Promise((resolve, reject) => {
        if(data.reason && data.start_date && data.dep_id && data.branch_id){
            connection.query(`insert into leave_request (user_id, start_date, reason, dep_id, branch_id ${data.end_date? `, end_date`: ''}) values ('${res.locals.uid}', '${data.start_date}', '${data.reason}', ${data.dep_id}, ${data.branch_id} ${data.end_date? `, '${data.end_date}'`: ''});`, (err)=> {
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

    result.then(() => {
        res.status(200).json({
            result: "leave request success",
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "leave request failed",
            success: false
        })
    })
})

router.get('/mystatus', (req, res) => {
    const result = new Promise((resolve, reject) => {
        connection.query(`select * from leave_request where user_id='${res.locals.uid}' order by leave_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
            err ? reject(): resolve(response.rows)
        })
    })

    result.then((data) => {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching leave status failed",
            success: false
        })
    })
})

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject) => {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select leave_request.leave_id, users.user_name, leave_request.apply_date, leave_request.start_date, leave_request.reason, leave_request.end_date from leave_request join users on leave_request.user_id = users.user_id where leave_request.dep_id=${req.query.dep_id} and leave_request.branch_id=${req.query.branch_id} and leave_request.status='pending';`, (err, response)=> {
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

    result.then((data) => {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching leave requests failed",
            success: false
        })
    })
})

router.post('/response', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject) => {
        if(data.leave_id && data.status){
            connection.query(`update leave_request set status='${data.status}' where leave_id=${data.leave_id};`, (err)=> {
                err ? reject(): resolve()
            })
        }
        else{
            reject()
        }
    })

    result.then(() => {
        res.status(200).json({
            result: 'leave status updated',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "updating leave status failed",
            success: false
        })
    })
})




module.exports = router