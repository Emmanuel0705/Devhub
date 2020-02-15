const express = require('express');
const auth = require('../../middleware/auth')
const router = express.Router()
const User = require('../../model/User')
const {check, validationResult} = require('express-validator');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//authenticacation
router.get('/',auth, async (req,res) =>{
	try{
		const user = await User.findById(req.user.id).select('-password');
        res.json(user)
	}catch(err){
		console.log(err.message)
		res.status(500).send('server error')
	}
   
})
//user Login validation
router.post('/',
	[
	check("email","Please Input A Valid Email").isEmail(),
	check("password","Password Require").exists()
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
	  if(!user){
	  	return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]})
	  }
	  
	  //decrypt password
	  const Isvalid = await bycrypt.compare(password,user.password);
	  if(!Isvalid){
	  	return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]})
	  }
	  //jwt
	  const payload = {
	  	user: {
	  		id:user.id
	  	}
	  }
	  jwt.sign(payload,config.get('jwtSecret'),{expiresIn: 36000000},(err,token)=>{
	  		if(err) throw err;
	  		res.json({token});
	  	})

	  }catch(err){
	  	console.log(err.message)
	  	return res.status(500).send('Server Srror')
	  }
	
})


module.exports = router;