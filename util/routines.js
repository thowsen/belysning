
const rand = (i) => Math.floor(Math.random() * i)

const tivoliLightsSync = async (client) => {
    await startLights(client)
    setInterval(() => {
        let r = rand(255).toString(16);
        let g = rand(255).toString(16);
        let b = rand(255).toString(16);
        let d = rand(30) + 20;

        applyUnsafe(client, { color: r + g + b, dimmer: d, transitionTime: 0 })
    }, 3000)
}

const halloween = async (client) => {
    await startLights(client)
    client.getBulbs().forEach((e) => {
        client.setLight(e, { color: 'FF8000', dimmer: 20 })
    })
}


const tivoliLightsAsync = async (client) => {
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
    }, 300)
}

const turnOff = async (client) => {
    apply(client, apply({ onOff: false }))
}

const turnOn = async (client) => {
    apply(client, apply({ onOff: true }))
}

const startLights = async (client) =>
    client.getBulbs().forEach(e => client.setLight(e, { onOff: true, color: 'FFFFFF', dimmer: 500 }))

const apply = async (client, config) => {
    await startLights(client)
    applyUnsafe(client, config)
}

// may cause synchronization bugs when used without startLights. **should not be exported**.
const applyUnsafe = async (client, config) => {
    client.getBulbs().forEach(e => client.setLight(e, config))
}

const presets = { tivoliLightsAsync, halloween, tivoliLightsSync, turnOn, turnOff }


module.exports = { presets, apply }