const fs = require('fs')
const SHA256 = require("crypto-js/sha256")
const Cryptr = require("cryptr")
const cryptr = new Cryptr("SecretKey10")
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const morgan = require("morgan")

class CryptoBlock{
    constructor(index,timestamp,owner,data,fileNumber,precedingHash='',nextHash=''){
        this.index=index
        this.timestamp=timestamp
        this.owner=owner
        this.nextHash=nextHash
        this.data=cryptr.encrypt(data)
        this.hash=this.computeHash()
        this.fno=fileNumber
    }
    
    computeHash(){
        return SHA256(this.index+this.timestamp+this.owner+this.fno).toString()
    }
}

class Blockchain{
    constructor(){
        let data
        (fs.existsSync('blockchain'))? data = fs.readFileSync('blockchain',{encoding: 'utf-8'}):null
        data?  this.blockchain=JSON.parse(data) : this.blockchain = [this.genesisBlock()]
        //this.blockchain = [this.genesisBlock()]
    }

    genesisBlock(){
        return new CryptoBlock(0,new Date(),'Genesis Block','File Sharding Platform by Siddhant')
    }

    obtainLatestBlock(){
        return this.blockchain[this.blockchain.length-1]
    }

    obtainBlock(n){
        return this.blockchain[n]
    }
    
    addNewBlock(newBlock){
        newBlock.precedingHash=this.obtainLatestBlock().hash
        this.obtainLatestBlock().nextHash=newBlock.hash
        this.blockchain.push(newBlock)
        //fs.unlinkSync('blockchain.txt')
        fs.writeFileSync('blockchain',JSON.stringify(this.blockchain))
    }

    getIndex(){
        return this.obtainLatestBlock().index
    }

    getData(hash){
        for (var i=0;i<this.blockchain.length;i++){
            if (this.blockchain[i].hash===hash){
                return {
                    "data": cryptr.decrypt(this.blockchain[i].data)
                }
            }
        }
    }

}

let fileHandler = new Blockchain()

//fileHandler.addNewBlock(new CryptoBlock(1,new Date(),'Saksham Gupta','Sakshams data'))

//console.log(JSON.stringify(fileHandler,null,4))

app.use(morgan("dev"))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.post('/addBlock',async (req,res,next)=>{
    await fileHandler.addNewBlock(new CryptoBlock(fileHandler.getIndex()+1,new Date(),req.body.owner,req.body.data,req.body.fno))
    res.status(200).json({
        message: 'successful'
    })
})

app.get('/getChain',(req,res,next)=>{
    res.status(200).json({
        data: fileHandler
    })
})

app.get('/getChain/:hash',(req,res,next)=>{
    var data = fileHandler.getData(req.params.hash)
    res.status(200).json({
        blockData: data
    })
})

app.get('/checkValid',(req,res,next)=>{
    var data = fileHandler.checkChainValidity()
    if (data) res.status(200).json({
        message: 'Chain Valid'
    })
    else res.status(200).json({
        message: 'Chain Compromised'
    })
})


app.listen(3000 || process.env.PORT)