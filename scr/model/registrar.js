const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

const schoolacademy = new mongoose.Schema({
    Firstname:{
        type:String,
        require:true
    },
    Lastname:{
        type:String,
        require:true
    },
    gender:{
        type:String,
        require:true
    },
    Email:{
        type:String,
        require:true,
        unique:true

    },
    ContectNumber:{
        type:Number,
        require:true,
        min: [10, 'minimum 10 number required'],
        unique:true
    },
    Password:{
        type:String,
        require:true
    },
    ConfirmPassword:{
        type:String,
        require:true
    },
    tokens:[{
        token:{
            type:String,
            require:true 
        }
    }]
});

//generating token jesonwebtoken
schoolacademy.methods.generateAuthToken = async function(){
    try {
        console.log("collection id :- "+this._id);//this keyword no use id pachina jetla document hoy tene show karva mate use thay che 
        const cetoken=await jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:cetoken});
        await this.save();
        return cetoken;
    } catch (error) {
        res.send("this is parth error" + (error));
        console.log("this is parth error" + (error));
    }
}


//Secure Registration System Password with BcryptJS 
schoolacademy.pre("save",async function(next){
    if(this.isModified("Password")){
        this.Password = await bcrypt.hash(this.Password,10);
        this.ConfirmPassword = await bcrypt.hash(this.Password,10);
    }
    next();
})

const Registrar = new mongoose.model("Registrar",schoolacademy);

module.exports = Registrar;
