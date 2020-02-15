const express = require('express');
const auth = require('../../middleware/auth')
const Profile = require('../../model/Profile')
const User = require('../../model/User')
const {check,validationResult} = require('express-validator');
const router = express.Router()
//desc@ get profile
//url@ api/profile/me

router.get('/me',auth,
	async (req,res) => {
		try{
		const profile = await Profile.findOne({user:req.user.id})
		.populate('users'['name','avater']);
		if(!profile){
			return res.status(400).json({msg:"Profile Not Found for this User"})
		}
		return res.json(profile)


		}catch(err){
			console.log(err.message)
			return res.status(500).send("Server Error");
		}
	})
//desc@ create profile and update
//url@ api/profile
router.post('/',[auth,[
	  check('skills',"Skill Is Required").not().isEmpty(),
	  check('status',"Status Is Required").not().isEmpty()
	]],
	async (req,res) => {
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			return res.json({errors:errors.array()})
		}
		
		const {
			skills,
			status,
			company,
			location,
			website,
			youtube,
			facebook,
			bio,
			github,
			likedin,
			twitter,
			instagram
		} = req.body
		//bulid profile object
		const profileFields= {}
		profileFields.user = req.user.id;
		if(company) profileFields.company = company
		if(website) profileFields.website = website
		if(location) profileFields.location = location
		if(bio) profileFields.bio = bio
		if(github) profileFields.githubusername = github
		if(status) profileFields.status = status
		if(skills){
			profileFields.skills = skills.split(',').map(skill => skill.trim())
		}

		profileFields.social = {};
		if(facebook) profileFields.social.facebook = facebook
		if(instagram) profileFields.social.instagram = instagram
		if(twitter) profileFields.social.twitter = twitter
		if(likedin) profileFields.social.likedin = likedin
		if(youtube) profileFields.social.youtube = youtube
		try{
			let profile = await Profile.findOne({user:req.user.id})
			if(profile){
               profile =  await Profile.findOneAndUpdate(
                	{user:req.user.id},
                	{$set: profileFields},
                	{new:true},
                );
               return res.json(profile)
			}
			profile = new Profile(profileFields);
			await profile.save();
			return res.json(profile);
		} catch(err){
          console.log(err.message)
          return res.status(500).json("Server Error")
		}

	})
//@desc fetch all profile
//request get api/profile/
router.get('/',
	async (req,res) => {
   try{
       const profile = await Profile.find().populate('user',['name','avater'])
       return res.json(profile);
   }catch(err){
   	console.log(err.message)
   	return res.status(500).send("Server Error")
   }
})
//des@ fetch individual user profile
//request get: api/profile/user/:id
router.get('/user/:id', async (req,res) => {
	try{
     const profile = await Profile.findOne({user: req.params.id})
     .populate('user',['name','avater'])
     if(!profile){
     	return res.status(400).json({msg: "profile Not Found"})
     }
     return res.json(profile)
    }catch(err){
    	console.log(err.message)
    	if(err.kind === 'ObjectId'){
    	  return res.status(400).json({msg: "profile Not Found"})
    	}
    	return res.status(500).send('Server Error')
    }
})
//delete user and profile 
router.delete('/',auth, async (req,res) => {
	try{
		//remove profile
		await Profile.findOneAndRemove({user:req.user.id})
		//remove user
		await User.findOneAndRemove({_id:req.user.id})
		return res.json({msg:"User Deleted"})
   }catch(err){
   	console.log(err.message)
   	return res.status(500).send('Server Error')
   }

})
//update user experience
router.put('/experience',[auth,[
	check("title","Title is required").not().isEmpty(),
	check("from","date from is required").not().isEmpty(),
	check("company","company name is required").not().isEmpty()
	]],async (req,res) => {
		const errors = validationResult(req)
		if(!errors.isEmpty()){
			return res.json({errors:errors.array()})
		}
		const {
			title,
			company,
			from,
			to,
			current,
			description,
			location

		} = req.body
	     const newExp = {
	     	title,
			company,
			from,
			to,
			current,
			description,
			location
	     }
	    try{
			const profile = await Profile.findOne({user:req.user.id})
			if(!profile){
				return res.status(400).json({msg:'unable to update profile'})
			}
	        profile.experience.unshift(newExp)
	        await profile.save()
	        return res.json(profile)
        }catch(err){
        	console.log(err.message)
        	return res.status(500).send('Server Error')
        }

	})
//delete experience
router.delete('/experience/:exp_id',auth,async (req,res) => {
	try{
       const profile = await Profile.findOne({user:req.user.id})
       const expIndex = profile.experience
       .map(exp => exp.id)
	   .indexOf(req.params.exp_id)
	   // if(expIndex == '-1'){
		  //  return res.json({msg:"Unable To Performe This Operation"})
	   // }
	   profile.experience.splice(expIndex,1)
	   await profile.save()
       return res.json(profile)
	}catch(err){
		console.log(err.message)
		return res.status(500).send('Server Error')
	}

})
//update user education
router.put('/education',[auth,[
	check("school","school is required").not().isEmpty(),
	check("from","date from is required").not().isEmpty(),
	check("fieldofstudy","fieldofstudy is required").not().isEmpty(),
	check("degree","degree is required").not().isEmpty()
	]],async (req,res) => {
		const errors = validationResult(req)
		if(!errors.isEmpty()){
			return res.json({errors:errors.array()})
		}
		const {
			school,
			degree,
			from,
			to,
			current,
			description,
			fieldofstudy

		} = req.body
	     const newEdu = {
	     	school,
			degree,
			from,
			to,
			current,
			description,
			fieldofstudy
	     }
	    try{
			const profile = await Profile.findOne({user:req.user.id})
			if(!profile){
				return res.status(400).json({msg:'unable to update profile'})
			}
	        profile.education.unshift(newEdu)
	        await profile.save()
	        return res.json(profile)
        }catch(err){
        	console.log(err.message)
        	return res.status(500).send('Server Error')
        }

	})
//delete education
router.delete('/education/:edu_id',auth,async (req,res) => {
	try{
       const profile = await Profile.findOne({user:req.user.id})
       const eduIndex = profile.education
       .map(edu => edu.id)
	   .indexOf(req.params.edu_id)
	   // if(expIndex == '-1'){
		  //  return res.json({msg:"Unable To Performe This Operation"})
	   // }
	   profile.education.splice(eduIndex,1)
	   await profile.save()
       return res.json(profile)
	}catch(err){
		console.log(err.message)
		return res.status(500).send('Server Error')
	}

})

module.exports = router;