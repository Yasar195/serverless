const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.food_name&&data.food_category&&data.food_type&&data.price){
            connection.query(`insert into food (tour_id, food_name, food_category, food_type, price) values (${data.tour_id}, '${data.food_name}', '${data.food_category}', '${data.food_type}', ${data.price});`, (err)=> {
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
            result: 'food created successfully',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'creating food failed',
            success: false
        })
    })
})

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.tour_id){
            connection.query(`select * from food where tour_id=${req.query.tour_id};`, (err, result)=> {
                if(err){
                    reject()
                }
                resolve(result.rows)
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
        res.status(500).json({
            result: 'fetching foods failed',
            success: false
        })
    })
})

module.exports = router