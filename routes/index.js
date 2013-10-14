var translate = require('../translate.js');
var config = require('../config.js')

exports.index = function(req, res){
  res.render('index', { title: 'HuGu', t: translate, config: config});
};