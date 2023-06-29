const connection = require('../utils/Connect')
const router = require('express').Router()
const s3 = require('../utils/aws')
const { generateRandomString } = require('../utils/utils')

router.post('/', (req, res)=> {
    const data = req.body
    const file = req.files.pdf
    const now = new Date()
    const date = now.toLocaleDateString()
    const key = `${generateRandomString(10)}.pdf`
    const params = {
        Bucket: 'travelitinerary',
        Key: key,
        Body: file.data,
    };
    const upload = new Promise((resolve, reject)=> {
        s3.upload(params, function (err) {
            if (err) {
              reject()
            }
            connection.query(`update customers set booked=true where customer_id=${data.customer_id};`, (err)=> {
                if(err){
                    reject()
                }
                connection.query(`update users set points=${data.points} where user_id='${data.user_id}';`, (err)=> {
                    if(err){
                        reject()
                    }
                    connection.query(`insert into bookings (booking_date, customer_id, user_id, amount_payable, amount_paid, travel_itinerary, dep_id, branch_id) values ('${date}', ${data.customer_id}, '${data.user_id}', '${data.amount_payable}', '${data.amount_paid}', '${key}', ${data.dep_id}, ${data.branch_id});`, (err)=> {
                        if(err){
                            reject()
                        }
                        resolve()
                    })
                })
            })
        })
    })

    upload.then(()=> {
        res.status(200).json({
            result: "booking success",
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "booking failed",
            success: false
        })
    })
})

router.get('/', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id){
            connection.query(`select bookings.booking_id, users.user_name, bookings.booking_date, customers.customer_name, bookings.amount_paid, bookings.amount_payable, bookings.travel_itinerary from bookings join users on bookings.user_id=users.user_id join customers on bookings.customer_id=customers.customer_id where bookings.dep_id=${req.query.dep_id};`, (err, response)=> {
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
        data.forEach(booking => {
            const url = s3.getSignedUrl('getObject', {
                Bucket: 'travelitinerary',
                Key: booking.travel_itinerary,
                Expires: 60 * 60
            });
            booking.travel_itinerary = url
        })
        
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: "fetching bookings failed",
            success: false
        })
    })
})


module.exports = router