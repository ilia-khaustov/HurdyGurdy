var translate = require('../translate.js');

exports.index = function(req, res){
  res.render('index', { title: 'HurdyGurdy', t: translate });
};