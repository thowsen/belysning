const tradfri_client = require("./util/tradfri")
const readline = require('readline')
const {
    LEFT_RIGHT,
    ODD_EVEN,
    WHOLE_ROOM
} = require('./util/groups')

const exitOnKeyPress = (client) => {
    console.log('Press any key to exit')
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on('keypress', (str, key) => {
        console.log('Shutting down')
        client.destroy()
        process.exit()
    })
}

const main = async () => {
    const client = await tradfri_client.getInstance()

    exitOnKeyPress(client);
    tivoliLights(client)
}

const rand = (i) => Math.floor(Math.random() * i)

// As the name implies. Starts all lights
// OBS: this should be called !once! for each new 
const startLights = async (client) => 
    client.getBulbs().forEach(e => client.setLight(e, {onOff: true, color: 'FFFFFF', dimmer: 500}))


const tivoliLights = async (client) => {
    await startLights(client)
    setInterval(() => {
    client.getBulbs().forEach((e) => {
        let r = rand(255).toString(16);
        let g = rand(255).toString(16);
        let b = rand(255).toString(16);
        let d = rand(30) + 20;
        client.setLight(e, {
            color: r + g + b,
            dimmer: d,
            transitionTime: 0
        })
    })
}, 5000)
}

main()