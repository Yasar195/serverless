const connection = require('../utils/Connect')
const router = require('express').Router()

router.get('/', async (req, res)=> {
    const branches = new Promise((resolve, reject) => {
        if(req.query.dep_id){
            connection.query(`select branches.branch_name, dep_branch.branch_address from dep_branch join branches on dep_branch.branch_id = branches.branch_id where dep_branch.dep_id=${req.query.dep_id};`,(err, response)=> {
                err? reject(): resolve(response.rows)
            })
        }
        else{
            reject()
        }
    })

    branches.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching branch data failed',
            success: false
        })
    })
})

router.get('/list', (req, res)=> {
    const branch = new Promise((resolve, reject) => {
        connection.query(`select * from branches;`,(err, response)=> {
            err? reject(): resolve(response.rows)
        })
    })

    branch.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching branch data failed',
            success: false
        })
    })
})

router.get('/list/:id', (req, res)=> {
    const branch = new Promise((resolve, reject) => {
        connection.query(`select * from dep_branch where dep_id= ${req.params.id};`,(err, response)=> {
            err? reject(): resolve(response.rows)
        })
    })

    branch.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching branch data failed',
            success: false
        })
    })
})

router.get('/:id', async (req, res)=> {
    const branch = new Promise((resolve, reject) => {
        connection.query(`select * from branches where branch_id= ${req.params.id};`,(err, response)=> {
            err? reject(): resolve(response.rows)
        })
    })

    branch.then((data)=> {
        res.status(200).json({
            result: data,
            success: true
        })
    })
    .catch(()=> {
        res.status(500).json({
            result: 'fetching branch data failed',
            success: false
        })
    })
})

module.exports = router;