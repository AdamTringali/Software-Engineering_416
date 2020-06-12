import express from 'express'

import {
  registerUser,
  loginUser,
  logoutUser,
  verifyAuth,
  getProfile,
  updateProfile,
  verifyAdminAuth,
  addApplication,
  updateApplicationStatus
} from '../controllers/auth/auth_control.js'

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send({"status":"OK","serverdata":"data from server side"});
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);


// no json object needed
router.get('/verifyAuth',verifyAuth);
router.get('/verifyAdminAuth',verifyAdminAuth)
router.get('/profile',getProfile);

router.post('/profile',updateProfile);

router.post('/addapp',addApplication);
router.post('/updateapp',updateApplicationStatus)

export default router;
//module.exports = router;
