const express = require('express')
let app = express()
const port = 9000

let func;

app.use(express.static('./web/www'))
app.use(express.json())

app.post('/lampapi', (req, res) => {
    func(req.body)
})

const start = (f) => {
    func = f
    app.listen(port, () => console.log('Started web interface on port ' + port))
}

module.exports = {
    start
}