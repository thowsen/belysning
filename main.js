const tradfri_client = require("./util/tradfri")
const readline = require('readline')
const web_interface = require("./web/web")
const {
    LEFT_RIGHT,
    ODD_EVEN,
    WHOLE_ROOM
} = require('./util/groups')
const {
    clearInterval
} = require("timers")

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

let currentTheme;
const main = async () => {
    const client = await tradfri_client.getInstance()
    const bulbs = client.getBulbs()

    exitOnKeyPress(client);

    // example
    //tivoliLights(client)
    /*web_interface.start((body) => {
        if (currentTheme) {
            clearInterval(currentTheme)
        }

        bulbs.forEach((e) => {
            client.setLight(e, {
                onOff: false,
                color: "ffffff",
                dimmer: 40,
                transitionTime: 500
            })
        })

        setTimeout(() => {
            console.log("Switching to theme " + body.option);
            switch (body.option) {
                case "halloween":
                    currentTheme = halloween(client)
                    break
                case "christmas":
                    currentTheme = christmas(client)
                    break
                case "white":
                    currentTheme = white(client)
                    break
                default:
                    break
            }
        }, 5000)
    })*/
    bulbs.forEach((e) => {
        client.setLight(e, {
            onOff: true,
            color: 'FFFFFF',
            dimmer: 50,
            transitionTime: 500
        })
    })
}

const white = (client) => {
    client.getBulbs().forEach((e) => {
        client.setLight(e, {
            color: 'FFFFFF',
            dimmer: 50,
            transitionTime: 0
        })
    })
}

const rand = (i) => Math.floor(Math.random() * i)
const halloween = (client) => setInterval(() => {
    client.getBulbs().forEach((e) => {
        let r = rand(255).toString(16);
        let g = rand(255).toString(16);
        let b = rand(255).toString(16);
        let d = rand(50);
        client.setLight(e, {
            color: r + g + b,
            dimmer: d,
            transitionTime: 0
        })
    })
}, 50)
let l = ODD_EVEN.even;
let r = ODD_EVEN.odd;
const christmas = (client) => {
    setInterval(() => {
        l.forEach((i) => {
            const bulb = client.getBulb(i);
            client.setLight(bulb, {
                color: "00FF00",
                dimmer: 40
            })
        })
        r.forEach((i) => {
            const bulb = client.getBulb(i);
            client.setLight(bulb, {
                color: "FF0000",
                dimmer: 40
            })
        })

        let k = l;
        l = r;
        r = k;
    }, 5000);
    /*
        [{'thirteen': 65548},
         {'twelve ': 65539},
         {'nine' : 65540},
         {'seven' : 65541},
         {'eleven' : 65547},
         {'ten' : 65546},
         {'one' : 65545},
         {'two' : 65544},
         {'five' : 65543},
         {'four' : 65542} ]
            */
}

main()