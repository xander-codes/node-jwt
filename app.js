require('dotenv').config();
require('./config/database').connect();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const auth = require('./middleware/auth')

const User = require('./model/user')

const app = express();
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("Hello")
});

app.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        if (!(email && password && firstname && lastname)) {
            res.status(400).send("All fields are required");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(401).send("User already exists");
        }

        const myEncPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: myEncPassword
        });

        // Token creation
        const token = jwt.sign(
            {
                user_id: user._id
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "2h"
            }
        );

        user.token = token;

        // update or not in DB

        // to hide password from response
        user.password = undefined;

        res.status(201).json(user);
    }
    catch (err) {
        console.log(err)
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            res.status(400).send("All fields are required");
        }

        const user = await User.findOne({ email })

        if (user && (await bcrypt.compare(password, user.password))) {
            // Token creation
            const token = jwt.sign(
                {
                    user_id: user._id, email
                },
                process.env.SECRET_KEY,
                {
                    expiresIn: "2h"
                }
            );

            user.token = token;

            // to hide password from response
            user.password = undefined;

            // res.status(200).json(user);

            // If we want to use cookie
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.status(200).cookie('token', token, options).json({
                success: true,
                token,
                user
            });
        }

        res.status(400).send("Incorrect Credentials");

    }
    catch (err) {
        console.log(err)
    }
});

app.get("/dashboard", auth, (req, res) => {
    res.send("Secret Route XD");
})

app.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.send("Logged Out");
})

module.exports = app;
