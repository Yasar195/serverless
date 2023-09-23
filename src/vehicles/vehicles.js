const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.vehicle_name&&data.vehicle_category){
            connection.query(`insert into vehicles (tour_id, vehicle_name, vehicle_category) values (${data.tour_id}, '${data.vehicle_name}',${data.vehicle_category});`, (err)=> {
                if(err){
                    reject()
                }
                else{
                    resolve()
                }
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
                else{
                    resolve(result.rows)
                }
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

router.post('/available', (req, res)=> {
    const data = req.body
    let cate = ``
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.vehicle_category.length!==0){
            cate = String(data.vehicle_category)
            connection.query(`select * from vehicles join vehicle_cate on vehicles.vehicle_category=vehicle_cate.cat_id where tour_id=${data.tour_id} and (vehicle_category IN (${cate}));`, (err, result)=> {
                if(err){
                    reject()
                }
                else{
                    resolve(result.rows)
                }
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
    .catch((err)=> {
        res.status(500).json({
            result: 'available vehicle fetch failed',
            success: false
        })
    })
})

router.get('/place', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.place_id){
            connection.query(`select * from vehicles join place_vehicle on vehicles.vehicle_id = place_vehicle.vehicle_id where place_id=${req.query.place_id};`, (err, result)=> {
                if(err){
                    reject()
                }
                else{
                    resolve(result.rows)
                }
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

router.get('/addon', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.addon_id){
            connection.query(`select * from vehicles join addon_vehicle on vehicles.vehicle_id = addon_vehicle.vehicle_id where addon_id=${req.query.addon_id};`, (err, result)=> {
                if(err){
                    reject()
                }
                else{
                    resolve(result.rows)
                }
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

router.post('/cat', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.dep_id&&data.vehicle_cat){
            connection.query(`insert into vehicle_cate(dep_id, cat_name) values(${data.dep_id}, '${data.vehicle_cat}');`, (err, result)=> {
                if(err){
                    reject()
                }
                else{
                    resolve()
                }
            })
        }
        else{
            reject()
        }
    })
    
    result.then(()=> {
        res.status(200).json({
            result: 'room category added',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'adding room category failed',
            success: false
        })
    })
})

router.get('/cat', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select * from vehicle_cate where dep_id=${req.query.dep_id};`, (err, result)=> {
                if(err){
                    reject()
                }
                else{
                    resolve(result.rows)
                }
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
            result: 'fetching vehicle categories failed',
            success: false
        })
    })
})

router.post('/vehiclecat', (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.tour.length !== 0){
            connection.query(`select distinct cat_id, cat_name from vehicle_cate join vehicles on vehicles.vehicle_category = vehicle_cate.cat_id where (vehicles.tour_id in (${String(data.tour)})) and (vehicles.vehicle_category in (vehicle_cate.cat_id));`, (err, result)=> {
                if(err){
                    reject()
                }
                else{
                    resolve(result.rows)
                }
            })
        }
        else{
            reject()
        }
    })
    
    result.then((data)=> {
        return res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        return res.status(500).json({
            result: 'fetching vehicle categories failed',
            success: false
        })
    })
})

module.exports = router