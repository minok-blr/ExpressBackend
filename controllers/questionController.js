var QuestionModel = require('../models/questionModel.js');
var AnswerModel = require('../models/answerModel.js');
var CommentModel = require('../models/commentModel.js');
const Console = require("console");

setInterval(function() {
    QuestionModel.updateMany({}, {$set: {'5minviewcount': 0}}, function (){});
    console.log("---NOTICE: All answers' viewcounts are cleared after 5 minutes---");
}, 300 * 1000);

/**
 * questionController.jss
 *
 * @description :: Server-side logic for managing questions.
 */
module.exports = {

    addComm2A: function (req, res) {
        var comm = new CommentModel({
            content : req.body.comment,
            author: req.session.userId,
            answer: req.params.id,
            question: req.body.hiddenGuy,
            belongsToA: true,
        });
        var id = req.params.id;
        console.log("id: " + id);
        AnswerModel.findOneAndUpdate({'_id': id}, {$push: {comments: comm.id}}).exec(function (err, answer) {
            //console.log("Comm._id: "+comm._id);
            //answer.comments.push(comm._id);

            answer.save(function (err, result) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating comment',
                        error: err
                    });
                }
                console.log("Answer saved!");
            })

        })

        comm.save(function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating comment',
                    error: err
                });
            }
        })
        res.redirect('/questions/'+req.body.hiddenGuy);
    },

    addComm2Q: function (req, res) {
        var comm = new CommentModel({
            content : req.body.comment,
            author: req.session.userId,
            answer: req.params.id,
            question: req.body.hiddenGuy,
            belongsToQ: true
        });
        console.log("Logging answer ID: " + comm);
        comm.save(function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating comment',
                    error: err
                });
            }
        })
        res.redirect('/questions/'+req.body.hiddenGuy);
    },
    /**
     * questionController.create()
     */
    addAnswer: function (req, res) {
        console.log(req);
        var answer = new AnswerModel({
            content : req.body.answer,
            author: req.session.userId,
            question: req.params.id,
            ownerOfQuestion: req.body.hiddenGuy
        });

        answer.save(function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating question',
                    error: err
                });
            }
            console.log(answer.question);
            console.log("FUNCTION OUT");
            return res.redirect('/questions/'+req.params.id);
            //return res.status(201).json(question);
        });

    },

    /**
     * questionController.list()
     */
    list: function (req, res) {
        QuestionModel.find({})
            .sort({createdAt: -1})
            .populate('author')
            .exec(function(err,questions){
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question.',
                    error: err
                });
            }
            //console.log(questions);
            var data = [];
            data.questions = questions;

            return res.render('index', data);
        });
    },

    /**
     * questionController.list()
     */
    sameTag: function (req, res) {
        var id = req.params.id;
        console.log(id);
        QuestionModel.find({tags: id})
            .sort({createdAt: -1})
            .populate('author')
            .exec(function(err,questions){
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting question.',
                        error: err
                    });
                }
                console.log(questions);
                var data = [];
                data.questions = questions;

                return res.render('index', data);
            });
    },


    hottopics: function (req, res) {
        // here a query to the database is made to select all documents
        // with 5MinuteViewCount field
        // then sort by Descending
        // choose top 3
        // render hot topics view
        QuestionModel.find().sort({'5minviewcount': -1}).limit(3).exec(
            function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting my questions.',
                        error: err
                    });
                }
                var data = [];
                data.questions = questions;
                return res.render('question/faq', data);
            }
        )
    },
    /**
     * questionController.show()
     */
    removeAnswer: function (req, res) {
        var id = req.params.id;
        AnswerModel.findByIdAndRemove(id, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the question.',
                    error: err
                });
            }
            return res.redirect('/questions/' + answer.question);
        });
    },

    show: function (req, res) {
        var id = req.params.id;
        QuestionModel.findOneAndUpdate({_id: id}, {$inc : {'viewcount' : 1, '5minviewcount': 1}})
            .populate('author')
            .exec(function (err, question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting question.',
                        error: err
                    });
                }
                if (!question) {
                    return res.status(404).json({
                        message: 'No such question'
                    });
                }

                AnswerModel.find({question: question._id})
                    .sort({createdAt: -1})
                    .populate('author')
                    .populate({
                        path:     'comments',
                        populate: { path:  'author',
                            model: 'user' }
                    })
                    .exec(function (err, answer) {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when getting Answers.',
                                error: err
                            });

                        }
                        if(answer.length === 0){
                            var data = [];
                            data.question = question;
                            return res.render('question/single-comm', data);
                        }

                        CommentModel.find({question: question._id}).populate('author').exec(function (err, comms) {
                            var data = [];
                            var questionComms = [];


                            comms.forEach(el => {
                                if(el.belongsToQ == true){
                                    questionComms.push(el);
                                }
                            })

                            data.questcomms = questionComms;
                            data.question = question;
                            data.answers = answer;
                            data.chosen = answer.find(result => result.isChosen == true);

                            console.log(data.answers);
                            data.answers.forEach(ans => {
                                if(ans.author._id == req.session.userId){
                                    ans.canDelete = true;
                                }
                                if(question.author._id == req.session.userId){
                                    ans.canChoose = true;
                                }
                            })
                            //console.log(data);
                            return res.render('question/single-comm', data);
                        })
                    })
            });
        },

    /**
     * questionController.create()
     */
    create: function (req, res) {
        req.body.tags = req.body.tags.replace(/\s+/g, "");
        req.body.tags = req.body.tags.split(",");
        var question = new QuestionModel({
			title : req.body.title,
			content : req.body.content,
			tags : req.body.tags,
            author: req.session.userId
        });

        question.save(function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating question',
                    error: err
                });
            }
            return res.redirect('/');
            //return res.status(201).json(question);
        });
    },

    /**
     * questionController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        QuestionModel.findOne({_id: id}, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }

            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }

            question.title = req.body.title ? req.body.title : question.title;
			question.content = req.body.content ? req.body.content : question.content;
			question.tags = req.body.tags ? req.body.tags : question.tags;

			
            question.save(function (err, question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating question.',
                        error: err
                    });
                }

                return res.json(question);
            });
        });
    },

    updateRating: function (req, res) {
        var id = req.params.id;
        var type = req.body.vote;

        AnswerModel.findOne({_id: id}, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer',
                    error: err
                });
            }
            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            var votedBy = answer.voters.find(result => result == req.session.userId);
            console.log("Voted by: " + votedBy);
            console.log(answer.author._id);

            if(type == "up" && (votedBy != req.session.userId)){
                answer.rating += 1;
                answer.voters = req.session.userId;
            }
            else if(type == "down" && (votedBy != req.session.userId)){
                answer.rating -= 1;
                answer.voters = req.session.userId;
            }
            else {
                return res.redirect('/questions/'+answer.question._id);
            }

            answer.save(function (err, answer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating answer.',
                        error: err
                    });
                }

                return res.redirect('/questions/'+answer.question._id);
            });
        });
    },
    updateAnswer: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({_id: id}, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer',
                    error: err
                });
            }
            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            answer.isChosen = true;
            var quest = answer.question;
            AnswerModel.updateMany({question: quest}, {$set: {'isChosen':false}}, function (){
            });


            answer.save(function (err, answer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating answer.',
                        error: err
                    });
                }

                return res.redirect('/questions/'+answer.question._id);
            });
        });
    },

    /**
     * questionController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        QuestionModel.findByIdAndRemove(id, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the question.',
                    error: err
                });
            }

            return res.redirect('/questions/mylist');
        });
    },

    publish: function(req, res){
        return res.render('question/publish');
    },
    
    mylist: function (req, res) {
        QuestionModel.find({author: req.session.userId})
            .populate('author')
            .exec(function (err, quests){
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting my questions.',
                    error: err
                });
            }
            var data = [];
            data.questions = quests;
            return res.render('question/mylist', data);
        })
    }
};
