const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const blogModel = require("../models/blogModel");
const commentModel = require("../models/commentModel");
const { checkForAuthenticationCookie } = require("../middlewares/authentication");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/images/uploads"));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.get("/createblog", checkForAuthenticationCookie(), (req, res) => {
  res.render("blogpost", { user: req.user });
});

router.get("/:id", checkForAuthenticationCookie(), async (req, res) => {
  const blog = await blogModel.findById(req.params.id).populate("createdBy")
  const comments = await commentModel.find({ blogId : req.params.id}).populate("commentedBy")
  
  
  res.render("contentpage",{
    user : req.user,
    blog,
    comments
  })
})

router.post("/comment/:blogId",checkForAuthenticationCookie(),async (req,res)=>{
   await commentModel.create({
      content : req.body.content,
      blogId : req.params.blogId,
      commentedBy : req.user.id
  })
  res.redirect(`/blog/${req.params.blogId}`)
})

router.post("/createblog", checkForAuthenticationCookie(), upload.single("coverImageUrl"), async (req, res) => {
  const { title, blogDesc } = req.body;
  const blog = await blogModel.create({
    title,
    blogDesc,
    createdBy: req.user.id,
    coverImageUrl: `/images/uploads/${req.file.filename}`,
  });
  res.redirect(`/blog/${blog._id}`);
});

module.exports = router;
