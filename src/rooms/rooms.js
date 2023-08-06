const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.room_number&&data.room_building&&data.room_price&&data.room_category&&data.room_type){
            connection.query(`insert into rooms (tour_id, room_number, room_building, room_price, room_category, room_type) values (${data.tour_id}, ${data.room_number}, '${data.room_building}', ${data.room_price}, '${data.room_category}', '${data.room_type}');`, (err)=> {
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

router.post('/booking', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.room_id&&data.start_date&&data.end_date){
            connection.query(`insert into room_bookings (room_id, start_date, end_date) values (${data.room_id}, '${data.start_date}', '${data.end_date}');`, (err)=> {
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
            result: 'room booked successfully',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'room booking failed',
            success: false
        })
    })
})

router.post('/available', (req, res)=> {
    const data = req.body
    const response = []
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.room_category.length !==0){
            data.room_category.forEach((cat, index)=> {
                connection.query(`select * from rooms where tour_id=${data.tour_id} and room_category='${cat}' ${data.room_type? ` and room_type='${data.room_type}'`: ''};`, (err, result)=> {
                    if(err){
                        reject()
                    }
                    response.push(...result.rows)
                    if(data.room_category.length-1===index){
                        resolve(response)
                    }
                })
            })
        }
        else{
            reject()
        }
    })
    
    result.then((result)=> {
        res.status(200).json({
            result: result,
            success: true
        })
    })
    .catch((err)=> {
        console.log(err)
        res.status(500).json({
            result: 'available room fetch failed',
            success: false
        })
    })
})

module.exports = router