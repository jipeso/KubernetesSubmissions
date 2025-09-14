const express = require('express')

const app = express()
const randomString = crypto.randomUUID()

const generateStatus = () => {
    return new Date().toISOString() + ': ' + randomString
}

setInterval(() => {
    console.log(generateStatus())
}, 5000)

app.get('/hashgenerator', (req, res) => {
    const status = generateStatus()
    res.send(status)
})

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
    console.log(`Timestamp on port ${PORT}`)
})