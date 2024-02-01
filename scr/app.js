require("dotenv").config();

const express = require("express");
const path = require("path");
const hbs = require("hbs");
const ejs = require("ejs");
const app = express();
const bcrypt = require("bcryptjs");
const cookieparser = require("cookie-parser");

//excel js no use jetla user hoy tene excel file ma nakh va mate thay che exceljs npm no use thay che 
const ExcelJS = require("exceljs");

//html to pdf convert
const fs = require('fs');
const pdf = require('html-pdf');
// const path = require("path");
// const ejs = require("ejs");


//middleware
const auth = require("../scr/middleware/auth");
const adminauth = require("../scr/middleware/adminauth");

//multer no use disk ma img stord karava mate thay che 
const multer = require("multer");

//Email mokla va mate thay che 
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');

//rendom token janreat karva mate thay che 
const randomstring = require("randomstring");

//Authentication che je comand apva mate thay che 
const session = require("express-session");
const confing = require("../config/config");

require("./db/conn");
const Registrar = require("../scr/model/registrar");
const Contect = require("../scr/model/contect");


const cookieParser = require('cookie-parser');


const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());//midallver pass karvanu hoy tyare use thay 
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: confing.sessionsecret }));


// html thi apde deta add karva mate urlencoded no use thay che 


const tepleatspath = path.join(__dirname, "../tepleats/views");
const tepleatejspath = path.join(__dirname, "../tepleats/views/admin");
const partialspath = path.join(__dirname, "../tepleats/partials");
const adminparth = path.join(__dirname, "../tepleats/views/admin")



app.set("view engine", "hbs");
app.set("view engine", "ejs");
app.set("views", tepleatspath);
app.set("views", tepleatejspath);
hbs.registerPartials(partialspath);
hbs.registerPartials(tepleatspath);
hbs.registerPartials(adminparth);

const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));

app.get('/', (req, res) => {
    res.render("E:/form/tepleats/views/index.hbs");
});

app.get("/Security", auth.islogin, (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/Security.hbs");
});

app.get("/aboutus", auth.islogin, (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/aboutus.hbs");
});

app.get("/ourteam", (req, res) => { //auth.islogin,
    res.render("E:/software/we&css/form/tepleats/views/ourteam.hbs");
});

app.get("/Blog", (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/Insights/Blog.hbs");
});



app.get("/PublicationsPolicyBriefs", (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/Insights/PublicationsPolicyBriefs.hbs");
});

app.get("/contect", auth.authentiction, (req, res) => {
    console.log(`this is show cookies id :- ${req.cookies.loginjwt}`);
    res.render("contect");
})

//user profile
app.get("/profile", auth.islogin, async (req, res) => {
    try {

        const userdeta = await Registrar.findById({ _id: req.session.user_id });
        // console.log(userdeta);
        res.render("E:/software/we&css/form/tepleats/views/profile.hbs", { user: userdeta });//{ user:userdeta } //user che te ek new veriable che tema user det stord karva mate thay che 
    } catch (error) {
        console.log(error.message);
    }
});

//req.query._id te jyare profile pr hit karye tyare ave che 

app.get("/edit", auth.islogin, async (req, res) => {
    try {
        //req.query._id te jyare profile pr hit karye tyare ave che

        // const id = req.query.id;
        // const userdatas = await Registrar.findById({_id:id});

        const userdatas = await Registrar.findById({ _id: req.session.user_id });

        if (userdatas) {
            res.render("E:/software/we&css/form/tepleats/views/edit.hbs", { user: userdatas });//{ user:userdeta } //user che te ek new veriable che tema user det stord karva mate thay che 
        }
        else {
            res.redirect("/");
        }

    } catch (error) {
        console.log(error.message);
    }
});

//edit deta updeat thay ne show nahi thata 
app.post("/edit", async (req, res) => {
    try {
        const _id = req.session.user_id;
        const userdatas = await Registrar.findByIdAndUpdate({ _id: _id },
            {
                $set: {
                    Firstname: req.body.Firstname,
                    Lastname: req.body.Lastname,
                    Email: req.body.Email,
                    gender: req.body.gender,
                    ContectNumber: req.body.ContectNumber,
                }
            });

        await userdatas.save();

        if (userdatas) {

            res.redirect("profile");

        } else {
            res.render("edit");
        }

    } catch (error) {
        console.log(error.message);
    }
});

//auth.islogout nouse ho user logout hoy to j ragistar per jay ake che 
app.get("/ragistar", auth.islogout, (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/ragistar.hbs");
});

