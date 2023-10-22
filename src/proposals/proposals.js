const connection = require('../utils/Connect')
const router = require('express').Router()
const { generateRandomString } = require('../utils/utils')
const s3 = require('../utils/aws')

router.post('/', (req, res)=> {
    const data = req.body
    const key = `proposals/${generateRandomString(10)}.mp3`


    const upload = new Promise((resolve, reject)=> {
        if(data.customer_id&&req.files){
            const file = req.files.pdf;
            const params = {
                Bucket: 'tele-profile',
                Key: key,
                Body: file.data,
            };
            s3.upload(params, function (err) {
                if (err) {
                  reject()
                }
                else{
                    connection.query(`insert into proposals (customer_id, user_id, iti_key) values (${data.customer_id}, '${res.locals.uid}', '${key}');`, (err=> {
                        console.log(err)
                        err? reject(): resolve();
                    }))
                }
            });
        }
        else{
            console.log('hello')
            reject()
        }
    })

    upload.then(()=> {
        res.status(200).json({
            result: "upload success",
            success: true
        })
    })
    .catch((err)=> {
        console.log(err)
        res.status(500).json({
            result: "upload failed",
            success: false
        })
    })
})

module.exports = router;