var express = require('express');
var controller = require('./websites.controller');
var expressJwt = require('express-jwt');
var config = require('../../config');

var router = express.Router();

router.post('/addWebsites', expressJwt({secret: config.session.secrets}), controller.addWebsites);
router.get('/getWebsitesList', expressJwt({secret: config.session.secrets}), controller.getWebsitesList);
router.get('/:id/findById', expressJwt({secret: config.session.secrets}), controller.findById);
router.put('/:id/editWebsites', expressJwt({secret: config.session.secrets}), controller.editWebsites);
router.delete('/:id', expressJwt({secret: config.session.secrets}), controller.delWebsites);
router.put('/:id/websiteLike', controller.websiteLike);

module.exports = router;
