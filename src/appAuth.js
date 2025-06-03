import kitOAuth from './services/kitOAuth.js';
import session from 'express-session';
import passport from 'passport';

const logger = console

passport.use(kitOAuth());

export default function appAuth(app) {

    app.use(
        session({
            secret: "keyboard cat",
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true },
        })
    );

    app.get(
        "/app/authorize",
        (req, res, next) => {
            req.session.kitOAuthRedirect = req.query.redirect;
            next();
        },
        passport.authenticate("oauth2")
    );

    app.get(
        "/app/callback",
        passport.authenticate("oauth2"),
        (req, res) => res.redirect(req.session.kitOAuthRedirect)
    );
}