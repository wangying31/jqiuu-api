var mongoose = require('mongoose');
var Album = mongoose.model('Album');
var fs = require('fs');
var formidable = require('formidable');
var gm = require('gm');
var imageMagick = gm.subClass({imageMagick: true});
var _ = require('lodash');
var config = require('../../config');

exports.addPhoto = function (req, res) { 
  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.uploadDir = __dirname + '/../../public/uploads/album/';
  form.parse(req, function (err, fields, files) {  
    if (err) {
      throw err;
    }
    var img = files.photo;
    var path = img.path;
    var type = img.type.split('/')[0];
    if(img.size > 1024*1024) {
			fs.unlink(path, function () {
				return res.send({errorMsg: '图片超出最大限制'});
			});
		}else if(type != 'image' && type != 'application'){
			fs.unlink(path, function() {
				return res.send({errorMsg: '图片不合法'});
			});
		}else {
			var urlPath = path.replace(/\\/g, '/');
			var photoPath = urlPath.substr(urlPath.lastIndexOf('/'), urlPath.length);
			var url = config.root + '/public/uploads/album' + photoPath;

			imageMagick(urlPath).resize(350, null)
				.write(__dirname + '/../../public/uploads/thumbnail' + photoPath, function (err) {
					if (err) {
						return res.send({errorMsg: '上传图片失败'});
					}
					var thumbnailUrl = config.root + '/public/uploads/thumbnail' + photoPath;
					var data = {
						userId: req.user.id,
						photo: url,
						thumbnail: thumbnailUrl
					};
					Album.createAsync(data).then(function (photo) {
						return res.status(200).send({
							photo: photo
						});
					}).catch(function (err) {
						return res.status(401).send({errorMsg: '上传图片失败'});
					});
				});
		}
  });
};

exports.photoList = function (req, res) {  
	var time = parseInt(req.params.date);
	var date = new Date(time);
	var condition = {
		status: {$gt: 0},
		created: {$lt: date}
	};
	Album.find(condition
	, 'userId photo thumbnail created likeCount', {
		sort: {created: -1},
		limit: 20
	}).populate('userId', 'nickname')
	.exec()
	.then(function (photo) { 
		return res.status(200).send({
			photo: photo
		})
	 }).catch(function (err) {  
		 return res.status(401).send();
	 });
};
