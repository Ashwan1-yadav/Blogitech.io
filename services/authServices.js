const JWT = require("jsonwebtoken")

const secret = "$46537jabd^$%^*&%"

function createToken(user){
   const payload  = {
      id : user._id,
      fullname : user.fullname,
      email : user.email,
      profileImage : user.profileImage,
      role : user.role
   }
   const token = JWT.sign(payload,secret)
   return token
} 

function validateToken(token) {
    const payload = JWT.verify(token,secret)
    return payload;
}

module.exports = {
    createToken,
    validateToken
}

