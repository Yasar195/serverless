const connection = require('../utils/Connect')
const router = require('express').Router()
const { generateRandomString } = require('../utils/utils')
const s3 = require('../utils/aws')

router.post('/upload', (req, res)=> {

    const data = req.body
    const key = `audios/${generateRandomString(10)}.mp3`

    if (!data.response_text || !data.lead_id || !data.customer_progress || !data.customer_id) {
        return res.status(400).json({
            result: 'Response adding failed',
            success: false
        });
    }

    const upload = new Promise((resolve, reject)=> {
        if(req.files.audio){
            const file = req.files.audio;
            const params = {
                Bucket: 'tele-profile',
                Key: key,
                Body: file.data,
            };
            s3.upload(params, function (err) {
                if (err) {
                  reject()
                }
            });
        }

        connection.query(`update customers set user_id='${res.locals.uid}' where customer_id=${data.customer_id};`, (err)=> {
            if(err){
                reject()
            }
            else{
                connection.query(`insert into customer_response (customer_id, response_text${req.files.audio? `, response_key`: ``}, user_id) values (${data.customer_id}, '${data.response_text}'${req.files.audio? `, ${key}`: ``}, '${res.locals.uid}');`, (err)=> {
                    if(err){
                        reject()
                    }
                    else{
                        if(data.follow_date){
                            connection.query(`update leads set follow_up=true, follow_up_date='${data.follow_date}' where lead_id=${data.lead_id};`, (err)=>{
                                err? reject(): resolve()
                            })
                        }
                        else{
                            connection.query(`update customers set assigned=false, customer_progress='${req.body.customer_progress}' where customer_id=${req.body.customer_id};`, (err) => {
                                if(err){
                                    reject()
                                }
                                else{
                                    connection.query(`delete from leads where lead_id=${req.body.lead_id};`, (err)=>{
                                        err? reject(): resolve()
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
    })

    upload.then(()=> {
        res.status(200).json({
            result: "upload success",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "upload failed",
            success: false
        })
    })
    
})

router.get('/:id', (req, res)=> {
    const audios = new Promise((resolve, reject)=> {
        if(req.params.id){
            connection.query(`select * from customer_response join users on customer_response.user_id = users.user_id where customer_response.customer_id=${req.params.id} order by response_id desc limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};;`, (err, result)=> {
                err? reject(): resolve(result.rows)
            })
        }
        else{
            reject()
        }
    })

    audios.then((data)=> {
        data.forEach(element => {
            const params = {
                Bucket: 'tele-profile',
                Key: element.response_key,
            };
            const url = s3.getSignedUrl('getObject', params);
            element.url = url
        });
            
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching user audio failed',
            success: false
        })
    })
})

module.exports = router;