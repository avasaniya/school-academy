require('dotenv').config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const app = express();
const bcrypt = require("bcryptjs");
const cookieparser = require("cookie-parser");
// const auth = require("../scr/middleware/auth");

require("./db/conn");
const Registrar = require("../scr/model/registrar");
const Contect = require("../scr/model/contect");
const { log } = require("console");
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());//midallver pass karvanu hoy tyare use thay 
app.use(express.urlencoded({ extended: false }));


// html thi apde deta add karva mate urlencoded no use thay che 

const static_path = path.join(__dirname, "../public");
const tepleatspath = path.join(__dirname, "../tepleats/views");
const partialspath = path.join(__dirname, "../tepleats/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", tepleatspath);
hbs.registerPartials(partialspath);
hbs.registerPartials(tepleatspath);


app.get("/", (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/index.hbs");
});

app.get("/secreatkey",(req, res) => { 
    // Get Cookie Value
    console.log(`this is show cookies id :- ${req.cookies.loginjwt}`);
    res.render("secreatkey");
});

// app.get("/logout",auth,async(req,res)=>{
//     try {
//         console.log(res.User);
// //currelemt token ne logout ni harej remove karva mate thay che 
//         req.User.token = req.User.token.filter((currentElement) => {
//             return currentElement.token !== req.token 
//         });

//         res.clearCookie("jwt");
//         console.log("logout successfully Done...");

//         await res.User.save();
//         res.render("login");
//     } catch (error) {
//         res.status(401).send(error);
//     }
// })

app.get("/ragistar", (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/ragistar.hbs");
});

app.get("/login", (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/login.hbs");
});

app.get("/contect", (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/contect.hbs");
});

app.post("/ragistar", async (req, res) => {
    try {
        const password = req.body.Password;//java
        const CPassword = req.body.ConfirmPassword;//java

        if (password == CPassword) {//java (Password == ConfirmPassword)

            const registrarstudent = new Registrar({

                Firstname: req.body.Firstname,
                Lastname: req.body.Lastname,
                gender: req.body.gender,
                Email: req.body.Email,
                ContectNumber: req.body.ContectNumber,
                Password: password,             //java req.body.Password,
                ConfirmPassword: CPassword,     //java req.body.ConfirmPassword,

            })

            // console.log("the sucsess prth " + registrarstudent);

            //creat jwt a token 

            const cetoken = await registrarstudent.generateAuthToken();
            // console.log("the token prth :-  " + cetoken);

            // The res.cookie() function is used to set the cookie name to value.
            // The value parameter may be a string or object converted to JSON.

            // res.cookie("registrar",cetoken); 

            res.cookie('registrar', cetoken, {

                expires: new Date(Date.now() + 60000),
                httpOnly: true

            });

            

            const ragistered = await registrarstudent.save();
            // console.log("the page prth" + ragistered);

            res.status(201).render("index");

        } else {//javascript vapro to remove
            res.status(400).send("Inveild deteils");//javascript vapro to remove
        }//javascript vapro to remove
    } catch (error) {
        res.status(401).send(error);
        console.log("page error");
    }
});

app.post("/login", async (req, res) => {
    try {
        const Email = req.body.Email;
        const Password = req.body.Password;

        const resultemail = await Registrar.findOne({ Email: Email }) //ek email collection decument and uper nu class


        //creat jwt a token 
        const tokenlog = await resultemail.generateAuthToken(); 
        console.log("the login parth:- " + tokenlog);

        // methord-1
        // //creat tooken kara pachi show kara va mate token name and ganret thayel id
        // res.cookie("loginjwt", tokenlog);
        
        //apnu cookie male ayre tene ketlo time rakh vu che te na mate expires no use
        res.cookie('loginjwt', tokenlog,{
            expires: new Date(Date.now() + 600000),
            httpOnly: true
            // secure:true
        });

        const isMatch = await bcrypt.compare(Password, resultemail.Password);
        if (isMatch) {

            res.status(201).render("index");

        } else {

            res.send("Inveild password deteils");

        }
    }
    catch (error) {
        res.status(401).send('Inveild Login deteils');
    }
});

app.post("/contect", async (req, res) => {
    try {

        const contectstudent = new Contect({

            Firstname: req.body.Firstname,
            Lastname: req.body.Lastname,
            gender: req.body.gender,
            dob: req.body.dob,
            address: req.body.address,
            landmark: req.body.landmark,
            pincode: req.body.pincode,
            Email: req.body.Email,
            ContectNumber: req.body.ContectNumber,
            Message: req.body.Message,
        })
        console.log("the sucsess prth " + contectstudent);

        //creat jwt a token 
        const cotoken = await contectstudent.generateAuthToken();
        console.log("the token prth" + cotoken);

        res.cookie("jwt", cotoken, {

            expires: new Date(Date.now()),
            httpOnly: true


        });

        console.log(cookie);


        const contectu = await contectstudent.save();
        console.log("the page prth" + contectu);

        res.status(201).render("index");
    } catch (error) {
        res.status(401).send(error);
        console.log("page error");
    }
});

app.listen(port, () => {
    console.log(`server conection is done.... ${port}`);
});


                        // JSONWebToken (JWT) with Nodejs & MongoDB

// const jwt = require("jsonwebtoken");

// const createtoken = async() =>{
//     const token = await jwt.sign({_id:"64d370d02c91e7b16be20be2"},"idisveryinpotentarecollecthin",{expiresIn:"2 seconds"});//idisveryinpotentarecollecthin=> is sekretkey te apde rendem nakhva ni hoy che
//     console.log(token);

//            //* sentecs
//         // jwt.verify(token, secretOrPublicKey, [options, callback])
// const variuser = await jwt.verify(token,"idisveryinpotentarecollecthin")
// console.log(variuser);

// }
// createtoken();