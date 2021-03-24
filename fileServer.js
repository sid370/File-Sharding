const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')
const splitFile = require('split-file')
const { spawn } = require('child_process')
global.fetch = require("node-fetch");
const SHA256 = require("crypto-js/sha256")

app.use(morgan("dev"))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var fileName = ''
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        fileName = file.originalname
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })

app.post('/file', upload.single('file'), async (req, res, next) => {

    var data = ''

    let uniqueName = ''
    const cmd = await spawn('split-file', ['-s', './uploads/' + fileName, 3])
    cmd.stdout.on('data', (data) => {
        console.log(`Data: ${data}`)
        
        for (var i = 0; i < 3; i++) {
            var name = './uploads/'+fileName + '.sf-part' + (i + 1)
            let fname = SHA256(fileName).toString()
            uniqueName=fname
            fs.readFile(name, 'utf8',  (err, val) => {
                // if (err) return res.status(404).json({
                //     message: 'some error occured'
                // })

                if (err)    console.warn(err)
                let bodyData = val
                //console.log(bodyData)
                //var myHeaders = new Headers();
                //myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                
                bodyData={
                    owner: req.body.owner,
                    data: bodyData,
                    fno: fname
                }

                console.log('Data: ',bodyData)
                var requestOptions = {
                    method: 'POST',
                    mode: 'cors',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyData)
                };

                fetch("http://localhost:3000/addBlock", requestOptions)
                    .then(response => response.text())
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
            })



        }
    })

    cmd.stderr.on('err', (err) => {
        console.log(`Error: ${err}`)
    })

    cmd.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        res.status(200).json({
            message: 'File Uploaded',
            UUID: uniqueName
        })
    });

})

app.listen(4000)