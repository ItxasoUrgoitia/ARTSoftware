const express = require('express');
const router = express.Router();
const path = require('path');
const { isAuthenticated } = require('../middleware/auth'); 

const { kobratuEskaera, getMenuEguneko } = require('../controllers/cajaController');

router.use(isAuthenticated);

// HTML pantaila erakutsi
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/caja.html'));
});

// LERRO BERRIA: Kaxarako produktuak eskatzeko
router.get('/api/menu', getMenuEguneko);

// LERRO BERRIA: Backend-erako API deia eskaera kobratzeko
router.post('/api/kobratu', kobratuEskaera);

module.exports = router;