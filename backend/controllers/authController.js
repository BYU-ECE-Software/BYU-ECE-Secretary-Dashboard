const passport = require('passport');

exports.login = passport.authenticate('saml');

// Callback route
exports.callback = (req, res, next) => {
    passport.authenticate("saml", { failureRedirect: "/login" }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect("/login");
        
        req.logIn(user, (err) => {
            if (err) return next(err);
            console.log("User Authenticated:", req.user);
            res.redirect("/admin"); // Redirect after successful login
        });
    })(req, res, next);
};

// Logout route
exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
};

// Authentication status check
exports.status = (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false });
    }
};