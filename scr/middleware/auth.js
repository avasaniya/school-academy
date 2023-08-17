const jwt = require("jsonwebtoken");
const Registrar = require("../model/registrar");


const auth = async (req, res, next) => {
    try {
        const token= req.cookies.jwt;  //token no use collection ma Schema ma set karel che te che 
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        console.log(verifyUser);

        // const User=await Registrar.findOne({_id:verifyUser._id})
        // console.log(User,Firstname);

        // req.token=token;
        // req.User=User;

        next();

    } catch (error) {
        res.status(401).send(error);
    }
}

module.exports=auth;