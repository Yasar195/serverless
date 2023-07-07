const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.vehicle_name&&data.vehicle_price&&data.vehicle_category){
            connection.query(`insert into vehicles (tour_id, vehicle_name, vehicle_price, vehicle_category) values (${data.tour_id}, '${data.vehicle_name}', ${data.vehicle_price}, '${data.vehicle_category}');`, (err)=> {
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
            result: 'vehicle created successfully',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'creating vehicle failed',
            success: false
        })
    })
})

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.tour_id){
            connection.query(`select * from vehicles where tour_id=${req.query.tour_id};`, (err, result)=> {
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
            result: 'fetching vehicles failed',
            success: false
        })
    })
})

router.post('/booking', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.vehicle_id&&data.start_date&&data.end_date){
            connection.query(`insert into vehicle_bookings (vehicle_id, start_date, end_date) values (${data.vehicle_id}, '${data.start_date}', '${data.end_date}');`, (err)=> {
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
            result: 'vehicle booked successfully',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'vehicle booking failed',
            success: false
        })
    })
})

router.post('/available', (req, res)=> {
    const data = req.body
    const start_date = data.start_date
    const result = new Promise((resolve, reject)=> {
        const res = {}
        if(data.tour_id&&data.start_date&&data.end_date&&data.vehicle_category){
            connection.query(`select * from vehicles where tour_id=${data.tour_id} and vehicle_category='${data.vehicle_category}';`, (err, result)=> {
                if(err){
                    reject()
                }
                res.vehicles = result.rows
                res.bookings = []
                if(res.vehicles.length != 0){
                    result.rows.forEach((row, index)=> {
                        connection.query(`select * from vehicle_bookings where vehicle_id=${row.vehicle_id};`, (err, indres)=> {
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
        if(result.vehicles.length !== 0){
            data = result.vehicles
            result.vehicles.forEach((room, index)=> {
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
            result: 'available vehicle fetch failed',
            success: false
        })
    })
})

module.exports = router