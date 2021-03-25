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
const { response } = require('express')
const Cryptr = require("cryptr")
const { pathToFileURL } = require('url')
const cryptr = new Cryptr("SecretKey10")
var path = require("path")

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

function deleteFiles(array) {
    for (i = 0; i < array.length; i++) {
        fs.unlinkSync(array[i])
    }
}

app.post('/file', upload.single('file'), async (req, res, next) => {

    var data = ''

    let uniqueName = ''

    nameArray = []
    nameArray.push('./uploads/' + fileName)
    const cmd = await spawn('split-file', ['-s', './uploads/' + fileName, 3])
    cmd.stdout.on('data', (data) => {
        console.log(`Data: ${data}`)

        for (var i = 0; i < 3; i++) {

            var name = './uploads/' + fileName + '.sf-part' + (i + 1)
            nameArray.push(name)

            let fname = SHA256(name + new Date()).toString()
            uniqueName += " " + fname

            fs.readFile(name, 'utf8', (err, val) => {
                if (err) console.warn(err)
                let bodyData = val

                bodyData = {
                    owner: req.body.owner,
                    data: bodyData,
                    fno: fname
                }

                console.log('Data: ', bodyData)
                var requestOptions = {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyData)
                };

                fetch("http://localhost:3000/addBlock", requestOptions)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result)
                    })
                    .catch(error => console.log('error', error));
            })
        }

        deleteFiles(nameArray)

    })

    cmd.stderr.on('err', (err) => {
        console.log(`Error: ${err}`)
    })

    cmd.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        res.status(200).json({
            message: 'File Uploaded',
            UUID: uniqueName.split(" ").join("")
        })
    });

})


app.get('/genFile/:uid', async (req, res, next) => {
    resp = []
    resp[0] = req.params.uid.slice(0, 64)
    resp[1] = req.params.uid.slice(64, 128)
    resp[2] = req.params.uid.slice(128, 192)
    console.log("Resp " + resp)
    let fileData = ''
    fetch('http://localhost:3000/getChain/' + resp[0], {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(response => {
            fileData = fileData + response.blockData.data
            fetch('http://localhost:3000/getChain/' + resp[1], {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(response => {
                    fileData = fileData + response.blockData.data

                    fetch('http://localhost:3000/getChain/' + resp[2], {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                        .then(response => response.json())
                        .then(async response => {
                            fileData = fileData + response.blockData.data

                            fs.writeFile("./" + req.params.uid + ".txt",fileData,(err)=>{
                                if (err)
                                res.status(404).json({
                                    message: 'Some error occured while creating the file'
                                })

                                res.download("./" + req.params.uid + ".txt")
                            })

                            await res.download("./" + req.params.uid + ".txt")

                            // res.sendFile(req.params.uid + ".txt", { root: path.join(__dirname) }, (err) => {
                            //     (err)? console.warn(err):null
                            // })
                        })

                })
        })

})


app.listen(4000)