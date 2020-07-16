var express = require('express');
var secured = require('../middleware/secured');
var router = express.Router();



/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/', function(req, res, next) {
  const { _raw, _json, ...userProfile } = req.user;
  res.send({
    id: userProfile.id,
    userProfile: userProfile
  })
})


module.exports = router;
