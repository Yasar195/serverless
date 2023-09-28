const connection = require('../utils/Connect')
const router = require('express').Router()
const s3 = require('../utils/aws')

router.get('/', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`SELECT * FROM customers JOIN users ON customers.user_id = users.user_id JOIN departments ON customers.dep_id = departments.dep_id JOIN dep_branch ON customers.branch_id = dep_branch.id join branches on dep_branch.branch_id=branches.branch_id where customers.dep_id=${req.query.dep_id} and customers.branch_id=${req.query.branch_id} ${req.query.name? `and lower(customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.progress? `and customer_progress='${req.query.progress}'`: ''} ${req.query.user_id? `and customers.user_id like '%${req.query.user_id}%'`: ''} ${req.query.id? `and customers.customer_id=${req.query.id} or customers.cid=${req.query.id}`: ''} ${req.query.phone? `and customer_phone like '%${req.query.phone}%'`: ''} limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, result)=> {
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
        if(customer.customer_name && customer.customer_phone && customer.customer_vehicle && customer.customer_progress && customer.customer_source && customer.dep_id && customer.branch_id && String(customer.customer_pax) && customer.customer_category){
            connection.query(`insert into customers (customer_name, customer_phone,customer_vehicle, customer_progress, customer_pax, customer_source, customer_address, customer_category, customer_city, customer_remarks, dep_id, user_id, branch_id, tour) values ('${customer.customer_name}', '${customer.customer_phone}', '${customer.customer_vehicle}', '${customer.customer_progress}', ${customer.customer_pax}, '${customer.customer_source}', '${customer.customer_address}', '${customer.customer_category}','${customer.customer_city}', '${customer.customer_remarks}', ${customer.dep_id}, '${res.locals.uid}', ${customer.branch_id}, '${customer.tour}');`, (err)=> {
                if(err){
                    reject(409)
                }
                else{
                    resolve()
                }
            })
        }
        else{
            reject(400)
        }
    })

    upload.then(()=> {
        res.status(200).json({
            result: "user data upload success",
            success: true
        })
    })
    .catch((status)=> {
        res.status(status).json({
            result: "user data upload failed",
            success: false
        })
    })
})

