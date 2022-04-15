import { ILightConfig } from "./LightConfig"
import {discoverGateway, TradfriClient, Accessory, AccessoryTypes } from "node-tradfri-client"
const _ = require("dotenv").config()

export class TradfriCli {
    static instance: TradfriCli
    private cli: TradfriClient | undefined = undefined
    private SECCODE: string = TradfriCli.extractSecurityCode()

    public static getInstance: () => Promise<TradfriCli> = async () => {
        if (TradfriCli.instance) {
            return TradfriCli.instance
        }
        const tmp = new TradfriCli()
        await tmp._init();
        TradfriCli.instance = tmp
        return TradfriCli.instance
    }

    // singleton object. only one connection possible. See getInstance.
    private constructor() { }

    /**
     * Universal function for setting the light of a bulb, given an ILightConfig object.
     *
     * config values:
     *     onOff : bool
     *     dimmer : 0-100
     *     color : hexcode (example F12C3B)
     *     transitionTime : milliseconds
     */
    setLight = async (light: Accessory, config: Partial<ILightConfig>) => {
        type PLC = Partial<ILightConfig>
        function addDimmer(level: number, confBuilder: PLC): PLC {
            if (level <= 0 || level > 100) {
                throw Error(`dimmerLevel out of bounds: ${config.dimmerLevel},` +
                            ` must be in range (0, 100]`)
            }
            // Light level capped at 80 % to preserve lifetime and because it's
            // annoyingly bright.
            return {...confBuilder, dimmerLevel: level * 0.8}
        }
        function addColor(color: string, confBuilder: PLC): PLC {
            if (color.length !== 6) {
                throw Error(`color has an invalid length: ${color.length}, must be 6`)
            } else if (color.match(/[a-zA-Z0-9]{6}/)) {  // Match a 6 character hex code
                throw Error(`color is not a valid hex code: ${color}`)
            }
            return {...confBuilder, color: color}
        }
        function addTransitionTime(time: number, confBuilder: PLC): PLC {
            if (time < 0 || time > (10 ^ 5)) {
                throw Error(`Invalid transitionTime: ${time}, must be in the range [0, 10000]`)
            }
            return {...confBuilder, transitionTime: time}
        }

        // Collect and validate inputs that are present.
        let builder: PLC = {}
        if (config.lightsOn !== undefined) {
            builder = {...builder, lightsOn: config.lightsOn}
        }
        if (config.dimmerLevel !== undefined) {
            builder = addDimmer(config.dimmerLevel, builder)
        }
        if (config.color !== undefined) {
            builder = addColor(config.color, builder)
        }
        if (config.transitionTime !== undefined) {
            builder = addTransitionTime(config.transitionTime, builder)
        }

        // Construct the object to send to the external tradfri API.
        const outConf = {
            onOff: config.lightsOn,
            dimmer: config.dimmerLevel,
            color: config.color,
            transitionTime: config.transitionTime,
        }
        await this.cli?.operateLight(light, outConf, false)  // always use operateLight
        return
    }

    getBulbs : () => Accessory[] = () => {
        const BULB_TYPE = 2 // read documentation for types. Light bulbs are 2.
        const out: Accessory[] = []
        for (const e in this.cli?.devices) {
            if (this.cli?.devices[e].type !== BULB_TYPE) continue
            const elem = this.getDevice(e)
            if (elem){
                out.push(elem)
            }
        }
        return out
    }

    getBulb = (id: string) => {
        return this.cli?.devices[id]
    }

    getDevice = (key: string) => {
        return this.cli?.devices[key]
    }

    /**
     * retrieve the color of a light bulb
     * @param id the id of the light bulb
     * @returns a 6 digit hexadecimal string representation of the color. 
     * NOT including '#' sign.
     */
    getColor = (id: string) => {
        return this.getBulb(id)?.lightList[0].color
    }

    /*
        ---- AUXILLARY METHODS. HERE BE DRAGONS
    */


    private _init: () => Promise<void> = async () => {
        // discovering gateway
        const ip = await this._discoverGW()
        return this._connect(ip)
            .then(() => this._discoverDevices())
    }

    /**
     * attemps to retrieve the IP of a TradFri Gateway
     * @returns either null or a prototype object containing the IP adress of a TradFri Gateway
     */
    private _discoverGW : () => Promise<string> = async () => {
        console.log('discovering a network connected Gateway')
        const gw = await discoverGateway();
        if (!gw) throw new Error("failed to discover Gateway")
        return gw.addresses[0]
    }

    /**
     * attemps to create a connection to a tradfri gateway. 
     * This must be called before any commands are sent to bulbs.
     * @param ip the IP of a Tradfri Gateway on the network
     */
    private _connect: (ip: string) => Promise<void> = async (ip) => {
        console.log('Connecting to gateway')
        const client  : TradfriClient = new TradfriClient(ip);
        try {
            const {
                identity,
                psk
            } = await client.authenticate(this.SECCODE!);
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
    private _discoverDevices : () => Promise<void> = async () => {
        console.log(`Discovering devices`)
        await this.cli?.observeDevices()
        await this.cli?.observeGroupsAndScenes()
        console.log(`Devices successfully discovered`)
    }

    private static extractSecurityCode : () => string = () => {
        const out = process.env.SECCODE
        if (!out) throw new Error("failed to extract security code from env")
        return out
    }
}
