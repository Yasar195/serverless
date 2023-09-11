const connection = require('../utils/Connect')
const router = require('express').Router()
const { generateRandomString } = require('../utils/utils')
const s3 = require('../utils/aws')

router.get('/', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select * from tour where dep_id=${req.query.dep_id};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
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
            result: "fetching tour failed",
            success: false
        })
    })
})

router.delete('/places', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.place_id){
            connection.query(`delete from activity where place_id=${req.query.place_id};`, (err)=> {
                if(err){
                    reject()
                }
                connection.query(`delete from addon where place_id=${req.query.place_id};`, (err)=> {
                    if(err){
                        reject()
                    }
                    connection.query(`delete from place where place_id=${req.query.place_id};`, (err)=> {
                        if(err){
                            reject()
                        }
                        resolve()
                    })
                })
            })
        }
        else{
            reject()
        }
    })

    result.then(()=> {
        res.status(200).json({
            result: "place data deleted",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "place data deletion failed",
            success: false
        })
    })
})

router.get('/places', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.tour_id){
            connection.query(`select * from place where tour_id=${req.query.tour_id};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
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
            result: "fetching places failed",
            success: false
        })
    })
})

router.delete('/activities', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.activity_id){
            connection.query(`delete from activity where activity_id=${req.query.activity_id};`, (err)=> {
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
            result: "activity data deleted",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "activity data deletion failed",
            success: false
        })
    })
})

router.delete('/addons', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.addon_id){
            connection.query(`delete from addon where addon_id=${req.query.addon_id};`, (err)=> {
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
            result: "addon data deleted",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "addon data deletion failed",
            success: false
        })
    })
})

router.get('/addons', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.place_id){
            connection.query(`select * from addon where place_id=${req.query.place_id};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
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
            result: "fetching addons failed",
            success: false
        })
    })
})

router.get('/activity', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.place_id){
            connection.query(`select * from activity where place_id=${req.query.place_id};`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
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
            result: "fetching activity failed",
            success: false
        })
    })
})

router.post('/createtours', async (req, res)=> {
    const data = req.body;
    const file = req.files;
    const result = new Promise((resolve, reject)=> {
        if(data.dep_id&&data.tour_name&&data.tour_des&&data.tour_code){
            connection.query(`insert into tour (dep_id, tour_name, tour_des, tour_code${file? ', tour_pdf': ''}) values (${data.dep_id}, '${data.tour_name}', '${data.tour_des}', '${data.tour_code}'${file? `, 'tours/${data.tour_code}.pdf'`: ''});`, (err)=> {
                if(err){
                    reject()
                }
                if(file){
                    const key = `tours/${data.tour_code}.pdf`
                    const params = {
                        Bucket: 'tele-profile',
                        Key: key,
                        Body: file.pdf.data,
                    };
                    s3.upload(params, function (err) {
                        if (err) {
                            reject()
                        }
                        resolve()
                    })
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
            result: "tour created successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "tour creation failed",
            success: false
        })
    })
})

router.post('/createplace', async (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.tour_id&&data.place_name&&data.place_des){
            connection.query(`insert into place (tour_id, place_name, place_des) values (${data.tour_id}, '${data.place_name}', '${data.place_des}');`, (err)=> {
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
            result: "place created successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "place creation failed",
            success: false
        })
    })
})

router.put('/createplace', async (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.place_id&&data.place_name&&data.place_des){
            connection.query(`update place set place_name='${data.place_name}', place_des='${data.place_des}' where place_id=${data.place_id};`, (err)=> {
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
            result: "place updated successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "place updation failed",
            success: false
        })
    })
})

router.put('/createaddons', async (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.addon_id&&data.addon_name&&data.addon_des){
            connection.query(`update addon set addon_name='${data.addon_name}', addon_des='${data.addon_des}' where addon_id=${data.addon_id};`, (err)=> {
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
            result: "addon updated successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "addon updation failed",
            success: false
        })
    })
})

router.put('/createactivity', async (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.activity_id&&data.activity_name&&data.activity_des&&data.activity_price){
            connection.query(`update activity set activity_name='${data.activity_name}', activity_des='${data.activity_des}', activity_price=${data.activity_price} where activity_id=${data.activity_id};`, (err)=> {
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
            result: "activity updated successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "activity updation failed",
            success: false
        })
    })
})

router.post('/createactivity', async (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.place_id&&data.activity_name&&data.activity_des&&data.activity_price){
            connection.query(`insert into activity (place_id, activity_name, activity_des, activity_price) values (${data.place_id}, '${data.activity_name}', '${data.activity_des}', ${data.activity_price});`, (err)=> {
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
            result: "activity created successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "activity creation failed",
            success: false
        })
    })
})

router.post('/createaddons', async (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.place_id&&data.addon_name&&data.addon_des){
            connection.query(`insert into addon (place_id, addon_name, addon_des) values (${data.place_id}, '${data.addon_name}', '${data.addon_des}');`, (err)=> {
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
            result: "addons created successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "addons creation failed",
            success: false
        })
    })
})

router.get('/itinerary', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.tour_code){
            connection.query(`select tour_pdf from tour where tour_code='${req.query.tour_code}';`, (err, response)=> {
                if(err){
                    reject()
                }
                resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    result.then((data)=> {
        if(data.length !== 0){
            const params = {
                Bucket: 'tele-profile',
                Key: data[0].tour_pdf,
            };
            const url = s3.getSignedUrl('getObject', params);
            data[0].pdf_link = url;
        }
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch((err)=> {
        console.log(err)
        res.status(500).json({
            result: "fetching fixed itinerary failed",
            success: false
        })
    })
})

module.exports = router;