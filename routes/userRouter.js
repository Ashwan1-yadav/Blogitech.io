const { Router } = require("express");
const router = Router();

const userModel = require("../models/userModel");

router.get("/signup", (req, res) => {
  res.render("register");
});

router.get("/signin", (req, res) => {
  res.render("login");
});

router.get("/logout", (req, res) => {
  res.clearCookie("cookie").redirect("/");
});

router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({email})
    if (existingUser) {
      res.render("register",{error : "user already registered"})
    }
    const user = new userModel({fullname,email,password})
    await user.save();
    res.render("register",{ message : "User registered successfully please login"});
  } catch (e) {
    res.render("register",{
      error : "All fields are required",
    })
  }
 
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const verifiedUser = await userModel.verifyPassAndcreateToken(
      email,
      password
    );
    res.cookie("cookie", verifiedUser).redirect("/blog/createblog");
  } catch (error) {
    res.render("login", { error: "Incorrect Username or Password" });
  }
});

module.exports = router;
