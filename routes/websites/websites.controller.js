var mongoose = require('mongoose');
var Websites = mongoose.model('Websites');
var User = mongoose.model('User');
var _ = require('lodash');
var config = require('../../config');

exports.addWebsites = function (req, res) {  
  var reqs = req.body, errorMsg = '';
  var title = reqs.title;
  var icon = reqs.icon;
  var type = reqs.type;
  var info = reqs.info;
  var link = reqs.link;
  var id = req.user.id;
  User.findByIdAsync(id).then(function(user) {
    if (user.role !== 'admin') {
      return res.status(401).send({errorMsg:'没有权限操作!'});
    }
  })
  if(!title){
    errorMsg = '标题不能为空';
  }else if(title.length>10){
    errorMsg = '标题过长';
  }else if(!info){
    errorMsg = '内容不能为空';
  }else if(!icon){
    errorMsg = '图标不能为空';
  }else if(!type){
    errorMsg = '类型不能为空';
  }else if (!link){
    errorMsg = '链接不能为空';
  }
  if(errorMsg){
    return res.status(401).send({errorMsg:errorMsg});
  }
  var data = {
    title: title,
    icon: icon,
    type: type,
    info: info,
    link: link,
    likeNum: Math.ceil(Math.random()*50 + 20),
    browseNum: Math.ceil(Math.random()*50 + 30)
  };
  Websites.createAsync(data).then(function (websites) {
    return res.status(200).send({
      _id: websites._id
    });
  }).catch(function (err) {
    return res.status(401).send({errorMsg: '提交失败'});
  });
};

exports.getWebsitesList = function (req, res) {
  // var search = req.query.search;
  // search = new RegExp(search,"i");
  // var condition = {
  //   status: {$gt: 0},
  //   created: {$lt: date }
  // };
  // if(search) condition.title = search;
  Websites.find({},'title icon type info link likeNum browseNum', {
    sort: {browseNum: -1}
  }).then(function (websites) {
    // var strLen = 200;
    // for(var i=0;i<websites.length;i++) {
    //   websites[i].content = websites[i].content.replace(/<\/?[^>]*>/g,'');
    //   if(websites[i].content.length>strLen) {
    //     websites[i].content = websites[i].content.substring(0, strLen) + "  ...";
    //   }
    // }
    return res.status(200).send({
      websites: websites
    })
  }).catch(function (err) {
    return res.status(401).send();
  });
};

exports.findById = function (req, res) { 
  var wid = req.params.id;
  Websites.findByIdAsync(wid).then(function (websites) {
    return res.status(200).send({
      websites: websites
    })
  }).catch(function (err) {
    return res.status(401).send();
  });
};

exports.editWebsites = function (req,res) {
  console.log(req)
  var reqs = req.body, errorMsg = '';
  var wid = reqs.wid;
  var title = reqs.title;
  var icon = reqs.icon;
  var type = reqs.type;
  var info = reqs.info;
  var link = reqs.link;
  var id = req.user.id;
  if(!title){
    errorMsg = '标题不能为空';
  }else if(title.length>10){
    errorMsg = '标题过长';
  }else if(!info){
    errorMsg = '内容不能为空';
  }else if(!icon){
    errorMsg = '图标不能为空';
  }else if(!type){
    errorMsg = '类型不能为空';
  }else if (!link){
    errorMsg = '链接不能为空';
  }
  if(errorMsg){
    return res.status(401).send({errorMsg: errorMsg});
  }
  User.findByIdAsync(id).then(function(user) {
    if (user.role !== 'admin') {
      return res.status(401).send({errorMsg:'没有权限操作!'});
    }
  })

  Websites.findByIdAsync(wid).then(function (websites) {
    console.log(req.body)
    _.assign(websites, req.body);
    websites.updated = new Date();
    return websites.saveAsync()
  }).then(function (websites) {
    return res.status(200).send({
      websites: websites
    })
  }).catch(function (err) {
    return res.status(401).send();
  })
};

exports.delWebsites = function (req, res) {
  var id = req.user.id;
  var wid = req.params.id;
  User.findByIdAsync(id).then(function(user) {
    if (user.role !== 'admin') {
      return res.status(401).send({errorMsg:'没有权限操作!'});
    }
  })
  Websites.findByIdAsync(wid).then(function (websites) {  
    // if (websites.authId != id) throw new Error();
    return Websites.findByIdAndRemoveAsync(wid);
  }).then(function () {  
    return res.status(200).send({success: true});
  }).catch(function (err) {  
    return res.status(401).send();
  });
};

exports.websiteLikeNum = function (req, res) {  
	var wid = req.params.id;
  var ip = req.ip;
  console.log('========ip=======' + ip);
  console.log('========id=======' + wid);
	var getToday = function (value) {
		var date = new Date(value);
		var dateToday = new Date();
		return date.getFullYear() === dateToday.getFullYear() && date.getMonth() === dateToday.getMonth() && date.getDate() === dateToday.getDate();
	};
	Websites.findByIdAsync(wid).then(function (website) {  
		var isLiked = _.findIndex(website.likeToday, {'userIp': ip});
		if(isLiked !== -1 && getToday(website.likeToday[isLiked].date)) {
			throw new Error();
		}else if(isLiked !== -1){
			website.likeNum += 1;
			website.likeToday[isLiked].date = new Date();
		}else{
			website.likeNum += 1;
			website.likeToday.push({
				userIp: ip,
				date: new Date()
			})
		}
		return website.saveAsync()
	}).then(function (website) {
		return res.status(200).send({
			wid: website._id,
			likeNum: website.likeNum
		});
	}).catch(function (err) {
		return res.status(401).send({errorMsg: '今天已经点过赞啦'});
	});
};

exports.websitebrowseNum = function (req, res) {  
  var wid = req.params.id;
	Websites.findByIdAsync(wid).then(function (website) {  
    website.browseNum += 1;
		return website.saveAsync()
	}).then(function (website) {
		return res.status(200).send({
			wid: website._id,
			browseNum: website.browseNum
		});
	}).catch(function (err) {
		return res.status(401).send({errorMsg: '异常'});
	});
}

exports.types = function(req, res){
  Websites.distinctAsync('type').then(function (types) {  
    return res.status(200).send({
      types: types
    }); 
  }).catch(function (err) {  
    return res.status(401).send();
  });
};
