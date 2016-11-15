var express = require('express');
var router = express.Router();
var db = require('../db/index');

// post chat responses - insert into db
router.post('/chat', (req, res) => {
    var message = req.body.comment.text;
    console.log('post request to /chat received', message);
    db('chats')
        .insert({
            comment: message
        })
        .then((data) => {
            return db('chats').select('*');
        })
        .then((data) => {
            console.log(data,' +++++this is data from chatRoutes')
            res.send(data)
        })
        .catch((err) => console.error(err));
});
//need this for users signing back in, otherwise info is passed around in state
// router.get('/chat', (req, res) => {
//     console.log('GET request to /chat received');
// //Abstract the database functions out into utilities directory
//     db('chats').select('*')
//         .then((data) => {
//             res.send(data);
//         })
//         .catch((err) => {
//             console.error(err);
//         })
// });

module.exports = router;
