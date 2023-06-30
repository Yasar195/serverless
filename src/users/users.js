const connection = require('../utils/Connect')
const router = require('express').Router()
const s3 = require('../utils/aws')

router.get('/', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`SELECT * FROM customers JOIN users ON customers.user_id = users.user_id JOIN departments ON customers.dep_id = departments.dep_id JOIN branches ON customers.branch_id = branches.branch_id where customers.dep_id=${req.query.dep_id};`, (err, result)=> {
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

router.post('/', async (req, res)=> {
    const customer = req.body
    const upload = new Promise((resolve, reject)=> {
        if(customer.customer_name && customer.customer_phone && customer.customer_vehicle && customer.customer_whatapp && customer.customer_progress && customer.customer_source && customer.customer_address && customer.customer_city && customer.customer_remarks && customer.dep_id && customer.user_id && customer.branch_id && customer.customer_pax && customer.customer_category && customer.tour_code){
            connection.query(`insert into customers (customer_name, customer_phone,customer_vehicle, customer_whatsapp, customer_progress, customer_pax, customer_source, customer_address, customer_category, customer_city, customer_remarks, dep_id, user_id, branch_id, tour_code) values ('${customer.customer_name}', '${customer.customer_phone}', '${customer.customer_vehicle}', '${customer.customer_whatapp}', '${customer.customer_progress}', ${customer.customer_pax}, '${customer.customer_source}', '${customer.customer_address}', '${customer.customer_category}','${customer.customer_city}', '${customer.customer_remarks}', ${customer.dep_id}, '${customer.user_id}', ${customer.branch_id}, '${customer.tour_code}');`, (err)=> {
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
            result: "user data upload success",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "user data upload failed",
            success: false
        })
    })
})

router.put('/', async (req, res)=> {
    const customer = req.body
    const upload = new Promise((resolve, reject)=> {
        if(customer.customer_id&&customer.customer_name && customer.customer_phone && customer.customer_vehicle && customer.customer_whatapp && customer.customer_progress && customer.customer_source && customer.customer_address && customer.customer_city && customer.customer_remarks &&  customer.customer_pax && customer.customer_category && customer.tour_code){
            connection.query(`update customers set customer_name='${customer.customer_name}', customer_phone='${customer.customer_phone}', customer_vehicle='${customer.customer_vehicle}', customer_whatsapp='${customer.customer_whatapp}', customer_progress='${customer.customer_progress}', customer_source='${customer.customer_source}', customer_address='${customer.customer_address}', customer_city='${customer.customer_city}', customer_remarks='${customer.customer_remarks}', customer_pax='${customer.customer_pax}', customer_category='${customer.customer_category}', tour_code='${customer.tour_code}', booked=false, user_id='${res.locals.uid}' where customer_id=${customer.customer_id};`, (err)=> {
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
            connection.query(`select * from customers where assigned=false and customer_progress='Not started'and customer_progress!='Booked' and dep_id=${req.query.dep_id} and booked=false ${req.query.name? `and customer_name like '%${req.query.name}%'`: ''};`, (err, response) => {
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
            connection.query(`select * from customers where assigned=false and customer_progress!='Not started' and customer_progress!='Booked' and dep_id=${req.query.dep_id} and booked=false ${req.query.name? `and customer_name like '%${req.query.name}%'`: ''};`, (err, response) => {
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

router.get('/booked', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select users.user_name, customers.customer_name, customers.tour_code, users.user_id, users.points, customers.customer_id from customers join users on customers.user_id=users.user_id where customers.customer_progress='Booked' and customers.booked=false and customers.dep_id=${req.query.dep_id};`, (err, response)=> {
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
            result: "fetching user failed",
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