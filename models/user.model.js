var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var userSchema = new Schema({
  nickname: String,
  email: {type: String, lowercase: true},
  provider: {type: String, default: 'local'},
  github: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  weibo: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  hashedPassword: String,
  salt: String,
  role: {type: String, default: 'user'},
  status: {type: Number, default: 0},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  sex: {type: Number, default: 1, min: 1, max: 2},
  header: {type: String, default: '/static/img/header.jpg' },
  showEmail: {type: Number, default: 1},
  birthday: {
    month: {type: Number, default: 0, min: 0, max: 12},
    day: {type: Number, default: 0, min: 0, max: 31}
  },
  blood: {type: Number, default: 0},
  summary: String,
  url: String,
  qqnumber: String,
  collectList: [{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }],
  friend: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

userSchema.virtual('password').set(function (password) { 
  this._password = password;
  this.salt = this.makeSalt();
  thi.hashedPassword = this.encryptPassword(password);
 }).get(function () { 
   return this._password;
  });