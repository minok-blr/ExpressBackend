var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var questionSchema = new Schema({
	'title' : String,
	'content' : String,
	'tags' : Array,
	'viewcount': Number,
	'author': {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	'5minviewcount': Number
}, {timestamps:true});

module.exports = mongoose.model('question', questionSchema);
