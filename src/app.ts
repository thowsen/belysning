import { ILightConfig, LightConfigBuilder } from "./util/LightConfig"
import express, { Request, Response, Express } from 'express'
import dotenv from 'dotenv'
import Belysning from "./util/belysning"

// default .env path in root directory.
dotenv.config()

require('path').basename(__dirname);
const app: Express = express()
const port: number = Number(process.env.port) | 8080

// allows non-json responseheaders.
app.use(express.urlencoded({ extended: false }))


// serves index.html in /templates/index.html
app.get('/', (req: Request, res: Response) => {
    res.sendFile('index.html', { root: `${__dirname}/templates` })
})

// upon post request to root.
app.post('/', async (req: Request, res: Response) => {
    // extract body
    var onOff: boolean = req.body.status
    var dimmer: number = req.body.dimmer
    var color: string = req.body.color

    // create dummy LightConfigBuilder w/ default values
    var lcb = new LightConfigBuilder()
    console.log(`onOff: ${onOff}, dimmer: ${dimmer}, color: ${color}`)
    // if following checks are all invalid, default values will be deployed.
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
    const cfg: ILightConfig = lcb.build()


    try {
        // get singleton instance, possible exception since it'll try to establish connection.
        const belysning = await Belysning.getInstance()
        belysning.apply(cfg)
        // 200, should be ok. might have skipped bad values such as invalid hex color.
        res.status(200).send({ message: "deployed" })
    } catch (e) {
        res.status(500).send({ message: "error contacting tradfri gateway" })
    }
})


// start the server
app.listen(port, () => {
    console.log(`Server up, listening on port: ${port} `)
})