app.get("/verify", async (req, res) => {
    //verifay prosses
    try {
        const updateinfo = await Registrar.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        console.log(updateinfo);
        res.render("E:/software/we&css/form/tepleats/views/verify-mail.hbs");
    } catch (error) {
        console.log(error.message);
    }

});

app.get("/forgot", auth.islogout, async (req, res) => {
    try {
        res.render("E:/software/we&css/form/tepleats/views/forgot.hbs");
    } catch (error) {
        console.log(error.message);
    }
});

app.get("/newpassword", auth.islogout, async (req, res) => {
    try {
        //     //carrent token find karva mate thay 
        const emailtoken = req.query.emailtoken;
        const tokendetas = await Registrar.findOne({ emailtoken: emailtoken });
        //     // console.log({registrar_id:tokendetas._id});
        //     if (tokendetas) {
        //         res.render("newpassword",{Registrar_id:tokendetas._id});//,{registrar_id:tokendetas._id}
        //         // const deleteOne= await Registrar.deleteOne({emailtoken})
        //     }
        //     else{9
        //         res.render("404",{message:"page is not found.."});
        //        }
        res.render("E:/software/we&css/form/tepleats/views/newpassword.hbs", { registrar_id: tokendetas._id });
    } catch (error) {
        console.log(error.message);
    }
});

//verification maile get 
app.get("/verifictionmail", async (req, res) => {
    try {

        res.render("E:/software/we&css/form/tepleats/views/verifictionmail.hbs");

    } catch (error) {
        console.log(error.message);
    }

});

app.get("/login", auth.islogout, (req, res) => {
    res.render("E:/software/we&css/form/tepleats/views/login.hbs");
});


// methord:1
app.get("/logout", auth.authentiction, async (req, res) => {
    try {
        req.User.tokens = req.User.tokens.filter((currentElement) => {
            return currentElement.token !== req.token
        })
        res.clearCookie('loginjwt');
        console.log("logout is done and token remove ...");

        await req.User.save();

        //destroyno matlab aglna all data ne clean karva mate thay che 
        req.session.destroy();
        res.redirect("/views/login");

    } catch (error) {
        res.status(401).send(error);
    }
});

// methord:2//a methord no use old token ne bhi remove karva thay che 
// app.get("/logout", auth ,async(req,res)=>{
//     try {
//         console.log(res.User);
//         //currelemt token ne logout ni harej remove karva mate thay che 
//         res.clearCookie("loginjwt");
//         req.User.tokens=[];
//         await req.User.save();
//         res.render("login");
//     } catch (error) {
//         res.status(401).send(error);
//     }
// });


// const securePassword = async(password)=>{
//     try {
//         const passwordHash = await bcrypt.hash(password, 10);
//         return passwordHash;
//     } catch (error) {
//     console.log(error.message);
//     }
// }

//ragister prossec
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
                is_verified: 0,
            });

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

            if (ragistered) {
                SendEmail(req.body.Firstname, req.body.Lastname, req.body.Email, ragistered._id);
                //ragistered._id no use uepna deta save kare atyare je unic id save thay te hoy che 
                res.render("E:/software/we&css/form/tepleats/views/login.hbs", { message: "your sucsessfulliy ragistered, palse verify your mail..." });
            } else {
                res.render("E:/software/we&css/form/tepleats/views/ragistar.hbs", { message: "your not ragistered,palse chack your deteils..." });
            }

        } else {//javascript vapro to remove
            res.status(400).send("Inveild deteils");//javascript vapro to remove
        }//javascript vapro to remove
    } catch (error) {
        res.status(401).send(error);
    }
});

//send mail prosses
const SendEmail = async (Firstname, Lastname, Email, Registrar_id) => {
    try {
        const transporter = nodemailer.createTransport(smtpTransport({
            service: "Gmail",
            port: 587,
            secure: true,
            tls: {
                rejectUnauthorized: true
            },
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        }));

        const malioptions = {
            from: "akash.vasaniya7055@gmail.com",
            to: Email,
            subject: "for verification mail...",
            html: '<p>hi... <br>' + Firstname + Lastname + ',plese click here to <a href="http://localhost:8000/verify?id=' + Registrar_id + '"> verify </a> your mail.</p>',
        };

        transporter.sendMail(malioptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info.response);
            }
        });

    } catch (error) {
        console.log(error)
    }
}

