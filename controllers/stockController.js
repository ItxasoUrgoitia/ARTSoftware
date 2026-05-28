const pool = require('../models/db');

// 1. Produktu guztiak lortu eta frontend-ari bidali
exports.getProduktuak = async (req, res) => {
    try {
        // Taularen izena "menu" da.
        // "precio AS prezioa" jartzen dugu, stock.js fitxategiak "prezioa" izenarekin ere maneiatu ahal izateko.
        const result = await pool.query('SELECT id, izena, stock, precio AS prezioa, precio FROM menu ORDER BY id ASC');
        
        res.json(result.rows);
    } catch (error) {
        console.error('Errorea datu-basetik menu-a ekartzean:', error);
        res.status(500).json({ error: 'Zerbitzari errorea datuak kargatzean' });
    }
};

// 2. Produktu baten stocka edo prezioa eguneratu
exports.eguneratuProduktua = async (req, res) => {
    const produktuId = req.params.id; 
    let { eremua, balioa } = req.body; 

    if (eremua === 'prezioa') {
        eremua = 'precio';
    } else if (eremua !== 'stock') {
        return res.status(400).json({ success: false, msg: 'Eremu baliogabea' });
    }

    try {
        const query = `UPDATE menu SET ${eremua} = $1 WHERE id = $2`;
        await pool.query(query, [balioa, produktuId]);
        
        res.json({ success: true, msg: 'Ondo eguneratu da' });
    } catch (error) {
        console.error(`Errorea ${eremua} eguneratzean:`, error);
        res.status(500).json({ success: false, msg: 'Zerbitzari errorea eguneratzean' });
    }
};