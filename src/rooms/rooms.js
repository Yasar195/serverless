const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.room_number&&data.room_building&&data.room_price&&data.room_category&&data.room_type){
            connection.query(`insert into rooms (tour_id, room_number, room_building, room_price, room_category, room_type) values (${data.tour_id}, ${data.room_number}, '${data.room_building}', ${data.room_price}, ${data.room_category}, '${data.room_type}');`, (err)=> {
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

router.put('/', (req, res)=> {
    const data = req.data
    const result = new Promise((resolve, reject)=> {
        if(data.room_id&&data.room_number&&data.room_building&&data.room_price){
            connection.query(`update rooms set room_building='${data.room_building}', room_number=${data.room_number}, room_price=${data.room_price} where room_id=${data.room_id};`, (err)=> {
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
            result: 'room update success',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'room updation failed',
            success: false
        })
    })
})

router.post('/available', async (req, res)=> {
    const data = req.body
    let cate = ``
    let type = ``
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.room_category.length !==0&&data.room_type.length !== 0){
            cate = String(data.room_category)
            data.room_type.forEach((cat, index)=> {
                if(index !== data.room_type.length-1){
                    type += `'${cat}', `
                }
                else{
                    type += `'${cat}'`
                }
            })
            connection.query(`select * from rooms join room_cate on rooms.room_category=room_cate.cat_id where tour_id=${data.tour_id} and (room_category IN (${cate})) and (room_type IN (${type}));`, (err, result)=> {
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
    
    result.then((result)=> {
        return res.status(200).json({
            result: result,
            success: true
        })
    })
    .catch(()=> {
        return res.status(500).json({
            result: 'available room fetch failed',
            success: false
        })
    })
})

router.post('/cat', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.dep_id&&data.room_cat){
            connection.query(`insert into room_cate(dep_id, cat_name) values(${data.dep_id}, '${data.room_cat}');`, (err, result)=> {
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

router.post('/types', (req, res)=> {
    const data = req.body
    const tourstr = String(data.tour)
    const catstr = String(data.cat)
    const arrayres = []
    const result = new Promise((resolve, reject)=> {
        if(data.tour.length!==0&data.cat.length!==0){
            connection.query(`select distinct room_type from rooms where (tour_id in (${tourstr})) and (room_category in (${catstr}));`, (err, result)=> {
                if(err){
                    reject()
                }
                result.rows.map((type)=> {
                    arrayres.push(type.room_type)
                })
                resolve(arrayres)
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
            result: 'fetching room types failed',
            success: false
        })
    })
})

router.get('/cat', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select cat_id::integer AS cat_id, cat_name from room_cate where dep_id=${req.query.dep_id};`, (err, result)=> {
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
            result: 'fetching room categories failed',
            success: false
        })
    })
})

router.post('/roomcat', (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.tour.length !== 0){
            connection.query(`select distinct cat_id, cat_name from room_cate join rooms on rooms.room_category = room_cate.cat_id where (rooms.tour_id in (${String(data.tour)})) and (rooms.room_category in (room_cate.cat_id));`, (err, result)=> {
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
            result: 'fetching room categories failed',
            success: false
        })
    })
})

module.exports = router