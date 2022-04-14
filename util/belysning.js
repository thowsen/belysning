// 🪳

const tradfri_client = require("./tradfri")
const { presets, apply } = require("./routines")



/* const main = async () => {
    const client = await tradfri_client.getInstance()
    presets.halloween(client)
} */

const connect = () => { return tradfri_client.getInstance() }



module.exports = { connect, presets, apply }