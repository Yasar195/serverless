const connection = require('../utils/Connect')
const router = require('express').Router()

router.get('/', async (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        if(req.query.dep_id&&req.query.branch_id){
            connection.query(`select * from users join dep_branch on users.branch_id=dep_branch.id join branches on dep_branch.branch_id=branches.branch_id where users.dep_id=${req.query.dep_id} and users.branch_id=${req.query.branch_id} ${req.query.name? `and users.user_name like '%${req.query.name}%'`: ''} ${req.query.type? `and users.user_type='${req.query.type}'`: ''};`, (err, result)=> {
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

router.get('/all', (req, res)=> {
    const result = new Promise((resolve, reject)=> {
        connection.query(`select * from users;`, (err, result)=> {
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

module.exports = router