const connection = require('../utils/Connect')
const router = require('express').Router()

router.get('/', async (req, res)=> {
    const departments = new Promise((resolve, reject) => {
        connection.query(`select * from departments;`,(err, response)=> {
            if(err){
                reject()
            }
            resolve(response.rows)
        })
    })

    departments.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching departments data failed',
            success: false
        })
    })
})

router.get('/:id', async (req, res)=> {
    const departments = new Promise((resolve, reject) => {
        connection.query(`select * from departments where dep_id= ${req.params.id};`,(err, response)=> {
            if(err){
                reject()
            }
            resolve(response.rows)
        })
    })

    departments.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching departments data failed',
            success: false
        })
    })
})

module.exports = router;