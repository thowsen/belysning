import { ILightConfig } from "./LightConfig"
const tr = require("node-tradfri-client")
const _ = require("dotenv").config()

export class TradfriClient {
    static instance: TradfriClient
    private cli: any = undefined
    private SECCODE: string | undefined = process.env.SECCODE

    public static getInstance: () => Promise<TradfriClient> = async () => {
        if (TradfriClient.instance) {
            return TradfriClient.instance
        }
        const tmp = new TradfriClient()
        await tmp._init();
        TradfriClient.instance = tmp
        return TradfriClient.instance
    }

    // singleton object. only one connection possible. See getInstance.
    private constructor() { }


    private _init: () => Promise<void> | never = async () => {
        // discovering gateway
        const res = await this._discoverGW()
        if (!res) throw new Error("failed to discover gateway!");
        const ip = res.ip
        return this._connect(ip)
            .then(() => this._discoverDevices())

    }


    //config values: 
    //    onOff : bool
    //    dimmer : 0-100
    //    color : hexcode (example F12C3B)
    //    transitionTime : milliseconds
    setLight = async (light: any, config: ILightConfig) => {

        // light level capped at .8 to preserve lifetime and since it's annoyingly bright.
        const outConf = {
            onOff: config.lightsOn,
            dimmer: config.dimmerLevel * 0.8,
            color: config.color,
            transitionTime: config.transitionTime
        }

        await this.cli.operateLight(light, outConf, false) //always use operateLight
        return
    }

    getBulbs = () => {
        const BULB_TYPE = 2 // read documentation for types. Light bulbs are 2.
        const out = []
        for (const e in this.cli.devices) {
            if (this.cli.devices[e].type !== BULB_TYPE) continue
            out.push(this.getDevice(e))
        }
        return out
    }

    getBulb = (id: any) => {
        return this.cli.devices[id]
    }

    getDevice = (key: any) => {
        return this.cli.devices[key]
    }

    /**
     * retrieve the color of a light bulb
     * @param id the id of the light bulb
     * @returns a 6 digit hexadecimal string representation of the color. NOT including '#' sign.
     */
    getColor = (id: any) => {
        return this.getBulb(id).lightList[0].color
    }

    /*
        ---- AUXILLARY METHODS. HERE BE DRAGONS
    */

    /**
     * attemps to retrieve the IP of a TradFri Gateway
     * @returns either null or a prototype object containing the IP adress of a TradFri Gateway
     */
    private _discoverGW = async () => {
        console.log('discovering a network connected Gateway')
        const gw = await tr.discoverGateway();
        if (!gw) return null
        return {
            message: "success",
            ip: gw.addresses[0]
        }
    }

    /**
     * attemps to create a connection to a tradfri gateway. 
     * This must be called before any commands are sent to bulbs.
     * @param ip the IP of a Tradfri Gateway on the network
     */
    private _connect: (ip: String) => Promise<void> = async (ip) => {
        console.log('Connecting to gateway')
        if (this.SECCODE == null) console.log('Couldn\'t find .env file')
        const client = new tr.TradfriClient(ip);
        try {
            const {
                identity,
                psk
            } = await client.authenticate(this.SECCODE);
            await client.connect(identity, psk);
            console.log('successfully connected to gateway')
        } catch (_) {
            throw new Error(`Couldn't connect to tradfri client named: ${ip}`)
        }
        this.cli = client
    }

    /**
     * The gateway checks all devices on the network.
     * If the devices are manipulated by remote, the API will know about it.
     */
    private _discoverDevices = async () => {
        console.log(`Discovering devices`)
        await this.cli.observeDevices()
        await this.cli.observeGroupsAndScenes()
        console.log(`Devices successfully discovered`)
    }


}
