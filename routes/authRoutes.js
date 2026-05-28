const express = require('express');
const router = express.Router();
const { renderLogin, loginUser, logoutUser } = require('../controllers/authController');

// login pantaila bistaratu
router.get('/login', renderLogin);

//sartutakoa egiaztatu eta saioa hasi
router.post('/login', loginUser);

// logout
router.post('/logout', logoutUser);

module.exports = router;