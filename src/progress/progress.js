const connection = require('../utils/Connect')
const router = require('express').Router()

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject) => {
        if(req.query.booking_id){
            connection.query(`select * from progress join users on progress.user_id=users.user_id where progress.booking_id=${req.query.booking_id} order by progress_id desc;`, (err, response)=> {
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
            success:true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: 'fetching progress failed',
            success: false
        })
    })
})

module.exports = router