const connection = require('../utils/Connect')
const router = require('express').Router()

router.get('/places', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.vehicle_id&&req.query.place_id){
            connection.query(`select * from place_vehicle where place_id=${req.query.place_id} and vehicle_id=${req.query.vehicle_id};`, (err, response)=> {
                err? reject(): resolve(response.rows[0])
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
            result: 'fetching place vehicle price failed',
            success: true
        })
    })
})

router.post('/places', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.vehicle_id&&data.place_id&&data.pickup_price&&data.dropoff_price&&data.daytour_price&&data.addon_price){
            connection.query(`insert into place_vehicle(vehicle_id, place_id, pickup_price, dropoff_price, daytour_price, addon_price) values(${data.vehicle_id}, ${data.place_id}, ${data.pickup_price}, ${data.dropoff_price},${data.daytour_price},${data.addon_price});`, (err)=> {
                err? reject(): resolve()
            })
        }
        else{
            reject()
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: 'adding place vehicle price success',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'adding place vehicle price failed',
            success: true
        })
    })
})

router.get('/addons', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.vehicle_id&&req.query.addon_id){
            connection.query(`select * from addon_vehicle where addon_id=${req.query.addon_id} and vehicle_id=${req.query.vehicle_id};`, (err, response)=> {
                err? reject(): resolve(response.rows[0])
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
            result: 'fetching addon vehicle price failed',
            success: true
        })
    })
})

router.post('/addons', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.vehicle_id&&data.addon_id&&data.pickup_price&&data.dropoff_price&&data.daytour_price&&data.addon_price){
            connection.query(`insert into addon_vehicle(vehicle_id, addon_id, pickup_price, dropoff_price, daytour_price, addon_price) values(${data.vehicle_id}, ${data.addon_id}, ${data.pickup_price}, ${data.dropoff_price},${data.daytour_price},${data.addon_price});`, (err)=> {
                err? reject(): resolve()
            })
        }
        else{
            reject()
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: 'adding addon vehicle price success',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'adding addon vehicle price failed',
            success: true
        })
    })
})

module.exports = router