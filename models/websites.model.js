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

var Websites = mongoose.model("Websites", websitesSchema);
var Promise = require('bluebird');
Promise.promisifyAll(Websites);
Promise.promisifyAll(Websites.prototype);

module.exports = Websites;
