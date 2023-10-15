const express = require('express');
const router = express.Router();
const admin = require('../firebase')
const connection = require('../utils/Connect')

router.post("/password", (req, res)=> {
    const body = req.body;
    const result = new Promise((resolve, reject)=> {
        if(body.password){
            connection.query(`select user_email from users where user_id='${res.locals.uid}';`, (err, response)=> {
                if(err){
                    reject();
                }
                else{
                    admin.auth().updateUser(res.locals.uid, {
                        email: response.rows[0].user_email,
                        password: body.password
                    })
                    .then((user)=> {
                        const arr = [{
                            user_data: {
                                user_uid: user.uid,
                                user_email: user.email
                            }
                        }]
                        resolve(arr)
                    })
                    .catch((err)=> {
                        reject();
                    })
                }
            })
        }
        else{
            reject();
        }
    })

    result.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(400).json({
            result: "Password changing failed",
            success: false
        })
    })
})

module.exports = router;