app.post("/login", async (req, res) => {
    try {

        const Email = req.body.Email;
        const Password = req.body.Password;

        const resultemail = await Registrar.findOne({ Email: Email }); //ek email collection decument and uper nu class

        //creat jwt a token 
        const tokenlog = await resultemail.generateAuthToken();
        // console.log("the login parth:- " + tokenlog);

        // methord-1
        // //creat tooken kara pachi show kara va mate token name and ganret thayel id
        // res.cookie("loginjwt", tokenlog);

        //apnu cookie male ayre tene ketlo time rakh vu che te na mate expires no use
        res.cookie('loginjwt', tokenlog, {
            expires: new Date(Date.now() + 60000000),
            httpOnly: true
            // secure:true
        });


        //     const isMatch = await bcrypt.compare(Password, resultemail.Password);
        //     if (isMatch) {
        //         res.status(201).render("index");
        //     } else {
        //         res.send("Inveild password deteils");
        //     }
        // }

        if (resultemail) {

            const passwordchack = await bcrypt.compare(Password, resultemail.Password);

            if (passwordchack) {

                if (resultemail.is_verified == 0) {
                    res.render("E:/software/we&css/form/tepleats/views/login.hbs", { message: "please verify your mail..." });
                } else {

                    req.session.user_id = resultemail._id;
                    res.redirect("login");

                }
            } else {
                res.render("E:/software/we&css/form/tepleats/views/login.hbs", { message: "Email and password are incorrect pls chack detalis.." });
            }
        } else {
            res.render("E:/software/we&css/form/tepleats/views/login.hbs", { message: "Email and password are incorrect pls chack detalis.." });
        }
    } catch (error) {
        // res.status(401).send('Inveild Login deteils');
        console.log(error);
    }
});

//verfylgin methord  ne akhu post login add kerelu che

// const verifylogin = async (req, res) => {
//     try {

//         const Email = req.body.Email;
//         const Password = req.body.Password;

//         //email and password chack karva mate ni condicthion 
//         const userdata = await Registrar.findOne({ Email: Email })

//         if (userdata) {

//             const passwordchack = await bcrypt.compare(Password,userdata.Password);

//             if (passwordchack) {

//                 if (userdata.is_verified === 1) {
//                     res.render("login", { message: "please verifyd your mail..." });
//                 } else {
//                     res.redirect("/");
//                     // res.render("/");
//                 }
//             } else {
//                 res.render("login", {message: "Email and password are incorrect pls chack detalis.." });
//             }

//         } else {
//             res.render("login", { message: "Email and password are incorrect pls chack detalis.." });
//         }

//     } catch (error) {
//         res.status(401).send(error);
//     }
// }



//reset password to email prosses

const sendMailtopassword = async (Firstname, Lastname, Email, emailtoken) => {
    try {
        const transporter = nodemailer.createTransport(smtpTransport({
            service: "Gmail",
            port: 587,
            secure: true,
            tls: {
                rejectUnauthorized: true
            },
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        }));

        const malioptions = {
            from: process.env.EMAIL_USER,
            to: Email,
            subject: "for reset password...",
            html: '<p>hi... <br>' + Firstname + Lastname + ',plese click here to <a href="http://localhost:8000/newpassword?emailtoken=' + emailtoken + '"> reset  </a> your password..</p>',
        };

        transporter.sendMail(malioptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}

app.post("/forgot", async (req, res) => {
    try {

        const Email = req.body.Email;

        const userdeta = await Registrar.findOne({ Email: Email });
        if (userdeta) {
            if (userdeta.is_verified == 0) {
                res.render("E:/software/we&css/form/tepleats/views/forgot.hbs", { message: "ple verify your mail.." });
            } else {
                const randomString = randomstring.generate();
                const userinfo = await Registrar.updateOne({ Email: Email }, { $set: { emailtoken: randomString } });
                sendMailtopassword(userdeta.Firstname, userdeta.Lastname, userdeta.Email, randomString);
                res.render("E:/software/we&css/form/tepleats/views/forgot.hbs", { message: "pls chack your mail and reset your password.." });
            }
        } else {
            res.render("E:/software/we&css/form/tepleats/views/forgot.hbs", { message: "email address are incoreat.." });
        }
    } catch (error) {
        console.log(error.message);
    }
});




//forget password ma password change thase nahi error che 
app.post("/newpassword", async (req, res) => {
    try {
        // new password add karva mate thay che 
        const id = req.body.registrar_id;
        const Password = req.body.password;

        const updeteddeta = await Registrar.findByIdAndUpdate({ _id: id }, { $set: { Password: Password, emailtoken: " " } });

        if (updeteddeta) {
            res.render("E:/software/we&css/form/tepleats/views/login.hbs");
        } else {
            res.redirect("E:/software/we&css/form/tepleats/views/newpassword.hbs");
        }
    } catch (error) {
        console.log(error.message);
    }
});



//verification maile post
app.post("/verifictionmail", async (req, res) => {
    try {

        const Email = req.body.Email;

        const ragistered = await Registrar.findOne({ Email: Email });
        if (ragistered) {

            SendEmail(req.body.Firstname, req.body.Lastname, req.body.Email, ragistered._id);
            res.render("E:/software/we&css/form/tepleats/views/verifictionmail.hbs", { message: "pleasa verify your mail..." })

        } else {
            res.render("E:/software/we&css/form/tepleats/views/verifictionmail.hbs", { message: "email are not velid.." })
        }

    } catch (error) {
        console.log(error.message);
    }

});

//multer koy bhi file upload kar ma te use thay che 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/pic'), function (error, sucsess) {
            if (error) throw error
        });
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name, function (error1, sucsess1) {
            if (error) throw error
        })
    }
})

