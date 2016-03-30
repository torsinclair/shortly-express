var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Link = require('./link');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  links: function() {
    return this.hasMany(Link);
  },
  initialize: function() {
    this.on('creating', this.hashPassword, this);
  },
  hashPassword: function(model, attrs, options) {
    return new Promise(function(resolve, reject) {
      bcrypt.hash(model.attributes.password, null, null, function(err, hash) { // hash
        if (err) {
          reject(err);
        }
        model.set('password', hash);
        resolve(hash);
      });
    });
  }

});

module.exports = User;