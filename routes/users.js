var express = require('express');
var secured = require('../middleware/secured');
var router = express.Router();


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/', secured(), function(req, res, next) {
  const { _raw, _json, ...userProfile } = req.user;
  res.send({
    id: userProfile.id,
    userProfile: userProfile
  })
  // try {
  //   const result = await User.find().exec()
  //   res.send(result)
  // } catch (err) {
  //   res.send(err)
  // }
})

// router.post('/', secured(), async function(req, res) {
//   const { _raw, _json, ...userProfile } = req.user;
//   try {
//     const user = new User(req.user)
//   }
// })

router.get('/cool', function(req, res, next) {
  res.send("you're so cool");
})

module.exports = router;
