const pool = require('../models/db');

exports.getMenuEguneko = async (req, res) => {
    const eguna = req.query.eguna || 'ostirala';
    
    let produktuIzenak = [];
    if (eguna === 'osteguna') {
        produktuIzenak = ['Garagardo jarra', 'Gluten bako garagardoa', 'Alkohol bako garagardoa', 'Ur botilla', 'Jarra utzik', 'Pintxopote', 'Saltxitxa', 'Oilaskoa', 'Patatak', 'Burrito', 'Kodilloa'];
    } else if (eguna === 'zapatua') {
        produktuIzenak = ['Garagardo jarra', 'Gluten bako garagardoa', 'Alkohol bako garagardoa', 'Ur botilla', 'Jarra utzik', 'Kodilloa', 'Saltxitxa', 'Oilaskoa', 'Patatak', 'Paella'];
    } else {
        produktuIzenak = ['Garagardo jarra', 'Gluten bako garagardoa', 'Alkohol bako garagardoa', 'Ur botilla', 'Jarra utzik', 'Kodilloa', 'Saltxitxa', 'Oilaskoa', 'Patatak'];
    }

    try {
        // Kontsulta aurreratua: Elementuak ARRAY-aren ordena berean ekartzeko
        const query = `
            SELECT m.* FROM unnest($1::text[]) WITH ORDINALITY AS u(izena, ord)
            JOIN menu m ON TRIM(m.izena) ILIKE TRIM(u.izena)
            ORDER BY u.ord;
        `;
        const result = await pool.query(query, [produktuIzenak]);
        res.json(result.rows);
    } catch (error) {
        console.error('Errorea menua kargatzean:', error);
        res.status(500).json({ success: false, msg: 'Errorea menua kargatzean' });
    }
};

exports.kobratuEskaera = async (req, res) => {
    const { eskaera, totala } = req.body;

    if (!eskaera || eskaera.length === 0) {
        return res.status(400).json({ success: false, msg: 'Saskia hutsik dago' });
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); 
        const insertEskaera = await client.query(
            'INSERT INTO eskaerak (totala) VALUES ($1) RETURNING id',
            [totala]
        );
        const eskaeraId = insertEskaera.rows[0].id;

        for (let item of eskaera) {
            await client.query('UPDATE menu SET stock = stock - $1 WHERE id = $2', [item.kantitatea, item.id]);
            await client.query(
                'INSERT INTO eskaera_lerroak (eskaera_id, produktu_id, izena, kantitatea) VALUES ($1, $2, $3, $4)',
                [eskaeraId, item.id, item.izena, item.kantitatea]
            );
        }

        await client.query('COMMIT'); 
        res.json({ success: true, msg: 'Salmenta ondo erregistratu da eta stock-a jaitsi da.' });
        
    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Errorea kobratzean:', error);
        res.status(500).json({ success: false, msg: 'Zerbitzari errorea kobratzean' });
    } finally {
        client.release(); 
    }
};