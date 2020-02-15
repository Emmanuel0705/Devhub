const mongoose  = require('mongoose');
const Schema = mongoose.Schema();

const PostSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'user'
	},
	text:{
		type:String,
		required:true
	},
	avater:{
		type:String
	},
	name:{
		type:String
	},
	likes:[ 
	  {
         user:{
         	type:mongoose.Schema.Types.ObjectId,
         	ref:'user'
         }
	  }
	],
	comments:[
	   {
	   	user:{
	   		type:mongoose.Schema.Types.ObjectId,
	   		ref:'user'
	   	},
	   	text:{
	   		type:String,
	   		required:true
	   	},
	   	avater:{
	   		type:String
	   	},
	   	name:{
	   		type:String
	   	},
	   	date:{
	   		type:Date,
	   		default:Date.now
	   	}
	   }
	],
	date:{
		type:Date,
		default:Date.now
	}

})
module.exports = Post = mongoose.model('post',PostSchema)