require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const { databaseConnect } = require("./services/DBconnect");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const blogRouter = require("./routes/blogRouter");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const blogModel = require("./models/blogModel");

databaseConnect(process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/blogspotio");

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("cookie"));
app.use("/user", userRouter);
app.use("/blog", blogRouter);

const fs = require("fs");

const uploadPath = path.join(process.cwd(), "public/images/uploads");

// Make sure directory exists before writing
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

app.get("/", async (req, res) => {
  const allblogs = await blogModel.find({});
  const blog = await blogModel.findById(req.params.id).populate("createdBy")
  const loggedInUser = req.user;
  res.render("landingPage", { user: loggedInUser, blogs: allblogs,blog:blog });
});

app.get("/blogpage", async (req, res) => {
  res.render("blogpage");
});

app.listen(port);
