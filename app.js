require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8000;
const { databaseConnect } = require("./services/DBconnect");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const blogRouter = require("./routes/blogRouter");
databaseConnect(process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/blogspotio");

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/user", userRouter);
app.use("/blog", blogRouter);
app.use("/", userRouter);

const fs = require("fs");

const uploadPath = path.join(process.cwd(), "public/images/uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

app.listen(port);
