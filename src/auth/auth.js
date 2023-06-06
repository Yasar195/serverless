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
            reject("error")
        }
    })

    auth.then((usercred)=> {
        res.locals.uid = usercred.uid
        res.locals.email = usercred.email
        next()
    })
    .catch((err)=> {
        res.status(404).json({
            result: "user not found",
            success: false
        })
    })
}

// sign up route

router.get('/', async (req, res) => {
    const user = new Promise((resolve, reject) => {
        const now = new Date()
        const date = now.toLocaleDateString()
        const time = now.toLocaleTimeString()
        connection.query(`select users.user_name, users.user_type, users.user_email, users.registered, users.dep_id, users.branch_id, departments.dep_name, departments.dep_image, branches.branch_name from users join departments on users.dep_id = departments.dep_id join branches on users.branch_id = branches.branch_id where users.user_id='${res.locals.uid}';`, (err, result)=> {
            if(err){
                reject()
            }
            connection.query(`insert into user_activity (user_id, activity, dep, time, date) values ('${res.locals.uid}', 'sign in', 'login', '${time}', '${date}');`, (err) => {
                if(err){
                    reject()
                }
                resolve(result.rows)
            })
        })
    })
    user.then(async (data)=> {
        const params = {
            Bucket: 'trippens',
            Key: data[0].dep_image,
            Expires: 60 * 60 // URL expires after 1 hour
        };
        const url = s3.getSignedUrl('getObject', params);
        data[0].dep_image = url
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(() => {
        res.status(500).json({
            result: 'user authentication failed',
            success: false
        })
    })
})

router.get('/admins', async (req, res)=> {
    const user = new Promise((resolve, reject) => {
        connection.query(`select * from admins where admin_id='${res.locals.uid}';`, (err, result)=> {
            if(err){
                reject()
            }
            resolve(result.rows)
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
        if(req.query.dep_id){
            connection.query(`select * from users where user_type='telecaller' and dep_id=${req.query.dep_id};`, (err, result)=> {
                if(err){
                    reject()
                }
                resolve(result.rows)
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

router.get('/dash', (req, res)=> {
    const result = new Promise((resolve, reject) => {
        const data = {}
        if(req.query.dep_id){
            connection.query(`select count(*) from tour where dep_id=${req.query.dep_id};`, (err, tourres)=>{
                if(err){
                    reject()
                }
                data.tours = tourres.rows[0].count
                connection.query(`select count(*) from customers where dep_id=${req.query.dep_id};`, (err, cusres)=> {
                    if(err){
                        reject()
                    }
                    data.customers = cusres.rows[0].count
                    connection.query(`select count(*) from users where dep_id=${req.query.dep_id};`, (err, useres)=> {
                        if(err){
                            reject()
                        }
                        data.users = useres.rows[0].count
                        connection.query(`select count(*) from leads where dep_id=${req.query.dep_id};`, (err, callres)=> {
                            if(err){
                                reject()
                            }
                            data.calls = callres.rows[0].count
                            connection.query(`select count(*) from leads where dep_id=${req.query.dep_id} and follow_up=true;`, (err, folres)=> {
                                if(err){
                                    reject()
                                }
                                data.follow_ups = folres.rows[0].count
                                resolve(data)
                            })
                        })
                    })
                })
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