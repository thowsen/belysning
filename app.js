const express = require('express')
const belysning = require('./util/belysning')
require('path').basename(__dirname);
const app = express()
const port = 8080

var client = undefined 

// singleton instance.
const localClient = async () => {
    if(!client)
        client = await belysning.connect()
    return client
}


// allows non-json responseheaders.
app.use(express.urlencoded({ extended: false }))


// serves index.html in /templates/index.html
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: `${__dirname}/templates`})
})


app.post('/', async (req, res) => {
    out = {}
    onOff = req.body.status
    dimmer = req.body.dimmer
    color = req.body.color
    if (typeof onOff === "boolean") { // janky javascript
        out = { ...out, 'onOff': onOff }
    }


    if (!isNaN(dimmer) && dimmer >= 0 && dimmer <= 100)
        out = { ...out, 'dimmer': dimmer * 0.8 }
    if (checkColorHex(color)){
        color = color.slice(1)
        out = { ...out, 'color': color }
    }

    
    cli = await localClient()
    belysning.apply(cli, out)
    res.status(200).send({ message: "deployed", config: { ...out, "dimmer": 5 * out.dimmer / 4 } }) // alpha :)
})




const checkColorHex = hex => {
    const rgx = /\#[A-Fa-f0-9]{6}/g
    if (hex && isNaN(hex) && hex.length === 7) {
        rg = rgx.exec(hex)
        return rg && rg[0] === hex
    }
    return false
}





app.listen(port, () => {
    console.log(`Server up, listening on port: ${port} `)})

