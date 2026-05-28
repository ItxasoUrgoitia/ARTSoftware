const { Pool } = require('pg');

// Configuración de la conexión
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,                
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