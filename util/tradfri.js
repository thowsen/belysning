const tr = require("node-tradfri-client")
const _ = require("dotenv").config()

let instance = null
const SECCODE = process.env.SECCODE

const discoverGW = async () => {
    console.log('discovering a network connected Gateway')
    const gw = await tr.discoverGateway();
    if (!gw) return null
    return {
        message: "success",
        ip: gw.addresses[0]
    }
}

const connect = async (name) => {
    console.log('Connecting to gateway')
    const client = new tr.TradfriClient(name);
    try {
        const {
            identity,
            psk
        } = await client.authenticate(SECCODE);
        const res = await client.connect(identity, psk);
        console.log('successfully connected to gateway')
    } catch (_) {
        console.debug(`Couldn't connect to tradfri client named: ${name}`)
    }
    return client
}

const discoverDevices = async (cli) => {
    console.log(`Discovering devices`)
    await cli.observeDevices()
    await cli.observeGroupsAndScenes()
    console.log(`Devices successfully discovered`)
}

const getBulbs = (cli) => {
    const BULB_TYPE = 2 // read documentation for types. Light bulbs are 2.
    const out = []
    for (const e in cli.devices) {
        if (cli.devices[e].type !== BULB_TYPE) continue
        out.push(getDevice(e, cli))
    }
    return out
}

const getDevice = (key, cli) => {
    return cli.devices[key]
}

//config values: 
//    onOff : bool
//    dimmer : 0-100
//    color : hexcode (example F12C3B)
//    transitionTime : milliseconds
const setLight = (light, config, cli) => {
    // light is capped at 80
    if (config && config.dimmer && config.dimmer > 80) {
        config.dimmer = 80
    }
    cli.operateLight(light, config, true) //always use operateLight
}

const getInstance = async () => {
    if (instance) return instance
    const res = await discoverGW()
    if (!res) throw 'Couldn\'t find a gateway on current wifi'

    const client = await connect(res.ip)
    await discoverDevices(client)
    instance = {
        getBulbs: () => getBulbs(client),
        setLight: (light, config) => setLight(light, config, client),
        destroy: () => client.destroy()
    }
    return instance
}

module.exports = {
    getInstance
}