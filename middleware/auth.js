// Ibilbideak babesteko middlewarea
function isAuthenticated(req, res, next) {
    //console.log('Checking session...');
    if (!req.session.role) {
        console.log('No user logged in, redirecting to /auth/login');
        return res.redirect('/login');
    }
    //console.log('User is authenticated, proceeding');
    next();
}
module.exports = {
    isAuthenticated
};