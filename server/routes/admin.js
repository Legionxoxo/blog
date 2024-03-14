const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const multer = require('multer')
//setting up the multer engine  
const storage = multer.diskStorage({})
const upload = multer({ storage: storage })


const {
  uploadToCloudinary,
  removeFromCloudinary,
} = require("../cloudinary/cloudinary");


const adminLayout = '../views/layouts/admin';

const jwtSecret=process.env.JWT_SECRET; 


/* Check login */
const authMiddleware = (req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.redirect('admin/login');
    }
    try {
        const decoded = jwt.verify(token,jwtSecret);
        req.userId= decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({message: 'Unauthorised'});
        
    }
}


/* GET ROUTE*/

router.get('/admin', async (req,res) => { 
    try{
    const locals= {
        title : "Admin",
        description :" A Simple blog"
    }
    res.render('admin/login', {locals});
    } catch(error){
    console.log(error);
    } 
});

/* LOGIN PAGE */
 
router.post('/admin', async (req, res) => {
       try {
        const { username, password } = req.body;
        const user= await  User.findOne({username});
        if(!user){
            res.redirect('/');
            /* REDIRECT TO SIGNUP PAGE */

            return res.status(401).json({message:'Invalid Credentials'});
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            /* REDIRECT TO LOGIN PAGE WITH MESSAGE  */
            return res.status(401).json({message:'Invalid Credentials'});
        }
        const token = jwt.sign({userId:user._id},jwtSecret);
        res.cookie('token',token,{httpOnly:true});

        res.redirect('/dashboard');
    
       } catch (error) {
         console.log(error);
       }
     });
    
/* ADMIN DASHBOARD */

router.get('/dashboard',authMiddleware, async (req,res) =>{
  try {
   const locals={
      title:"Dashboard",
      description:"A simple blog"
    }
    const data= await Post.find();
    res.render('admin/dashboard',
    {locals,
      layout:adminLayout,
    data});
    
  } catch (error) {
    cons9ole.log(error);
    
  }
    
});     



/* ADD POST PAGE */

router.get('/add-posts',authMiddleware, async (req,res) =>{
  try {
   const locals={
      title:"Add Post",
      description:"A simple blog"
    }
    const data= await Post.find();
    res.render('admin/add-posts',
    {locals,
    layout:adminLayout,
    data
  });
  } catch (error) {
    cons9ole.log(error);
  }
});     


/* CREATE NEW POST */

router.post('/add-posts', authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body
    });

    const createdPost = await Post.create(newPost);

    const data = await uploadToCloudinary(req.file.path, "user-images");

    
    const updatedPost = await Post.findOneAndUpdate(
      { _id: createdPost._id },
      {
        $set: {
          imageUrl: data.url,
          publicId: data.public_id,
        },
      },
      { new: true } 
    );

/*     console.log('Created Post ID:', createdPost._id);
    console.log('Cloudinary Upload Result:', data);
    console.log('Updated Post:', updatedPost);
 */
    
    if (updatedPost) {
      console.log('Post updated successfully.');
    } else {
      console.log('No post was updated. Check if the post with the given ID exists.');
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



/* EDIT POST GET */
router.get('/edit-post/:id',authMiddleware, async (req,res) =>{
  try {
    const locals={
      title:"Edit posts",
      description:"A simple blog"
    }
 const data=await Post.findOne({_id:req.params.id});
 res.render('admin/edit-post',{
  data,
  locals,
  layout:adminLayout
 })
  } catch (error) {
    cons9ole.log(error);
  }
});  

/* EDIT POST */

router.put('/edit-post/:id',authMiddleware, async (req,res) =>{
  try {
 await Post.findByIdAndUpdate(req.params.id,{
  title:req.body.title,
  body:req.body.body,
  updatedAt: Date.now()
 });
 res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    cons9ole.log(error);
  }
});   


/* DELETE POSTS AND ASSOCIATED IMAGE */

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    // Fetch post data to get associated image's publicId
    const post = await Post.findOne({ _id: req.params.id });
    
    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Delete the post
    await Post.deleteOne({ _id: req.params.id });

    // If the post has an associated image, delete it from Cloudinary and the Database
    if (post.imageUrl && post.publicId) {
      await removeFromCloudinary(post.publicId);

      // Update the User (or whatever model you are using) to remove image details
      await User.updateOne(
        { _id: req.params.id },
        {
          $set: {
            imageUrl: "",
            publicId: "",
          },
        }
      );
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
})

/* LOGOUT GET */

router.get('/logout',(req,res)=>{
  res.clearCookie('token');
  res.redirect('/');
});


    
    /**
     * POST /
     * Admin - Register
    */
    /* router.post('/register', async (req, res) => {
      try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
    
        try {
          const user = await User.create({ username, password:hashedPassword });
          res.status(201).json({ message: 'User Created', user });
        } catch (error) {
          if(error.code === 11000) {
            res.status(409).json({ message: 'User already in use'});
          }
          res.status(500).json({ message: 'Internal server error'});
        }
    
      } catch (error) {
        console.log(error);
      }
    });
  */

/* DELETE IMAGE */




module.exports= router;