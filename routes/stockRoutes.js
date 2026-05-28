const express = require('express');
const router = express.Router();
const path = require('path');
// 1. Zure middleware berria inportatu (authRole-ren ordez)
const { isAuthenticated } = require('../middleware/auth'); 

const { getProduktuak, eguneratuProduktua } = require('../controllers/stockController');

router.use(isAuthenticated);

router.get('/api/productos', getProduktuak);
router.put('/api/eguneratu/:id', eguneratuProduktua);

router.get('/', (req, res) => {
    // Hemen 'caja.html', 'sukalde.html' edo 'stock.html' jarriko duzu, fitxategiaren arabera
    res.sendFile(path.join(__dirname, '../views/stock.html'));
});

module.exports = router;