router.put('/', async (req, res)=> {
    const customer = req.body
    const upload = new Promise((resolve, reject)=> {
        if(customer.customer_id&&customer.customer_name && customer.customer_phone && customer.customer_vehicle && customer.customer_progress && customer.customer_source && customer.customer_address && customer.customer_city && customer.customer_remarks && String(customer.customer_pax) && customer.customer_category&&customer.tour){
            connection.query(`update customers set customer_name='${customer.customer_name}', customer_phone='${customer.customer_phone}', customer_vehicle='${customer.customer_vehicle}' ${customer.tour_code? `,tour_code='${customer.tour_code}'`: ''}, customer_progress='${customer.customer_progress}', customer_source='${customer.customer_source}', customer_address='${customer.customer_address}', customer_city='${customer.customer_city}', customer_remarks='${customer.customer_remarks}', customer_pax='${customer.customer_pax}', customer_category='${customer.customer_category}', booked=false, user_id='${res.locals.uid}', tour='${customer.tour}' where customer_id=${customer.customer_id};`, (err)=> {
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

const generateCode = (depcode, branchcode) => {
    return `${depcode}${Math.floor(100000 + Math.random() * 900000)}${branchcode}`
}

router.post('/signup', (req, res)=> {
    const data = req.body
    const key = `profile/${req.body.user_id}.jpg`
    const image = req.files.image
    const params = {
        Bucket: 'tele-profile',
        Key: key,
        Body: image.data,
    };
    const user = new Promise((resolve, reject) => {
        if(image&&data.user_name&&data.user_id&&data.user_type&&data.user_email&&data.dep_id&&data.branch_id && data.phone && key){
            connection.query(`select dep_code from departments where dep_id=${data.dep_id};`, (err, depresponse)=> {
                if(err){
                    reject()
                }
                else{
                    const dep_code = depresponse.rows[0].dep_code
                    connection.query(`select branch_code from dep_branch where id=${data.branch_id};`, (err, braresponse)=> {
                        if(err){
                            reject()
                        }
                        else{
                            const branch_code = braresponse.rows[0].branch_code
                            const code = generateCode(dep_code, branch_code)
                            s3.upload(params, function (err) {
                                if (err) {
                                    reject()
                                }
                                else{
                                    connection.query(`insert into users (user_id, user_name, user_type, user_email, dep_id, branch_id, registered, user_phone, profile_key, user_code) values('${data.user_id}', '${data.user_name}', '${data.user_type}', '${data.user_email}', ${data.dep_id}, ${data.branch_id}, true, '${data.phone}', '${key}', '${code}');`,(err)=> {
                                        if(err){
                                            reject()
                                        }
                                        else{
                                            resolve()
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

    user.then(()=> {
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
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select * from customers join users on customers.user_id=users.user_id where customers.assigned=false and customers.customer_progress='Not started' and customers.customer_progress!='Booked' and customers.dep_id=${req.query.dep_id} and customers.branch_id=${req.query.branch_id} and customers.booked=false ${req.query.name? `and lower(customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.progress? `and customers.customer_progress='${req.query.progress}'`: ''} ${req.query.id? `and customers.customer_id=${req.query.id} or customers.cid=${req.query.id}`: ''} ${req.query.phone? `and customers.customer_phone like '%${req.query.phone}%'`: ''} and users.user_type!='telecaller' limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response) => {
                if(err){
                    reject()
                }
                else{
                    resolve(response.rows)
                }
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

router.get('/count', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select count(*) from customers where dep_id=${req.query.dep_id} and branch_id=${req.query.branch_id};`, (err, response) => {
                if(err){
                    reject()
                }
                else{
                    resolve(response.rows)
                }
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
            result: "fetching fresh lead count failed",
            success: false
        })
    })
})

router.get('/freshleads/count', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select count(*) from customers where customer_progress='Not started' and assigned=false and dep_id=${req.query.dep_id} and branch_id=${req.query.branch_id};`, (err, response) => {
                if(err){
                    reject()
                }
                else{
                    resolve(response.rows)
                }
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
            result: "fetching fresh lead count failed",
            success: false
        })
    })
})

router.get('/oldleads/count', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select count(*) from customers where customer_progress!='Not started' and assigned=false and dep_id=${req.query.dep_id} and branch_id=${req.query.branch_id};`, (err, response) => {
                if(err){
                    reject()
                }
                else{
                    resolve(response.rows)
                }
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
            result: "fetching fresh lead count failed",
            success: false
        })
    })
})

router.get('/assigned/count', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select count(*) from customers join users on customers.user_id=users.user_id where customer_progress!='Not started' and users.user_type='telecaller' and customers.assigned=false and customers.dep_id=${req.query.dep_id} and customers.branch_id=${req.query.branch_id};`, (err, response) => {
                if(err){
                    reject()
                }
                else{
                    resolve(response.rows)
                }
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
            result: "fetching fresh lead count failed",
            success: false
        })
    })
})

router.get('/oldleads', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select * from customers join users on customers.user_id=users.user_id where customers.assigned=false and customers.customer_progress!='Not started' and customers.customer_progress!='Booked' and customers.dep_id=${req.query.dep_id} and customers.branch_id=${req.query.branch_id} and customers.booked=false ${req.query.name? `and lower(customer_name) like lower('%${req.query.name}%')`: ''} ${req.query.progress? `and customers.customer_progress='${req.query.progress}'`: ''} ${req.query.id? `and customers.customer_id=${req.query.id} or customers.cid=${req.query.id}`: ''} ${req.query.phone? `and customers.customer_phone like '%${req.query.phone}%'`: ''} and users.user_type!='telecaller' limit 10 offset ${req.query.page? `${(parseInt(req.query.page) - 1)*10}`: '0'};`, (err, response) => {
                if(err){
                    reject()
                }
                else{
                    resolve(response.rows)
                }
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
            result: "fetching old leads failed",
            success: false
        })
    })
})

router.get('/points', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select EXTRACT(MONTH FROM earned_month) as month, points from points where user_id='${res.locals.uid}' order by id desc;`, (err, response) => {
            if(err){
                reject()
            }
            else{
                resolve(response.rows)
            }
        })
    })

    result.then((message)=> {
        res.status(200).json({
            result: message,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching point history failed",
            success: false
        })
    })
})

module.exports = router;