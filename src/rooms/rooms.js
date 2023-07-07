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
    const start_date = data.start_date
    const result = new Promise((resolve, reject)=> {
        const res = {}
        if(data.tour_id&&data.start_date&&data.end_date&&data.room_category){
            connection.query(`select * from rooms where tour_id=${data.tour_id} and room_category='${data.room_category}';`, (err, result)=> {
                if(err){
                    reject()
                }
                res.rooms = result.rows
                res.bookings = []
                if(res.rooms.length != 0){
                    result.rows.forEach((row, index)=> {
                        connection.query(`select * from room_bookings where room_id=${row.room_id};`, (err, indres)=> {
                            if(err){
                                reject()
                            }
                            res.bookings[index] = indres.rows
                            if(index === result.rows.length-1){
                                resolve(res)
                            }
                        })
                    })
                }
                else{
                    resolve(res)
                }
            })
        }
        else{
            reject()
        }
    })
    
    result.then((result)=> {
        let data
        if(result.rooms.length !== 0){
            data = result.rooms
            result.rooms.forEach((room, index)=> {
                result.bookings[index].forEach(booking => {
                    const date = new Date(start_date)
                    if(date<=booking.end_date){
                        data.splice(index, 1)
                    }
                })
            })
        }
        else{
            data = []
        }

        res.status(200).json({
            result: data,
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