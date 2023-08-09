const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.vehicle_name&&data.daytour_price&&data.pickupprice&&data.dropoffprice&&data.addonprice&&data.vehicle_category){
            connection.query(`insert into vehicles (tour_id, vehicle_name, daytour_price, pickup_price, dropoff_price, addon_price, vehicle_category) values (${data.tour_id}, '${data.vehicle_name}', ${data.daytour_price}, ${data.pickupprice}, ${data.dropoffprice}, ${data.addonprice},'${data.vehicle_category}');`, (err)=> {
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

// router.post('/booking', (req, res)=> {
//     const data = req.body
//     const result = new Promise((resolve, reject)=> {
//         if(data.vehicle_id&&data.start_date&&data.end_date){
//             connection.query(`insert into vehicle_bookings (vehicle_id, start_date, end_date) values (${data.vehicle_id}, '${data.start_date}', '${data.end_date}');`, (err)=> {
//                 if(err){
//                     reject()
//                 }
//                 resolve()
//             })
//         }
//         else{
//             reject()
//         }
//     })
    
//     result.then(()=> {
//         res.status(200).json({
//             result: 'vehicle booked successfully',
//             success: true
//         })
//     })
//     .catch(()=> {
//         res.status(500).json({
//             result: 'vehicle booking failed',
//             success: false
//         })
//     })
// })

router.post('/available', (req, res)=> {
    const data = req.body
    const response = []
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.vehicle_category.length!==0){
            data.vehicle_category.forEach((cat, index)=> {
                connection.query(`select * from vehicles where tour_id=${data.tour_id} and vehicle_category='${cat}';`, (err, result)=> {
                    if(err){
                        reject()
                    }
                    response.push(...result.rows)
                    if(data.vehicle_category.length-1 === index){
                        resolve(response)
                    }
                })
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

router.post('/cat', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.dep_id&&data.vehicle_cat){
            connection.query(`insert into vehicle_cate(dep_id, cat_name) values(${data.dep_id}, '${data.vehicle_cat}');`, (err, result)=> {
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
            result: 'fetching vehicle categories failed',
            success: false
        })
    })
})

module.exports = router