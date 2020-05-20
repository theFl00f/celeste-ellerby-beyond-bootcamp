var express = require('express');
var Message = require('../models/message')
var router = express.Router();

//admin only-- delete all messages

// Message.deleteMany({}, function(err) {
//     if (err) console.log(err);
//     console.log('successful deletion')
//   });

router.post('/', async (req, res) => {
    console.log('post received')
    console.log(req.body)
    try {
        var message = new Message(req.body);
        var result = await message.save();
        res.send(result)
        
    } catch (err) {
        res.status(500).send(err)
    }
});

router.get('/', async(req, res) => {
    try {
        var result = await Message.find().exec();
        res.send(result)
    } catch (err) {
        res.status(500).send(err);
    }
})

module.exports = router;