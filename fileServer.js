const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')
const splitFile = require('split-file')
const { spawn } = require('child_process')

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


    const cmd = spawn('split-file', ['-s', './uploads/' + fileName, 3])
    cmd.stdout.on('data', (data) => {
        console.log(`Data: ${data}`)
        for (var i = 0; i < 3; i++) {
            var name = fileName + '.sf-part' + (i + 1)

            fs.readFile(name, 'utf8', async (err, val) => {
                if (err) res.status(404).json({
                    message: 'some error occured'
                })
                data: val
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                var urlencoded = new URLSearchParams();
                urlencoded.append("owner", req.body.owner);
                urlencoded.append("data",data);
                urlencoded.append("fno", "13");

                var requestOptions = {
                    method: 'POST',
                    body: urlencoded
                };

                await fetch("localhost:3000/addBlock", requestOptions)
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
    });

    res.status(200).json({
        message: 'File Uploaded',
    })
})

app.listen(4000)