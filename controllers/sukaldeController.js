const pool = require('../models/db');

exports.getSukaldekoEskaerak = async (req, res) => {
    try {
        // Kontsulta: Azken 30 minutuetako eskaera-lerro guztiak batzea
        const query = `
            SELECT el.izena, SUM(el.kantitatea) as totala
            FROM eskaerak e
            JOIN eskaera_lerroak el ON e.id = el.eskaera_id
            WHERE e.data >= NOW() - INTERVAL '30 minutes'
            GROUP BY el.izena
        `;
        const result = await pool.query(query);

        // Zenbatzaileak hasieratu
        let kopuruKodilloa = 0;
        let kopuruOilaskoa = 0;
        let kopuruEdariak = 0;

        // Edarien zerrenda (hauek guztiak elkartuko dira "Edariak" blokean)
        const edariak = [
            'Alkohol bako garagardoa', 
            'Gluten bako garagardoa', 
            'Garagardo jarra', 
            'Ur botilla'
        ];

        // Emaitzak irakurri eta bakoitza bere lekuan sartu
        result.rows.forEach(row => {
            const kantitatea = parseInt(row.totala, 10) || 0;
            const izena = row.izena.trim();

            if (izena === 'Kodilloa') {
                kopuruKodilloa += kantitatea;
            } else if (izena === 'Oilaskoa') {
                kopuruOilaskoa += kantitatea;
            } else if (edariak.includes(izena)) {
                kopuruEdariak += kantitatea;
            }
        });

        // Hiru zenbakiak bidali frontend-ari
        res.json({
            kodilloa: kopuruKodilloa,
            oilaskoa: kopuruOilaskoa,
            edariak: kopuruEdariak
        });

    } catch (error) {
        console.error('Errorea sukaldeko datuak ekartzean:', error);
        res.status(500).json({ error: 'Zerbitzari errorea' });
    }
};