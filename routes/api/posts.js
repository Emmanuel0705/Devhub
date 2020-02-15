const express = require('express');
const auth = require('../../middleware/auth');
const {check, validationResult } = require('express-validator');
const User = require('../../model/User')
const Post = require('../../model/Post')

const router = express.Router()
//create post
// ur/ api/post
router.post('/',[auth,[
	check("text","Post Content Required").not().isEmpty()
	]],
	async (req,res)=>{
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			return res.json({errors:errors.array()})
		}
		try{
			//get user details
           const user = await User.findOne({_id:req.user.id})
           .select("-password")
           
          const newPost = {
			text: req.body.text,
			user: req.user.id,
			avater: user.avater,
			name:user.name

		}
		const post = new Post(newPost);
		 await post.save();
		return res.json(post)
		}catch(err){
			console.log(err.message)
            return res.status(500).send("Server Error")
		}
	})
//get all post
 router.get('/', async (req,res) => {
 	try{
     const post = await Post.find().sort({date:-1});
     return res.json(post);
   }catch(err){
      console.log(err.message);
      return res.status(500).send("Server Error");
   }
 })
 //get single post
 router.get('/:id',async (req,res) => {
 	try{
 	const post = await Post.findById(req.params.id)
 	if(!post){
 		return res.status(400).json({msg:'Post Not Found'})
 	}
 	return res.json(post);
   }catch(err){
   	if(err.kind = 'ObjectId'){
   		return res.status(400).json({msg:'Post Not Found'});
   	}
      console.log(err.message);
      return res.status(500).send("Server Error");
   }
 })
 //delete post
router.delete('/:id',auth,async (req,res) => {
    try{
    	const post = await Post.findById(req.params.id);
    	if(!post){
    		return res.status(400).json({msg:'Post Not Found'});
    	}
    	if(post.user.toString() !== req.user.id){
    	  return res.status(401).json({msg:'User Not Authorized'});
    	}
        await post.remove(req.params.id)
        return res.json({msg:'Post Deleted'});
    }catch(err){
    	console.log(err.message);
      	if(err.kind = 'ObjectId'){
   		return res.status(400).json({msg:'Post Not Found'});
   	}
      
      return res.status(500).send("Server Error");
    }

})
//like post
router.put('/like/:id',auth,async (req,res) => {
  try{
     const post = await Post.findById(req.params.id);
     const user = await User.findById(req.user.id)
   if(!post){
   	  return res.json({msg:"something went wrong"})
   }
   const like = post.likes
   .filter(like => like.user.toString() === req.user.id)
   if(like.length > 0 ) {
     const likeind = post.likes.map(like => like.user.toString())
     .indexOf(req.user.id)
    post.likes.splice(likeind,1);
    await post.save()
    return res.json({msg:"Disliked"})
   }
   post.likes.unshift({user:req.user.id})
   await post.save()
   return res.json({msg:"liked"})

  }catch(err){
     console.log(err.message);
      return res.status(500).send("Server Error");
  }
})

router.post('/comment/:id',auth, async (req,res) => {
	
     try{
      const post = await Post.findById(req.params.id)
      const user = await User.findById(req.user.id)
	 const newComment = {
       text:req.body.text,
       name: user.name,
       avater: user.avater,
       user: req.user.id
     }
     post.comments.unshift(newComment)
     await post.save();
     return res.json(post);

	}catch(err){
      console.log(err.message);
      return res.status(500).send("Server Error");
	}
         
})
router.delete("/comment/:id/:comment_id",auth,async (req,res) =>{
	try{
		const post = await Post.findById(req.params.id);
		const comment = post.comments
		.find(comment => comment.id === req.params.comment_id)
		if(!comment){
			return res.status(404).json({msg:"Comment Not Found"})
		}
		if(comment.user.toString() !== req.user.id){
			return res.status(401).json({msg:"Unauthorized"})
		}
		const commentInd = post.comments.map(comment => comment.id.toString())
		.indexOf(req.params.comment_id)
		 post.comments.splice(commentInd,1)
		 await post.save()
		return res.json(post.comments)
	}catch(err){
      console.log(err.message);
      return res.status(500).send("Server Error");
	}
})


module.exports = router;