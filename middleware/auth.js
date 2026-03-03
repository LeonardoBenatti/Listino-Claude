/**
 * middleware/auth.js — Middleware di autenticazione
 *
 * Protegge le rotte che richiedono accesso autenticato.
 * Se l'utente non è autenticato, viene reindirizzato alla pagina di login.
 */

/**
 * Verifica che l'utente sia autenticato tramite sessione.
 * Se req.session.authenticated è true, passa al prossimo middleware.
 * Altrimenti, reindirizza a '/'.
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }
    // L'utente non è autenticato: redirect alla pagina di login
    return res.redirect('/');
}

module.exports = requireAuth;
