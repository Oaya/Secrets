require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({
    extended: true
})); //Parse URL-encoded bodies

mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home")
});

app.route("/login")
    .get((req, res) => {
        res.render("login")
    })
    .post((req, res) => {
        User.findOne({
            email: req.body.username
        }, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                if (result) {
                    // Load hash from your password DB.
                    bcrypt.compare(req.body.password, result.password, function (err, foundOne) {
                        if (foundOne === true) {
                            res.render("secrets")
                        }
                    });
                }
            }
        })
    })

app.route("/register")
    .get((req, res) => {
        res.render("register")
    })
    .post((req, res) => {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            // Store hash in your password DB.
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            newUser.save((err) => {
                if (!err) {
                    res.render("secrets")
                } else {
                    console.log(err);
                }
            });
        });
    });





app.listen(3000, () => {
    console.log("server started on port 3000");
});