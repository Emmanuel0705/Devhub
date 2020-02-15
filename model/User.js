const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
	name: {
		type:String,
		require:true
	},
	password:{
		type:String,
		require:true
	},
	email: {
		type:String,
		require:true,
		unique:true
	},
	avater:{
		type:String,
	},
	date:{
		type:Date,
		default:Date.now
	}
})
module.exports = User = mongoose.model('user',userSchema)