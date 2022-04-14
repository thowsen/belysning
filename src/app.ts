import { LightConfigBuilder } from "./util/LightConfig"
import Belysning from "./util/belysning"
const express = require('express')
require('path').basename(__dirname);
const app = express()
const port = 8080

// allows non-json responseheaders.
app.use(express.urlencoded({ extended: false }))


// serves index.html in /templates/index.html
app.get('/', (req: any, res: any) => {
    res.sendFile('index.html', { root: `${__dirname}/templates` })
})


app.post('/', async (req: any, res: any) => {
    // extract body
    var onOff = req.body.status
    var dimmer = req.body.dimmer
    var color = req.body.color

    // create dummy LightConfigBuilder w/ default values
    var lcb = new LightConfigBuilder()

    if (Number(dimmer)) {
        lcb.dimmerLevel = (new Number(dimmer)).valueOf()
    }
    if (color) {
        lcb.safeSetColor(color)
    }

    if (Boolean(onOff) === onOff) {
        lcb.setLightsStatus = onOff
    }

    // pack config
    const cfg = lcb.build()

    // get singleton instance
    try {
        const belysning = await Belysning.getInstance()
        belysning.apply(cfg)
        res.status(200).send({ message: "deployed", config: { ...cfg } }) // alpha :)
    } catch (e) {
        res.status(500).send({ message: "deployed", config: { ...cfg } }) // alpha :)
    }
})



app.listen(port, () => {
    console.log(`Server up, listening on port: ${port} `)
})

