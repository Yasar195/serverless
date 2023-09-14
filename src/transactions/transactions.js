const connection = require('../utils/Connect')
const router = require('express').Router()

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select * from transactions where dep_id=${req.query.dep_id} ${req.query.booking_id? ` and booking_id=${req.query.booking_id}`: ''} order by transaction_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                if(err){
                    reject()
                }
                else{
                    resolve(response.rows)
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
            result: "fetching transactions failed",
            success: false
        })
    })
})

module.exports = router;