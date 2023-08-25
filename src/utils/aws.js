const AWS = require('aws-sdk')
const fs = require('fs')
require('dotenv').config()

let s3 = new AWS.S3({
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
})

// let s3 = new AWS.S3({
//     region: 'ap-south-1',
//     accessKeyId: 'AKIAU2MNRVPBXQOO2G2Y',
//     secretAccessKey: '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'
// })


// s3.putObject({
//     Bucket: 'tele-profile',
//     Key: 'profile/pg.jpg',
//     Body: fs.readFileSync('./pg.jpg')
// }, (err, response) => {
//     if(err){
//         console.log(err)
//     }
//     console.log(response)
// })


// const params = {
//     Bucket: 'trippens',
//     Key: 'ayra.png',
//     ResponseContentDisposition: 'inline'
// };
// const url = s3.getSignedUrl('getObject', params);
// console.log(url)

// console.log(url)

// s3.deleteObject({
//     Bucket: 'trippens',
//     Key: 'firstimg.jpg'
// }, (err, response) => {
//         if(err){
//             console.log(err)
//         }
//         console.log('deleted')
// })

module.exports = s3;