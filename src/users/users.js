const connection = require('../utils/Connect')
const router = require('express').Router()
const s3 = require('../utils/aws')

router.get('/', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`SELECT * FROM customers JOIN users ON customers.user_id = users.user_id JOIN departments ON customers.dep_id = departments.dep_id JOIN branches ON customers.branch_id = branches.branch_id where customers.dep_id=${req.query.dep_id} ${req.query.name? `and lower(customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.progress? `and customer_progress='${req.query.progress}'`: ''} ${req.query.id? `and customer_id=${req.query.id}`: ''} ${req.query.phone? `and customer_phone like '%${req.query.phone}%'`: ''} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, result)=> {
                if(err){
                    console.log(err)
                    reject()
                }
                resolve(result.rows)
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
            result: "fetching customer data failed",
            success: false
        })
    })
})

router.put('/', async (req, res)=> {
    const customer = req.body
    const upload = new Promise((resolve, reject)=> {
        if(customer.customer_id&&customer.customer_name && customer.customer_phone && customer.customer_vehicle && customer.customer_whatapp && customer.customer_progress && customer.customer_source && customer.customer_address && customer.customer_city && customer.customer_remarks && String(customer.customer_pax) && customer.customer_category){
            connection.query(`update customers set customer_name='${customer.customer_name}', customer_phone='${customer.customer_phone}', customer_vehicle='${customer.customer_vehicle}', customer_whatsapp='${customer.customer_whatapp}', customer_progress='${customer.customer_progress}', customer_source='${customer.customer_source}', customer_address='${customer.customer_address}', customer_city='${customer.customer_city}', customer_remarks='${customer.customer_remarks}', customer_pax='${customer.customer_pax}', customer_category='${customer.customer_category}', booked=false, user_id='${res.locals.uid}' where customer_id=${customer.customer_id};`, (err)=> {
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

    upload.then(()=> {
        res.status(200).json({
            result: "user data update success",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "user data update failed",
            success: false
        })
    })
})

router.post('/signup', (req, res)=> {
    const data = req.body
    const key = `${req.body.user_id}.jpg`
    const image = req.files.image
    const params = {
        Bucket: 'triprofilephotos',
        Key: key,
        Body: image.data,
    };
    const user = new Promise((resolve, reject) => {
        if(image&&data.user_name&&data.user_id&&data.user_type&&data.user_email&&data.dep_id&&data.branch_id && data.phone && key){
            s3.upload(params, function (err) {
                if (err) {
                    reject()
                }
                connection.query(`insert into users (user_id, user_name, user_type, user_email, dep_id, branch_id, registered, user_phone, profile_key) values('${data.user_id}', '${data.user_name}', '${data.user_type}', '${data.user_email}', ${data.dep_id}, ${data.branch_id}, true, '${data.phone}', '${key}');`,(err)=> {
                    if(err){
                        console.log(err)
                        reject()
                    }
                    resolve()
                })
            })
        }
        else{
            reject()
        }
    })

    user.then((data)=> {
        res.status(200).json({
            result: "user created successfully",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'user creation failed failed',
            success: false
        })
    })
})

router.get('/freshleads', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select * from customers where assigned=false and customer_progress='Not started'and customer_progress!='Booked' and dep_id=${req.query.dep_id} and booked=false ${req.query.name? `and lower(customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.progress? `and customer_progress='${req.query.progress}'`: ''} ${req.query.id? `and customer_id=${req.query.id}`: ''} ${req.query.phone? `and customer_phone like '%${req.query.phone}%'`: ''} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};;`, (err, response) => {
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

    result.then((message)=> {
        res.status(200).json({
            result: message,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching fresh leads failed",
            success: false
        })
    })
})

router.get('/oldleads', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select * from customers where assigned=false and customer_progress!='Not started' and customer_progress!='Booked' and dep_id=${req.query.dep_id} and booked=false ${req.query.name? `and lower(customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.progress? `and customer_progress='${req.query.progress}'`: ''} ${req.query.id? `and customer_id=${req.query.id}`: ''} ${req.query.phone? `and customer_phone like '%${req.query.phone}%'`: ''} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response) => {
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

    result.then((message)=> {
        res.status(200).json({
            result: message,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching fresh leads failed",
            success: false
        })
    })
})

router.get('/activity/:id', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select * from user_activity where user_id='${req.params.id}';`, (err, response)=> {
            if(err){
                reject()
            }
            resolve(response.rows)
        })
    })

    result.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching user activity failed",
            success: false
        })
    })
})

router.delete('/:id', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`DELETE FROM users WHERE user_id=${req.params.id}`, (err, response) => {
            if(err){
                reject("Deleting user data failed")
            }
            resolve("user data removed")
        })
    })

    result.then((message)=> {
        res.status(200).json({
            result: message,
            success: true
        })
    })
    .catch((message)=> {
        res.status(400).json({
            result: message,
            success: false
        })
    })
})

module.exports = router;