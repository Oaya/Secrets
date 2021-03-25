require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require("passport");


const app = express();

app.set("view engine", "ejs");
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({
    extended: true
})); //Parse URL-encoded bodies

app.use(session({
  secret: 'This is session secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true)

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.render("home")
});

app.route("/login")
    .get((req, res) => {
        res.render("login")
    })
    .post((req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        req.login(user, (err)=>{
            if(err){
                console.log(err);
            }else{
                passport.authenticate("local")(req,res, ()=>{
                    res.redirect("/secrets");
                });
            }
        }); 
        
    });

app.route("/register")
    .get((req, res) => {
        res.render("register")
    })
    .post((req, res) => {
        User.register({username:req.body.username}, req.body.password,(err,user)=>{
            if(err){
                console.log(err);
                res.redirect("/register")
            }else{
                passport.authenticate("local")(req,res,()=>{
                    res.redirect("/secrets")
                })
            }
        })    
    });

app.get("/secrets", (req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});



app.listen(3000, () => {
    console.log("server started on port 3000");
});