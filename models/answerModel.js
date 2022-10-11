var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var answerSchema = new Schema({
    'content' : String,
    'author': {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'question':{
        type: Schema.Types.ObjectId,
        ref: 'question'
    },
    'ownerOfQuestion': {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'canDelete': {
        type: Boolean,
        default: false
    },
    'isChosen': {
        type: Boolean,
        default: false
    },
    'canChoose': {
        type: Boolean,
        default: false
    },
    'rating': {
        type: Number,
        default: 0
    },
    'voters': Array,
    'comments': [{
        type: Schema.Types.ObjectId,
        ref: 'comment'
    }]
}, {timestamps:true});

module.exports = mongoose.model('answer', answerSchema);