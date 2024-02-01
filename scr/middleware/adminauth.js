
//admin mate nu authentiction che

const isloginadmin = async (req, res, next) => {
    try {

        if (req.session.user_id) {
         }
        else {
            res.redirect("/admin/login");
        }
        next();
    } catch (error) {
        console.log(error.massage);
    }
}


const islogoutadmin = async (req, res, next) => {
    try {

        if (req.session.user_id) {
            res.redirect("/admin/home");
        }
        next();

    } catch (error) {
        console.log(error.massage);
    }
}


module.exports={
    isloginadmin,
    islogoutadmin
};