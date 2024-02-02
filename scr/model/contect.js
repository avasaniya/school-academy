const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");


const schoolcontect = new mongoose.Schema({
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
    dob:{
        type:String,
        require:true
    },
    address:{
        type:String,
        require:true
    },
    landmark:{
        type:String,
        require:true
    },
    pincode:{
        type:String,
        require:true,
        max:[5,'max 6 digit to pincord']
    },
    Email:{
        type:String,
        require:true,
    },
    ContectNumber:{
        type:String,
        require:true,
        max:[9, 'minimum 10 number required']
    },
    myfiles:{
        type:String,
        require:true
    },
    Message:{
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

schoolcontect.methods.generateAuthToken = async function(req,res){
    try {
        console.log("collection id :- "+this._id);//this keyword no use id pachina jetla document hoy tene show karva mate use thay che 
        const cotoken = await jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:cotoken});
        await this.save();
        return cotoken;
    } catch (error){
       res.send(error)
    }
};

const Contect = new mongoose.model("Contect",schoolcontect);

module.exports = Contect; 