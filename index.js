const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')
const mongoose = require('mongoose')
const { User } = require('./models/User')
const { auth } = require('./middleware/auth')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())



mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api/users/register', (req, res) => {

    const user = new User(req.body)

    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({ success: true })
    })

})

app.post('/api/users/login', (req, res) => {

    //요청된 이메일 DB에서 찾기
    User.findOne({ email: req.body.email }, (err, user) => {

        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "Not found email"
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {

            if (!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: "Confirm your password"
                })
            }

            user.generateToken((err, user) => {

                if (err) return res.status(400).send(err);

                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })

            })

        })
    })

})

app.get('/api/users/auth', auth, (req, res) => {

    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
    })

})

app.get('/api/users/logout', auth, (req, res) => {

    User.findOneAndUpdate({ _id: req.user._id },
        { token: "" },
        (err, user) => {
            if (err) return res.json({ success: false, err })
            return res.status(200).send({ success: true })
        })

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})