const upload = multer({ storage: storage });



app.post("/contect", upload.single("myfiles"), async (req, res) => {
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
            myfiles: req.file.myfiles,
            Message: req.body.Message
        })

        console.log("the sucsess prth" + contectstudent);


        //creat jwt a token 
        const cotoken = await contectstudent.generateAuthToken();
        console.log("the token prth" + cotoken);

        res.cookie("jwt", cotoken, {
            expires: new Date(Date.now()),
            httpOnly: true
        });

        // console.log(cookie);

        const contectu = await contectstudent.save();

        console.log("the page prth" + contectu);
        res.status(201).render("E:/software/we&css/form/tepleats/views/index.hbs");

    } catch (error) {
        res.status(401).send(error);
        console.log(error);
    }
});


//Admin penal

//login admin 
app.get("/admin/login", adminauth.islogoutadmin, async (req, res) => {

    try {

        res.render("E:/software/we&css/form/tepleats/views/admin/login.hbs");

    } catch (error) {
        console.log(error.message);
    }
});


app.post("/admin/login", async (req, res) => {

    try {

        const Email = req.body.Email;
        const Password = req.body.Password;


        const userdata = await Registrar.findOne({ Email: Email });
        // const tokenlogadmin = await userdata.generateAuthToken();
        // //apnu cookie male ayre tene ketlo time rakh vu che te na mate expires no use
        // res.cookie('loginjwt', tokenlogadmin, {
        //     expires: new Date(Date.now() + 600),
        //     httpOnly: true
        //     // secure:true
        // });

        if (userdata) {

            const userpass = await bcrypt.compare(Password, userdata.Password);//(password,userdata.password) userdata.password hoy te hesh password hoy che fast password hoy te user password hoy che  

            if (userpass) {

                if (userdata.is_admin == 0) {

                    res.render("E:/software/we&css/form/tepleats/views/admin/login.hbs", { message: "login id and password invelid.." });

                } else {

                    req.session.user_id = userdata._id;
                    res.redirect("/admin/home");

                }

            } else {
                res.render("E:/software/we&css/form/tepleats/views/admin/login.hbs", { message: "login id and password invelid.." });
            }

        } else {
            res.render("E:/software/we&css/form/tepleats/views/admin/login.hbs", { message: "login id and password invelid.." });
        }
    } catch (error) {
        console.log(error.message);
    }
});

//reset password to email prosses

