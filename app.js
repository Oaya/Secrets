require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();

console.log(process.env.API_KEY);

app.set("view engine", "ejs");
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({extended: true})); //Parse URL-encoded bodies

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']  });

const User = mongoose.model("User", userSchema);

app.get("/", (req,res)=>{
    res.render("home")
});

app.route("/login")
    .get((req,res)=>{
    res.render("login")
})
    .post((req,res)=>{
        User.findOne({email: req.body.username},(err, result)=>{
            if(err){
                console.log(err);
            }else{
                if(result){
                    if(result.password === req.body.password){
                        res.render("secrets")
                    }
                }
            }
        })
    })

app.route("/register")
    .get((req,res)=>{
        res.render("register")
    })
    .post((req,res)=>{
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
        newUser.save((err)=>{
            if(!err){
                res.render("secrets")
            }else{
                console.log(err);
            }    
        });
   });





app.listen(3000, ()=>{
    console.log("server started on port 3000");
});