const { Router } = require("express");
const router = Router();
const userModel = require("../models/userModel");
const blogModel = require("../models/blogModel");
const { checkForAuthenticationCookie } = require("../middlewares/authentication");
const { validateToken } = require("../services/authServices");

router.get("/signup", (req, res) => {
  res.render("register");
});

router.get("/", async (req, res) => {
  const tokenCookieVal = req.cookies?.cookie;
  let user = null;
  if (tokenCookieVal) {
    try {
      user = validateToken(tokenCookieVal);
    } catch (error) {
      user = null;
    }
  }
  const blogs = await blogModel.find({ createdBy: { $ne: null } })
  .populate('createdBy', 'fullname email profileImage')
  .sort({ createdAt: -1 })
  .lean();
  res.render("landingPage", { user: user, blogs: blogs });
});

router.get("/signin", (req, res) => {
  res.render("login");
});


router.get("/logout", checkForAuthenticationCookie(), (req, res) => {
  res.clearCookie("cookie").redirect("/");
});

router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "User already registered" });
    }

    const user = new userModel({ fullname, email, password });
    await user.save();

    return res.render("register", { message: "User registered successfully, please login" });
  } catch (e) {
    return res.render("register", {
      error: "All fields are required",
    });
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