const sendrestpasswordadmin = async (Firstname, Lastname, Email, emailtoken) => {
    try {
        const transporter = nodemailer.createTransport(smtpTransport({
            service: "Gmail",
            port: 587,
            secure: true,
            tls: {
                rejectUnauthorized: true
            },
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        }));

        const malioptions = {
            from: process.env.EMAIL_USER,
            to: Email,
            subject: "for reset password...",
            html: '<h1>wlcome,' + Firstname + `&nbsp;` + Lastname + ', </h1><p>hi... <br>' + Firstname + Lastname + ',<br>&nbsp;&nbsp;&nbsp;plese click here to <a href="http://localhost:8000/admin/new-password?emailtoken=' + emailtoken + '"> reset  </a> your password for admin only...</p>',
        };

        transporter.sendMail(malioptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}

app.get("/admin/forget", adminauth.islogoutadmin, async (req, res) => {
    try {
        res.render("E:/form/tepleats/views/admin/forget.hbs");
    } catch (error) {
        console.log(error.message);
    }

});

app.post("/admin/forget", async (req, res) => {
    try {

        const Email = req.body.Email;

        const userdeta = await Registrar.findOne({ Email: Email });
        if (userdeta) {

            if (userdeta.is_admin == 0) {
                res.render("E:/form/tepleats/views/admin/forget.hbs", { message: "email is incorrect..." });
            } else {
                const randomString = randomstring.generate();
                const userinfo = await Registrar.updateOne({ Email: Email }, { $set: { emailtoken: randomString } });
                sendrestpasswordadmin(userdeta.Firstname, userdeta.Lastname, userdeta.Email, randomString);
                res.render("E:/form/tepleats/views/admin/forget.hbs", { message: "pls chack your mail and reset your password.." });
            }
        } else {
            res.render("E:/form/tepleats/views/admin/forget.hbs", { message: "email is incorrect..." });
        }

    } catch (error) {
        console.log(error.message);
    }
});



app.get("/admin/new-password", adminauth.islogoutadmin, async (req, res) => {

    try {
        const emailtoken = req.query.emailtoken;

        const tokenmach = await Registrar.findOne({ emailtoken: emailtoken });

        if (tokenmach) {
            res.render("E:/form/tepleats/views/admin/new-password.hbs", { user_id: tokenmach._id });
        } else {
            res.render("admin/404", { message: "link is only one time use..." });
        }

    } catch (error) {
        console.log(error.message);
    }

});

//password hash karva
const securePassword = async (Password) => {
    try {
        const passwordHash = await bcrypt.hash(password, process.env.BCRYPT_SALT);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

app.post("/admin/new-password", async (req, res) => {

    try {

        const user_id = req.body.user_id;
        const Password = req.body.Password;

        // const securePass = await securePassword(Password);

        const userdata = await Registrar.findByIdAndUpdate({ _id: user_id }, { $set: { Password: Password, emailtoken: '' } });

        res.redirect("/admin/login");

    } catch (error) {
        console.log(error.message);
    }

});


app.get("/admin/logut", async (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/admin/login");
    } catch (error) {
        console.log(error.message);
    }

});

//home admin
app.get("/admin/home", adminauth.isloginadmin, async (req, res) => {
    try {

        const userdatas = await Registrar.findById({ _id: req.session.user_id });
        // erro by :- ast to ObjectId failed for value "{ _id: undefined }" (type Object) at path "_id" for model "Registrar"

        res.render("E:/software/we&css/form/tepleats/views/admin/home.hbs", { admin: userdatas });

    } catch (error) {
        console.log(error.message);
    }

});

app.get("/admin/dashboard", adminauth.isloginadmin, async (req, res) => {
    try {
        const userdeta = await Registrar.find({ is_admin: '0' });//find ma badha deta show kare che 
        if (userdeta) {

            res.render("E:/software/we&css/form/tepleats/views/admin/dashboard.ejs", { users: userdeta });

        }

    } catch (error) {
        console.log(error.message);
    }
});


app.get("/admin/adduser", async (req, res) => {
    try {
        res.render("E:/software/we&css/form/tepleats/views/admin/adduser.ejs");
    } catch (error) {
        console.log(error.message);
    }
});


//send mail prosses
const adminnewusersend = async (Firstname, Lastname, Email, Password, Registrar_id) => {
    try {
        const transporter = nodemailer.createTransport(smtpTransport({
            service: "Gmail",
            port: 587,
            secure: true,
            tls: {
                rejectUnauthorized: true
            },
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        }));

        const malioptions = {
            from: "akash.vasaniya7055@gmail.com",
            to: Email,
            subject: "Admin Add User for verification mail...",
            html: '<p>hi... <br>' + Firstname + Lastname + ',plese click here to <a href="http://localhost:8000/verify?id=' + Registrar_id + '"> verify </a> your mail.</p> <br><br> <b> Email:-</b> ' + Email + '<br><b> Password:-</b> ' + Password + ''
        };

        transporter.sendMail(malioptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info.response);
            }
        });

    } catch (error) {
        console.log(error)
    }
}

