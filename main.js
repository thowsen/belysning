const tr = require("node-tradfri-client")
const _  = require("dotenv").config()

const SECCODE = process.env.SECCODE


const discoverGW = async () => {
    console.log('discovering a network connected Gateway')
    const gw = await tr.discoverGateway();
    if (!gw) return null
    return {message : "success", ip: gw.addresses[0]}
}

const connect = async (name) => {
    console.log('Connecting to gateway')
    const tradfri = new tr.TradfriClient(name);
    try {
        const {identity, psk} = await tradfri.authenticate(SECCODE);
        const res = await tradfri.connect(identity, psk);
        console.log('successfully connected to gateway')
    } catch (_) {
        console.debug(`Couldn't connect to tradfri client named: ${name}`)
        console.debug(_)
    }
    return tradfri
}

const discoverDevices = async (cli) => {
    console.log(`Discovering devices`)
    await cli.observeDevices()
    await cli.observeGroupsAndScenes()
    console.log(`Devices successfully discovered`)
}

const main = async () => {
    // discover name of gateway
    const res = await discoverGW()
    if (!res) return console.debug("Couldn't find a gateway on current wifi")
    
    // connect to the gateway
    const tradfri = await connect(res.ip)

    // discovering devices on network (ie bulbs and remote)
    await discoverDevices(tradfri)
    
    //console.log(tradfri.devices[65548])
    
    for (const key in tradfri.devices){
        if (tradfri.devices[key].type === 2){       //type 2 is lightbulb
            
            const newLamp = tradfri.devices[key]
            const hej = await tradfri.operateLight(newLamp, {onOff: true, color: '00FF00', dimmer: 10}, true) //always use operateLight
        }
    }
    console.log(tradfri.devices[65548].lightList)
    await tradfri.updateGroup(tradfri.groups[131073].group)
    await tradfri.updateGroup(tradfri.groups[131076].group)




    
    
    tradfri.destroy()

}

main()