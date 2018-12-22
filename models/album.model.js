var mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });// mongo 3.4以后不支持$pushAll等,做兼容处理
var Schema = mongoose.Schema;

var AlbumSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  photo: String,
  thumbnail: String,
  name: String,
  likeCount: {type: Number, default: 0},
  likeToday: [{
    userIp: String,
    date: {type: Date, default: Date.now}
  }],
  status: {type: Number, default: 1},
  created: {type: Date, default: Date.now}
});

var Album = mongoose.model('Album', AlbumSchema);

var Promise = require('bluebird');
Promise.promisifyAll(Album);
Promise.promisifyAll(Album.prototype);

module.exports = Album;
