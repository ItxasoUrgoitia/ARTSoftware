const express = require('express');
const router = express.Router();
const path = require('path');
const { isAuthenticated } = require('../middleware/auth'); 

// Kontrolatzailea inportatu
const { getSukaldekoEskaerak } = require('../controllers/sukaldeController');

router.use(isAuthenticated);
// Backend-erako API deia (JS-ak hemendik ekarriko ditu datuak)
router.get('/api/eskaerak', getSukaldekoEskaerak);
// HTML pantaila erakutsi
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/sukalde.html'));
});



module.exports = router;