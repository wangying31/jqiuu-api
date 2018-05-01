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
  var title = req.body.title.trim();
  var content = req.body.content;
  var tag = req.body.tag.trim();
  var weather = req.body.weather.trim();
  var image = req.body.image;
  var status = req.body.status;
  var errorMsg;
  if(!title){
    errorMsg = '标题不能为空';
  }else if(title.length>10){
    errorMsg = '标题过长';
  }else if(!content){
    errorMsg = '内容不能为空';
  }else if(weather.length>5){
    errorMsg = '天气过长';
  }else if(!tag){
    errorMsg = '标签不能为空';
  }
  if(errorMsg){
    return res.status(401).send({errorMsg:errorMsg});
  }
  var data = {
    authId: req.user.id,
    title: title,
    weather: weather,
    content: content,
    tag: tag,
    status: status
  };

  if(image && (image.substr(0, config.root.length) == config.root)) {
    data.image = config.root + '/public/uploads/thumbnail' + image.substr(image.lastIndexOf('/'), image.length);
  }
  Article.createAsync(data).then(function (article) {
    return res.status(200).send({
      _id: article._id
    });
  }).catch(function (err) {
    return res.status(401).send({errorMsg: '提交失败'});
  });
};

exports.upload = function (req, res) {  
  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.uploadDir = __dirname + '/../../public/uploads/article/';
  form.parse(req, function (err, fields, files) {  
    if (err) {
      throw err;
    }
    var img = files.wangEditorH5File;
      var path = img.path;
      var type = img.type.split('/')[0];
      if (img.size > 1024*1024) {
        fs.unlink(path, function () {
          return res.status(401).send('error|图片超出最大限制');

        });
      } else if (type != 'image' && type != 'application') {
        fs.unlink(path, function() {
          return res.status(401).send('error|图片不合法');
        });
      } else {
        var urlPath = path.replace(/\\/g, '/');
        var url = config.root + '/public/uploads/article' + urlPath.substr(urlPath.lastIndexOf('/'), urlPath.length);
        imageMagick(urlPath).size(function (err, size) {  
          if (!err)
          var width,height,cropWidth,cropHeight;
          if (size.width > size.height) {
            height = 150;
            cropWidth = ((size.width/size.height) * 75 - 75);
          } else {
            width = 150;
            cropHeight = ((size.height/size.width) * 75 - 75);
          }
          imageMagick(urlPath).resize(width, height)
            .crop(150, 150, cropWidth ,cropHeight )
            .write( __dirname + '/../../public/uploads/thumbnail' + urlPath.substr(urlPath.lastIndexOf('/'), urlPath.length), function (err) {
                if (err) {
                    return res.status(401).send('error|上传图片失败');
                }
                res.status(200).send(url);
            });
        });
      }
  });
};

exports.tags = function(req, res){
  Article.distinctAsync('tag').then(function (tags) {  
    return res.status(200).send({
      tags: tags
    });
  }).catch(function (err) {  
    return res.status(401).send();
  });
};

exports.articlePage = function (req, res) {  
  var id;
  if (req.user) {
    id = req.user.id;
  };
  var aid = req.params.id;
  var articlePage,own;
  Article.findById(aid)
    .populate('authId','nickname header summary')
    .exec()
    .then(function (article) {
      articlePage = article;
      var num = id == article.authId._id?0:1;
      own = !num;
      return Article.findByIdAndUpdate(aid, {$inc: {pv: num}});
  }).then(function () {
    return User.findByIdAsync(id)
  }).then(function (user) {
    var collected = false;
    if(user) {
      var isCollect = _.findIndex(user.collectList, function (item) {
        return item.toString() == aid;
      });
      if(isCollect !== -1) collected = true;
    }
    return res.status(200).send({
      article: articlePage,
      collected: collected,
      own: own
    })
  }).catch(function (err) {
    return res.status(401).send();
  });
};

exports.articleList = function (req, res) {
  var time = parseInt(req.params.date);
  var tag = req.query.tag;
  var search = req.query.search;
  search = new RegExp(search,"i");
  var date = new Date(time);
  var condition = {
    status: {$gt: 0},
    created: {$lt: date }
  };
  if(tag) condition.tag = {$eq: tag};
  if(search) condition.title = search;
  Article.find(condition,'authId title content image tag created commentCount pv', {
    sort: {created: -1},
    limit: 10
  }).populate('authId','nickname')
    .exec()
    .then(function (article) {
    var strLen = 200;
    for(var i=0;i<article.length;i++) {
      article[i].content = article[i].content.replace(/<\/?[^>]*>/g,'');
      if(article[i].content.length>strLen) {
        article[i].content = article[i].content.substring(0, strLen) + "  ...";
      }
    }
    return res.status(200).send({
      article: article
    })
  }).catch(function (err) {
    return res.status(401).send();
  });
};
