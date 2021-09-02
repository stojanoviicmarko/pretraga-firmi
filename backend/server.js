const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")
const passport = require("passport")
const passportLocal = require("passport-local").Strategy
const cookieParser = require("cookie-parser")
const bcrypt = require("bcryptjs")
const session = require("express-session")
const app = express()
const fs = require("fs")
const User = require("./user")

mongoose.connect(
    "mongodb+srv://admin:admin@cluster0.2gcse.mongodb.net/pretraga-firmi?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log("Mongoose Is Connected")
    }
)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
    cors({
        origin: "http://localhost:3000", // <-- location of the react app were connecting to
        credentials: true,
    })
)
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true,
    })
)
app.use(passport.initialize())
app.use(passport.session())
require("./auth")(passport)

// Routes
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err
        if (!user) res.send("No User Exists")
        else {
            req.logIn(user, (err) => {
                if (err) throw err
                res.send("Successfully Authenticated")
                console.log(req.user)
            })
        }
    })(req, res, next)
})

app.post("/register", (req, res) => {
    User.findOne({ username: req.body.username }, async (err, doc) => {
        if (err) throw err
        if (doc) res.send("User Already Exists")
        if (!doc) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            const newUser = new User({
                username: req.body.username,
                password: hashedPassword,
            })
            await newUser.save()
            res.send("User Created")
        }
    })
})

app.get("/user", (req, res) => {
    res.send({
        users: req.user,
    }) // The req.user stores the entire user that has been authenticated inside of it.
})

//Json data

const delatnostiRaw = fs.readFileSync("./json/delatnosti.json")
const delatnosti = JSON.parse(delatnostiRaw)

app.get("/delatnosti", (req, res) => {
    res.send(delatnosti)
})

//Start server
app.listen(5000, () => {
    console.log("Server Has Started")
})
