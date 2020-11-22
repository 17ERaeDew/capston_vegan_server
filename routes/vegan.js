var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/gettext', (req, res) => {
  console.log('gettext success');
  return res.json( "text true" );
});

router.use('/sendText', (req, res) => {
  const { text, vegan } = req.body;//배열로 넘어옴
  console.log('sendText success');
  return res.json( { text: text } );
});

module.exports = router;