const tradfri_client = require("./util/tradfri")
const readline       = require('readline')

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
    bulbs.forEach(e => {
        client.setLight(e,{color: 'FFFFFF'})
    })
}

main()