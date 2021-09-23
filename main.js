const tradfri_client = require("./util/tradfri")
const readline = require('readline')

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
    const bulbs = client.getBulbs()

    exitOnKeyPress(client);

    // example
    myFunc(client)
}

const rand = (i) => Math.floor(Math.random() * i)

const myFunc = async (client) => setInterval(() => {

    client.getBulbs().forEach((e) => {
        let r = rand(255).toString(16);
        let g = rand(255).toString(16);
        let b = rand(255).toString(16);
        client.setLight(e, {
            color: r + g + b,
            dimmer: 10,
            transitionTime: 0
        })
    })
}, 50)

main()