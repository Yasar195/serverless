const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const dataString = JSON.stringify(data.data)
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id.length>0&&data.customer_id&&data.start_date&&data.end_date&&data.day&&data.night&&data.adult&&data.kid&&data.infant&&dataString){
            connection.query(`insert into snapshots (tour_id, customer_id, start_date, end_date, day, night, adults, kids, infants, data) values ('${String(data.tour_id)}', ${data.customer_id}, '${data.start_date}', '${data.end_date}', ${data.day}, ${data.night}, ${data.adult}, ${data.kid}, ${data.infant}, '${dataString}');`, (err)=> {
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
            result: 'snapshot created successfully',
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'creating snapshot failed',
            success: false
        })
    })
})

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.customer_id){
            connection.query(`select created, shot_id from snapshots where customer_id=${req.query.customer_id};`, (err, result)=> {
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
            result: 'fetching snapshots failed',
            success: false
        })
    })
})

router.get('/:id', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select * from snapshots where shot_id=${req.params.id};`, (err, result)=> {
            if(err){
                reject()
            }
            else{
                resolve(result.rows)
            }
        })
    })
    
    result.then((data)=> {
        data[0].tour_id = data[0].tour_id.split(',');
        data[0].data = JSON.parse(data[0].data)
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching snapshots failed',
            success: false
        })
    })
})

module.exports = router