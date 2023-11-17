const connection = require('../utils/Connect')
const router = require('express').Router()
const s3 = require('../utils/aws')
const { createPDF } = require('../utils/utils')

router.get('/', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select * from users join dep_branch on users.branch_id=dep_branch.id join branches on dep_branch.branch_id=branches.branch_id where users.dep_id=${req.query.dep_id} and users.branch_id=${req.query.branch_id} ${req.query.name? `and lower(users.user_name) like lower('%${req.query.name}%')`: ''} ${req.query.type? `and users.user_type='${req.query.type}'`: ''};`, (err, result)=> {
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
    const resjson={}
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select count(*) from customers where created=current_date and dep_id=${req.query.dep_id} and branch_id=${req.query.branch_id};`, (err, result)=> {
                if(err){
                    reject()
                }
                else{
                    resjson.leads_created=result.rows[0].count
                    connection.query(`select count(*) from bookings where booking_date=current_date and dep_id=${req.query.dep_id} and branch_id=${req.query.branch_id};`, (err, result)=> {
                        if(err){
                            console.log(err)
                            reject()
                        }
                        else{
                            resjson.bookings_created=result.rows[0].count
                            connection.query(`select user_id, user_name from users where user_type='telecaller' and dep_id=${req.query.dep_id} and branch_id=${req.query.branch_id};`, (err, result)=> {
                                if(err){
                                    reject()
                                }
                                else{
                                    resjson.telecallers = []
                                    result.rows.map((user, index)=> {
                                        const obj = {
                                            name: user.user_name
                                        }
                                        connection.query(`select count(*) from leads where user_id='${user.user_id}' and created_at::date=current_date`, (err, resulte)=> {
                                            if(err){
                                                reject()
                                            }
                                            else{
                                                obj.assigned = resulte.rows[0].count
                                                connection.query(`select count(*) from customer_response where user_id='${user.user_id}' and call_date=current_date`, (err, rescal)=> {
                                                    if(err){
                                                        reject()
                                                    }
                                                    else{
                                                        obj.calls = rescal.rows[0].count
                                                        connection.query(`select count(*) from bookings where booking_date::date=current_date and user_id='${user.user_id}';`, (err, resbook)=> {
                                                            if(err){
                                                                reject()
                                                            }
                                                            else{
                                                                obj.bookings = resbook.rows[0].count
                                                                resjson.telecallers.push(obj)
                                                                if(result.rows.length-1===index){
                                                                    resolve(resjson)
                                                                }
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
        else{
            reject()
        }
    })

    result.then((data) => {
        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
        createPDF(data, res)
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching staff details failed',
            success: false
        })
    })
})


module.exports = router