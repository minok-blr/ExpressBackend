var express = require('express');
var router = express.Router();
var questionController = require('../controllers/questionController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

/*
 * GET
 */
router.get('/', questionController.list);
router.get('/publish', requiresLogin, questionController.publish);
router.get('/mylist', requiresLogin, questionController.mylist);
router.get('/search/:id', questionController.sameTag);
router.get('/hottopics', questionController.hottopics);
router.get('/:id', questionController.show);

/*
 * POST
 */
router.post('/', questionController.create);
router.post('/answer/:id', questionController.addAnswer);
router.post('/answer/comment/:id', questionController.addComm2A);
router.post('/comment/:id', questionController.addComm2Q);

/*
 * PUT
 */
router.put('/:id', questionController.update);
router.put('/answer/:id', questionController.updateAnswer);
router.put('/rating/:id', questionController.updateRating);

/*
 * DELETE
 */
router.delete('/:id', questionController.remove);
router.delete('/answer/:id', questionController.removeAnswer);

module.exports = router;
