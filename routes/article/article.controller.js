var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var fs = require('fs');
var formidable = require('formidable');
var gm = require('gm');
var imageMagick = gm.subClass({imageMagick: true});
var _ = require('lodash');
var config = require('../../config');

exports.addArticle = function (req, res) {  
  
};
