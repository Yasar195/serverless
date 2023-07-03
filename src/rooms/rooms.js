const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.room_number&&data.room_building&&data.room_price&&data.room_category){
            connection.query(`insert into rooms (tour_id, room_number, room_building, room_price, room_category) values (${data.tour_id}, ${data.room_number}, '${data.room_building}', ${data.room_price}, '${data.room_category}');`, (err)=> {
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
            result: 'room created successfully',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'creating room failed',
            success: false
        })
    })
})

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.tour_id){
            connection.query(`select * from rooms where tour_id=${req.query.tour_id};`, (err, result)=> {
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
            result: 'fetching rooms failed',
            success: false
        })
    })
})

module.exports = router