app.post("/admin/adduser", async (req, res) => {
    try {

        const Firstname = req.body.Firstname;
        const Lastname = req.body.Lastname;
        const gender = req.body.gender;
        const Email = req.body.Email;
        const ContectNumber = req.body.ContectNumber;
        const Password = randomstring.generate(8);

        // const securePass = securePassword(Password);

        const user = new Registrar({
            Firstname: Firstname,
            Lastname: Lastname,
            gender: gender,
            Email: Email,
            ContectNumber: ContectNumber,
            Password: Password,
            is_admin: 0,
        });

        const userdeta = await user.save();

        if (userdeta) {
            adminnewusersend(Firstname, Lastname, Email, Password, userdeta._id);
            res.redirect("/admin/dashboard");

        } else {
            res.render("/admin/adduser", { message: "smthoing worng!!" });
        }

    } catch (error) {
        console.log(error.message);
    }
});

app.get("/admin/edituser", async (req, res) => {
    try {
        const id = req.query.id;
        const userdata = await Registrar.findById({ _id: id });
        if (userdata) {
            res.render("E:/software/we&css/form/tepleats/views/admin/edituser.ejs", { users: userdata });
        } else {
            res.redirect("/admin/dashboard");
        }
        // res.render("E:/software/we&css/form/tepleats/views/admin/edituser.ejs");
    } catch (error) {
        console.log(error.message);
    }
})


app.post("/admin/edituser", async (req, res) => {
    try {
        //req.body.id ne edituser.ejs ma thi leva ma avi che 
        const userupdeat = await Registrar.findByIdAndUpdate({ _id: req.body.id },
            {
                $set: {
                    Firstname: req.body.Firstname,
                    Lastname: req.body.Lastname,
                    Email: req.body.Email,
                    gender: req.body.gender,
                    ContectNumber: req.body.ContectNumber,
                    is_verified: req.body.is_verified
                }
            });
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.log(error.message);
    }
})

// delete user by admin
app.get("/admin/delete", async (req, res) => {
    try {
        const id=req.query.id;
        await Registrar.deleteOne({ _id:id });

        res.redirect("/admin/dashboard");

    } catch (error) {
        console.log(error.message);
    }
});

app.get("/admin/export-user", async (req, res) => {
    try {

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('User list');

        worksheet.columns = [
            { key: 'Firstname', header: 'Firstname' , width: 15},//key atle conctions ma hoy tej nakh vani rese baki error avse 
            { key: 'Lastname', header: 'Lastname', width: 15},
            { key: 'gender', header: 'gender' , width: 10},
            { key: 'Email', header: 'Email' , width: 30},
            { key: 'ContectNumber', header: 'ContectNumber' , width: 20},
            { key: 'is_verified', header: 'Verification' , width: 10},
            // { key: 'is_admin', header: 'admin' , width: 10},
        ]

        const userdeta = await Registrar.find({ is_admin: 0 });

        userdeta.forEach((user) => {
            worksheet.addRow(user);
        });

        //getRow and eachCell colemas ne dising karva mate thay che 
        worksheet.getRow(1).eachCell((cell)=>{
            cell.font = {
                size:12,
                bold:true
            };
            cell.color = {theme:'8DB4E2'};
        })

        //file ne donwlode karava mate thay che 
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "user.xlsx"
        );

        //file send karine damlord karva mate thay che 
        return workbook.xlsx.write(res)
            .then(() => {
                res.status(201);
                console.log("saved");
            });

    } catch (error) {
        console.log(error.message);
    }
});

//export in user pdf
app.get("/admin/exportuserpdf",async(req,res)=>{
    try {

        const usersd = await Registrar.find({is_admin:0});
        const userdeta={
            users:usersd
        }

        const filepath = path.resolve(__dirname , "E:/software/we&css/form/tepleats/views/admin/exportuserpdf.ejs");
        console.log(filepath);
        const htmlstring = fs.readFileSync(filepath).toString(); //html mathi string ma convert kara vamate 
        let options={
                format:"A3" //page size in pdf
        }
        const ejsdeta = ejs.render(htmlstring,userdeta);
        pdf.create(ejsdeta,options).toFile("user.pdf",(error,res) => {
            if (error) {
                console.log(error);
                // res.redirect("E:/software/we&css/form/tepleats/views/admin/dashboard.ejs",{message:"file gantereted now...."});
            }
         const filepath =path.join(__dirname,"../user.pdf");
         fs.readFile(filepath,(error,file)=>{
            if(error){
                console.log(error);
                return res.status(501).send("culod not set file...");
            }

            res .setHeader ('Content-Type','application/pdf');
            res.setHeader ('Content-Disposition','attachment ; filename= "users.pdf"');
            
            res.send(file);
        })
        
        });
    } catch (error) {
        console.log(error.message);
    }
});


app.get("*", function (req, res) {

    res.redirect("/admin/login");

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