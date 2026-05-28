const path = require('path');
//login pantaila erakutsi
exports.renderLogin = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
}

//erabiltzailea login egin
exports.loginUser = (req, res) => {
    const { pin } = req.body;
    
    if (pin === 'CCCC') { //CAJA
        req.session.role = 'caja';
        res.json({ success: true, redirect: '/caja' });
    } else if (pin === 'SSSS') { //SUKALDEA
        req.session.role = 'sukaldea';
        res.json({ success: true, redirect: '/sukalde' });
    } else if (pin === 'EEEE') { //Estoka
        req.session.role = 'stock';
        res.json({ success: true, redirect: '/stock' });
    } else { // PIN okerra
        res.json({ success: false, message: 'PIN okerra' });
    }
};

//erabiltzailea logout egin
exports.logoutUser = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};