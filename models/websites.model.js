var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var websitesSchema = new Schema({
  title: String,
  type: String,
  icon: String,
	info: String,
	link: String,
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now },
	likeNum: { type:Number, default:1 },
  browseNum: { type:Number, default:0 },
  likeToday: [{
    userIp: String,
    date: {type: Date, default: Date.now}
  }]
});
// db.websites.insert({
//   title:'gulp',
//   type:'工具',
//   icon:'https://www.gulpjs.com.cn/img/gulp.jpg',
//   info:'一个自动化构建工具',
//   link:'https://www.gulpjs.com.cn',
//   likeNum:'21',
//   browseNum:'11'
// })

var Websites = mongoose.model("Websites", websitesSchema);
var Promise = require('bluebird');
Promise.promisifyAll(Websites);
Promise.promisifyAll(Websites.prototype);

module.exports = Websites;
