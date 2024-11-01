const mongoose = require("mongoose");
const {createHmac,randomBytes} = require("crypto");
const { createToken } = require("../services/authServices");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "/images/defaultProfileImage.png",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save",function (next){
    const user = this;
    if(!user.isModified("password")) return;
    const salt = randomBytes(16).toString()
    const hashedPassword = createHmac("sha256",salt).update(user.password).digest("hex")

    this.salt = salt
    this.password = hashedPassword
    next()
})

userSchema.static("verifyPassAndcreateToken",async function (email,password){
  const user = await this.findOne({email})
  if(!user) throw new Error("User not Found") 

  const salt = user.salt
  const hashedPassword = user.password
  const userPassHash = createHmac("sha256",salt).update(password).digest("hex")

  if(hashedPassword !== userPassHash) throw new Error("Password is incorrect")

  const token = createToken(user)

  return token
})

const userModel  = mongoose.model("user",userSchema)

module.exports = userModel
