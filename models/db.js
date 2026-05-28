const { Pool } = require('pg');

// Configuración de la conexión
const pool = new Pool({
  user: 'postgres',           // Usuario por defecto
  host: 'localhost',          //(HAU GERO ALDATU INBIKODA)
  database: 'ARTRugby',       // El nombre de mi base de datos
  password: '2_datubase_2',  
  port: 5432,                 
});

// Probatu konexioa (Heartbeat)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Errorea postgresql-era konektatzean:', err.stack);
  } else {
    console.log('✅ Konexioa arrakastaz postgresql-era. Datu-basea prest.');
  }
});

module.exports = pool;