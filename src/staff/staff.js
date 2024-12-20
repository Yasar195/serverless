const connection = require('../utils/Connect')
const router = require('express').Router()
const s3 = require('../utils/aws')
const { createPDF } = require('../utils/utils')

router.get('/', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select * from users join dep_branch on users.branch_id=dep_branch.id join branches on dep_branch.branch_id=branches.branch_id where users.dep_id=${req.query.dep_id} and users.branch_id=${req.query.branch_id} and users.registered=true ${req.query.name? `and lower(users.user_name) like lower('%${req.query.name}%')`: ''} ${req.query.type? `and users.user_type='${req.query.type}'`: ''};`, (err, result)=> {
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

    result.then((data) => {

        data.forEach(element => {
            if(element.profile_key){
                const params = {
                    Bucket: 'tele-profile',
                    Key: element.profile_key,
                };
                const url = s3.getSignedUrl('getObject', params);
                element.image_url = url
            }
        });
        
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch((err)=> {
        res.status(500).json({
            result: 'fetching staff details failed',
            success: false
        })
    })
})

router.get('/all', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select * from users join departments on users.dep_id=departments.dep_id;`, (err, result)=> {
            if(err){
                reject()
            }
            else{
                resolve(result.rows)
            }
        })
    })

    result.then((data) => {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching staff details failed',
            success: false
        })
    })
})

router.put('/suspend', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.user_id){
            connection.query(`update users set registered=false where user_id='${req.query.user_id}';`, (err)=> {
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
            result: "user suspended",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "user suspension failed",
            success: false
        })
    })
})

router.put('/revoke', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.user_id){
            connection.query(`update users set registered=true where user_id='${req.query.user_id}';`, (err)=> {
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
            result: "suspension revoke success",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "suspension revoke failed",
            success: false
        })
    })
})


router.get('/analytics', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select * from customer_response join users on customer_response.user_id=users.user_id join customers on customer_response.customer_id=customers.customer_id where customer_response.call_date::date=current_date;`, (err, result)=> {
                if(err){
                    console.log(err)
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

    result.then((data) => {
        // res.contentType('application/pdf');
        // res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
        // createPDF(data, res)
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching staff details failed',
            success: false
        })
    })
})


module.exports = router