const router = require('express').Router()
const connection = require('../utils/Connect')
const { getDateTime } = require('../utils/utils')
const admin = require('../firebase')
const s3 = require('../utils/aws')

// Middlewares 

const authenticate = async (req, res, next) => {
    const token = req.get("Authorization");
    const auth = new Promise(async (resolve, reject)=> {
        try{
            const decodedToken = await admin.auth().verifyIdToken(token);
            resolve(decodedToken)
        } catch(err){
            reject()
        }
    })

    auth.then((usercred)=> {
        res.locals.uid = usercred.uid
        res.locals.email = usercred.email
        next()
        // res.status(503).json({
        //     result: "Service is temporarily suspended",
        //     success: false
        // })
    })
    .catch(()=> {
        res.status(403).json({
            result: "You are not authorized to access this resource",
            success: false
        })
    })
}

// sign up route

router.get('/', async (req, res) => {
    const user = new Promise((resolve, reject) => {
        connection.query(`select users.user_id, users.user_name, users.profile_key, users.user_type, users.user_email, users.user_code, users.registered, users.dep_id, users.branch_id, departments.dep_name, departments.dep_image, departments.dep_color, branches.branch_name from users join departments on users.dep_id = departments.dep_id join dep_branch on users.branch_id = dep_branch.id join branches on dep_branch.branch_id=branches.branch_id where users.user_id='${res.locals.uid}';`, (err, result)=> {
            if(err){
                reject()
            }
            else{
                const registered = result.rows[0].registered
                if(registered){
                    resolve(result.rows)
                }
                else{
                    reject()
                }
            }
        })
    })
    user.then(async (data)=> {
        const depurl = s3.getSignedUrl('getObject', {
            Bucket: 'tele-profile',
            Key: data[0].dep_image,
            Expires: 60 * 60
        });
        const prourl = s3.getSignedUrl('getObject', {
            Bucket: 'tele-profile',
            Key: data[0].profile_key,
            Expires: 60 * 60
        });
        data[0].dep_image = depurl
        data[0].profile_image = prourl
        return res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(() => {
        return res.status(500).json({
            result: 'user authentication failed',
            success: false
        })
    })
})

router.get('/admins', async (req, res)=> {
    const user = new Promise((resolve, reject) => {
        connection.query(`select * from admins where admin_id='${res.locals.uid}';`, (err, result)=> {
            err? reject(): resolve(result.rows)
        })
    })

    user.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching admin data failed',
            success: false
        })
    })
})

router.get('/telecallers', (req, res)=> {
    const user = new Promise((resolve, reject) => {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select * from users where user_type='telecaller' and registered=true and dep_id=${req.query.dep_id} and branch_id=${req.query.branch_id};`, (err, result)=> {
                err? reject(): resolve(result.rows)
            })
        }
        else{
            reject()
        }
    })

    user.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching telecaller data failed",
            success: false
        })
    })
})

router.get('/field', (req, res)=> {
    const user = new Promise((resolve, reject) => {
        if(req.query.dep_id){
            connection.query(`select * from users where user_type='customer service' and dep_id=${req.query.dep_id};`, (err, result)=> {
                err? reject(): resolve(result.rows)
            })
        }
        else{
            reject()
        }
    })

    user.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching field staff data failed",
            success: false
        })
    })
})

router.get('/dash', (req, res)=> {
    const result = new Promise((resolve, reject) => {
        const data = {}
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select count(*) from tour where dep_id=${req.query.dep_id};`, (err, tourres)=>{
                if(err){
                    reject()
                }
                else{
                    data.tours = tourres.rows[0].count
                    connection.query(`select count(*) from customers where dep_id=${req.query.dep_id} and branch_id= ${req.query.branch_id};`, (err, cusres)=> {
                        if(err){
                            reject()
                        }
                        else{
                            data.customers = cusres.rows[0].count
                            connection.query(`select count(*) from users where dep_id=${req.query.dep_id} and branch_id= ${req.query.branch_id};`, (err, useres)=> {
                                if(err){
                                    reject()
                                }
                                else{
                                    data.users = useres.rows[0].count
                                    connection.query(`select count(*) from leads where dep_id=${req.query.dep_id} and branch_id= ${req.query.branch_id};`, (err, callres)=> {
                                        if(err){
                                            reject()
                                        }
                                        else{
                                            data.calls = callres.rows[0].count
                                            connection.query(`select count(*) from leads where dep_id=${req.query.dep_id} and branch_id= ${req.query.branch_id} and follow_up=true;`, (err, folres)=> {
                                                if(err){
                                                    reject()
                                                }
                                                else{
                                                    data.follow_ups = folres.rows[0].count
                                                    connection.query(`select count(*) from bookings where dep_id=${req.query.dep_id} and branch_id= ${req.query.branch_id};`, (err, bookres)=> {
                                                        if(err){
                                                            reject()
                                                        }
                                                        else{
                                                            data.bookings = bookres.rows[0].count
                                                            connection.query(`select count(*) from bookings where dep_id=${req.query.dep_id} and branch_id= ${req.query.branch_id} and payment_complete=true;`, (err, bookres)=> {
                                                                if(err){
                                                                    reject()
                                                                }
                                                                else{
                                                                    data.completed = bookres.rows[0].count
                                                                    resolve(data)
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
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
    
    result.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching dash data failed',
            success: false
        })
    })
})

module.exports = {
    authenticate,
    router
}