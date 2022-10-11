var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var commentSchema = new Schema({
    'content' : String,
    'author': {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'answer':{
        type: Schema.Types.ObjectId,
        ref: 'answer'
    },
    'question':{
        type: Schema.Types.ObjectId,
        ref: 'question'
    },
    'belongsToQ': {
        type: Boolean,
        default: false
    },
    'belongsToA': {
        type: Boolean,
        default: false
    }

}, {timestamps:true});

module.exports = mongoose.model('comment', commentSchema);