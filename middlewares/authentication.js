const { validateToken } = require("../services/authServices")

function checkForAuthenticationCookie(cookie){
   return (req,res,next) => {
    const tokenCookieVal = req.cookies.cookie
    if (!tokenCookieVal) {
       return next()
    }
    try {
        const payload = validateToken(tokenCookieVal)
        req.user = payload
    } catch (error) {res.render("login",{error : "Login In first"})}
    return next()
   }
}

module.exports = {
    checkForAuthenticationCookie
}