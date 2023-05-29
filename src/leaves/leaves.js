const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', async (req, res) => {
    const data = req.body
    const result = new Promise((resolve, reject) => {
        if(data.reason && data.apply_date && data.return_date && data.dep_id && data.branch_id){
            connection.query(`insert into leave_request (user_id, apply_date, comeback_date, reason, dep_id, branch_id) values ('${res.locals.uid}', '${data.apply_date}', '${data.return_date}', '${data.reason}', ${data.dep_id}, ${data.branch_id});`, (err)=> {
                err ? reject(): resolve()
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
        connection.query(`select * from leave_request where user_id='${res.locals.uid}';`, (err, response)=> {
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

module.exports = router