const express = require('express');
const {check, validationResult} = require('express-validator');
const gravatar = require('gravatar');
const User = require('../../model/User')
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const router = express.Router()
//route -> api/users
router.post('/',
	[
	check("name","Name is Require").not().isEmpty(),
	check("email","Please Input A Valid Email").isEmail(),
	check("password","Password Must Not Less Than 6 Character").isLength({min:6})
	],
	async (req,res)=> {
	  const errors = validationResult(req);
	  if(!errors.isEmpty()){
	  	return res.status(400).json({errors:errors.array()})
	  }
	  const {email,name,password} = req.body
	  try{
	  	//check if email does not exit
	  	let user = await User.findOne({email})
	  if(user){
	  	return res.status(400).json({errors: [{msg: 'User Already Exits'}]})
	  }

       //get user avater with gravater
	  const avater = gravatar.url(email, {
	  	s: '200',
	  	d: "mm",
	  	r: 'pg'
	  })
	  user = new User({
	  	name,
	  	password,
	  	email,
	  	avater
	  })
	  //encrypt password
	  const salt = await bycrypt.genSalt(10);
	  user.password = await bycrypt.hash(password,salt)
	  //save user
	  await user.save();
	  //jwt
	  const payload = {
	  	user: {
	  		id:user.id
	  	}
	  }
	  jwt.sign(payload,config.get('jwtSecret'),{expiresIn: 36000},(err,token)=>{
	  		if(err) throw err;
	  		res.json({token});
	  	})

	  }catch(err){
	  	console.log(err.message)
	  	return res.status(500).send('Server Srror')
	  }
	
})

module.exports = router;