const express = require('express');
const router = express.Router();
const Post = require('../models/post');

const locals= {
    title : "MITS pyqs",
    description :" A Simple blog",
}

router.get('', async (req,res) => { 
    try{
    const locals= {
        title : "MITS pyqs",
        description :" A Simple blog",
    }
    let perPage = 10;
    let page = req.query.page || 1;
    const data = await Post.aggregate([{ $sort:{createdAt:-1}}])
    .skip(perPage*page - perPage)
    .limit(perPage)
    .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page)+1;
    const hasNextPage = nextPage <= Math.ceil(count/perPage);

       res.render('index', 
        {locals,
        data,
        current:page,
        
        nextPage: hasNextPage ? nextPage : null
    });

    } catch(error){
    console.log(error);
    } 
});



router.get('/post/:id',async (req,res) => {
    try{
        const locals= {
            title : "MITS pyqs",
            description :" A Simple blog",
        }
        let slug = req.params.id;
        const data = await Post.findById({_id:slug});
        res.render('post',{locals,data});
    }catch(error){
        console.log(error);
    }
});

router.post('/search', async (req, res) => {
    try {
      const locals = {
        title: "Seach",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
     /*  let searchTerm = req.body.searchTerm;
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "") */
  
      const data = await Post.find({
        $or: [
          { title: { $regex: new RegExp(req.body, 'i') }},
          { body: { $regex: new RegExp(req.body, 'i') }}
        ]
      });
  
      res.render("search", {
        data,
        locals,
        currentRoute: '/'
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });

router.get('/about',(req,res) => { 
    res.render('about',{locals});
});

router.get('/contact',(req,res) => { 
    res.render('contact',{locals});
});

router.get('/admin/login',(req,res) => { 
  res.render('admin/login',{locals});
});





module.exports = router;

/*function insertPostData(){
    Post.insertMany([
        {
            title:"My first blog",
            body: "Testing it now !!!"
        },
        {
            title:"My second blog",
            body: "Testing it now !!!"
        },
    ])
}
insertPostData(); */

