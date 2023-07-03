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
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.start_date&&data.end_date){
            connection.query(`select * from rooms where tour_id=${data.tour_id};`, (err, result)=> {
                if(err){
                    reject()
                }
                result.rows.forEach((row)=> {
                    connection.query(`select * from room_bookings where room_id=${row.room_id};`, (err, indres)=> {
                        if(err){
                            reject()
                        }
                        indres.rows.forEach((booking)=> {
                            console.log(booking.end_date)
                            const booked = String(booking.end_date)
                            console.log(booked)
                            console.log(data.start_date)
                            if(data.start_date<=booking.end_date){
                                console.log('i executed')
                                result.rows.splice(1, row)
                            }
                        })
                    })
                })
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
            result: 'available room fetch failed',
            success: false
        })
    })
})

module.exports = router