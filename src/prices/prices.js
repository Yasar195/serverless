const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/place/getprice', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.vehicle_id.length>0&&data.place_id){
            const ids = String(data.vehicle_id)
            connection.query(`select * from place_vehicle where (vehicle_id in (${ids})) and place_id=${data.place_id};`, (err, response)=> {
                err? reject(): resolve(response.rows)
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
        if(data.vehicle_id&&data.place_id&&data.price){
            connection.query(`insert into place_vehicle(vehicle_id, place_id, price) values(${data.vehicle_id}, ${data.place_id}, ${data.price});`, (err)=> {
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

router.post('/addon/getprice', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.vehicle_id.length>0&&data.addon_id.length>0){
            const vids = String(data.vehicle_id)
            const aids = String(data.addon_id)
            connection.query(`select * from addon_vehicle where (vehicle_id in (${vids})) and (addon_id in (${aids}));`, (err, response)=> {
                err? reject(): resolve(response.rows)
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
        if(data.vehicle_id&&data.addon_id&&data.price){
            connection.query(`insert into addon_vehicle(vehicle_id, addon_id, price) values(${data.vehicle_id}, ${data.addon_id}, ${data.price});`, (err)=> {
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