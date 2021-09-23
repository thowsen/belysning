const tradfri_client = require("./util/tradfri")

const main = async () => {
    const client = await tradfri_client.init()
    const bulbs = tradfri_client.getBulbs(client)

    // example
    bulbs.forEach(e => {
        tradfri_client.setLight(e,{color: e.instanceId % 2 === 0 ? '11FF11' : 'FF00FF'} ,client)
    })
}

main()