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
    const file = req.files.pdf;
    const result = new Promise((resolve, reject)=> {
        if(file&&data.dep_id&&data.tour_name&&data.tour_des&&data.tour_code){
            const key = `${data.tour_code}.pdf`
            const params = {
                Bucket: 'fixeditinerary',
                Key: key,
                Body: file.data,
            };
            s3.upload(params, function (err) {
                if (err) {
                  reject()
                }
                connection.query(`insert into tour (dep_id, tour_name, tour_des, tour_code, tour_pdf) values (${data.dep_id}, '${data.tour_name}', '${data.tour_des}', '${data.tour_code}', '${key}');`, (err)=> {
                    if(err){
                        reject()
                    }
                    resolve()
                })
                resolve()
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

router.post('/createactivity', async (req, res)=> {
    const data = req.body;
    const result = new Promise((resolve, reject)=> {
        if(data.place_id&&data.activity_name&&data.activity_des){
            connection.query(`insert into activity (place_id, activity_name, activity_des) values (${data.place_id}, '${data.activity_name}', '${data.activity_des}');`, (err)=> {
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
        const params = {
            Bucket: 'fixeditinerary',
            Key: data[0].tour_pdf,
        };
        const url = s3.getSignedUrl('getObject', params);
        data[0].pdf_link = url;
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching fixed itinerary failed",
            success: false
        })
    })
})

module.exports = router;