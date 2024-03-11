const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
/* const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController'); */

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
/*route.get('/connect', AuthController.getConnect);
route.get('/disconnect', AuthController.getDisconnect);
route.get('/users/me', UsersController.getMe);
route.post('/files', FilesController.postUpload);
route.get('/files', FilesController.getIndex);
route.get('/files/:id', FilesController.getShow);
route.put('files/:id/publish', FilesController.putPublish);
route.put('files/:id/unpublish', FilesController.putUnpublish);
route.get('/files/:id/data', FilesController.getFile); */

module.exports = router;

/* const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

module.exports = router; */
