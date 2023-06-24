const connection = require('../utils/Connect')
const router = require('express').Router()

router.post('/', (req, res)=> {
    const data = req.body
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.dep_id&&data.room_owner&&data.name&&data.state&&data.places&&data.room_category){
            connection.query(`insert into rooms (tour_id, dep_id, room_owner, name, state, places, room_category) values (${data.tour_id}, ${data.dep_id}, '${data.room_owner}', '${data.name}', '${data.state}', '${data.places}', '${data.room_category}');`, (err)=> {
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

module.exports = router