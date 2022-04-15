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

    setLight = async (light: Accessory, config: ILightConfig) => {

        // light level capped at .8 to preserve lifetime and since it's annoyingly bright.
        const outConf = {
            onOff: config.lightsOn,
            dimmer: config.dimmerLevel * 0.8,
            color: config.color,
            transitionTime: config.transitionTime
        }
        await this.cli?.operateLight(light, outConf, false) //always use operateLight
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
