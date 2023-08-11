const mongoose=require("mongoose");

mongoose
.connect("mongodb://127.0.0.1:27017/schoolacademyform")
.then(()=>{
    console.log("detabase conection done..")
})
.catch((e) =>{
    console.log("not conection done.....")
});