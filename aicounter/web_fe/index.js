const express = require('express')
const app = express()
// const port = 8000
const port = 80

app.use(express.static('public'))

app.get('/', (req, res) => {
    // send public/index.html
    res.sendFile(__dirname + '/public/index.html')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
