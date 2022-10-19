const express = require('express')
const app = express()
const port = 3000


const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))



app.get('/', (req, res) => {
    res.send('Hello World!!!!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})