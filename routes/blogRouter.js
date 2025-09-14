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
  const image = req.file;
  if (!image) {
    return res.render("blogpost", { error: "Please upload a cover image" });
  }
  if (!title || !blogDesc) {
    return res.render("blogpost", { error: "All fields are required" });
  } 
  const blog = await blogModel.create({
    title,
    blogDesc,
    createdBy: req.user.id,
    coverImageUrl: `/images/uploads/${req.file.filename}`,
  });
  res.redirect(`/blog/${blog._id}`);
});

router.get('/blogs/allblogs',async (req, res) => {
  try {
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
 
    res.render('blogsPage', { 
      user: user,
      blogs: blogs,
      title: 'All Blogs - Blogitech.io'
    });

  } catch (error) {
    return res.status(500).render('errorPage', { 
      message: 'Something went wrong while fetching blogs',
      user: null 
    });
  }
});

module.exports = router;
