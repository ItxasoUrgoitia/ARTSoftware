require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();


app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'arrasate-rugby-secret',
    resave: false,
    saveUninitialized: false, 
    cookie: { secure: false } 
}));

//Routes
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const cajaRoutes = require('./routes/cajaRoutes');
const sukaldeRoutes = require('./routes/sukaldeRoutes');

//hasieran bidali login-era
app.get('/', (req, res) => {
    res.redirect('/login'); 
});

app.use('/', authRoutes);
app.use('/stock', stockRoutes);
app.use('/caja', cajaRoutes);
app.use('/sukalde', sukaldeRoutes);

//Zerbitzariak zein portuan entzun behar duen adierazten du
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`IREKI HAU: http://localhost:${PORT}`);
});