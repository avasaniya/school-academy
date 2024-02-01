const jwt = require("jsonwebtoken");
const Registrar = require("../model/registrar");


const authentiction=async (req, res, next) => {
    try {
        const token = req.cookies.loginjwt;  //token no use collection ma Schema ma set karel che te che 

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyUser);

        const User = await Registrar.findOne({ _id: verifyUser._id })
        console.log(User.Firstname);

        req.token = token;
        req.User = User;

        next();

    } catch (error) {
        res.status(401).send(error);
    }
}


const islogin = async (req, res, next) => {
    try {

        if (req.session.user_id) {
         }
        else {
            res.redirect("/login");
        }
        next();
    } catch (error) {
        console.log(error.massage);
    }
}


const islogout = async (req, res, next) => {
    try {

        if (req.session.user_id) {
            res.redirect("/");
        }
        next();

    } catch (error) {
        console.log(error.massage);
    }
}


module.exports = {
    authentiction,
    islogin,
    islogout,
};    