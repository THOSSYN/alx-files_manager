const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');
const route = express.Router();

route.get('/status', AppController.getStatus);
route.get('/stats', AppController.getStats);
route.post('/users', UsersController.postNew);
route.get('/connect', AuthController.getConnect);
route.get('/disconnect', AuthController.getDisconnect);
route.get('/users/me', UsersController.getMe);
route.post('/files', FilesController.postUpload);
route.get('/files', FilesController.getIndex);
route.get('/files/:id', FilesController.getShow);
route.put('files/:id/publish', FilesController.putPublish);
route.put('files/:id/unpublish', FilesController.putUnpublish);
route.get('/files/:id/data', FilesController.getFile);

module.exports = route;
