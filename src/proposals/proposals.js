const connection = require('../utils/Connect')
const router = require('express').Router()
const { generateRandomString } = require('../utils/utils')
const s3 = require('../utils/aws')

router.post('/', (req, res)=> {
    const data = req.body
    const key = `proposals/${generateRandomString(10)}.pdf`


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
                        err? reject(): resolve();
                    }))
                }
            });
        }
        else{
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
        res.status(500).json({
            result: "upload failed",
            success: false
        })
    })
})

router.get('/', (req, res)=> {
    const upload = new Promise((resolve, reject)=> {
        if(req.query.branch_id&&req.query.dep_id){
            connection.query(`select distinct customers.customer_id, customers.customer_name, customers.cid, customers.customer_phone, customers.tour from proposals join customers on proposals.customer_id=customers.customer_id where customers.branch_id=${req.query.branch_id} and customers.dep_id=${req.query.dep_id} ${req.query.name? `and lower(customers.customer_name) like lower('%${req.query.name}%')`: ''} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                err? reject(): resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    upload.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch((err)=> {
        res.status(500).json({
            result: "fetching proposals failed",
            success: false
        })
    })
})


router.get('/customer', (req, res)=> {
    const upload = new Promise((resolve, reject)=> {
        if(req.query.customer_id){
            connection.query(`select * from proposals join customers on proposals.customer_id=customers.customer_id where customers.customer_id=${req.query.customer_id} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response)=> {
                err? reject(): resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    upload.then((data)=> {

        data.forEach(element => {
            if(element.iti_key){
                const params = {
                    Bucket: 'tele-profile',
                    Key: element.iti_key,
                };
                const url = s3.getSignedUrl('getObject', params);
                element.url = url
            }
        });

        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch((err)=> {
        res.status(500).json({
            result: "fetching proposals failed",
            success: false
        })
    })
})

module.exports = router;