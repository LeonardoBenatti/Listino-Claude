/**
 * routes/auth.js — Rotte di autenticazione
 *
 * Gestisce login e logout degli utenti.
 * Le credenziali vengono lette dal file .env.
 */

const express = require('express');
const router = express.Router();

/**
 * GET / — Mostra la pagina di login
 * Se l'utente è già autenticato, reindirizza direttamente al listino.
 */
router.get('/', (req, res) => {
    // Se già autenticato, vai dritto al listino
    if (req.session && req.session.authenticated) {
        return res.redirect('/listino');
    }
    // Mostra la pagina login (senza errori la prima volta)
    res.render('login', { error: null });
});

/**
 * POST /login — Gestisce il tentativo di login
 * Valida username e password contro le variabili d'ambiente.
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validazione: campi obbligatori
    if (!username || !password) {
        return res.render('login', {
            error: 'Inserisci username e password.'
        });
    }

    // Controlla le credenziali
    const validUser = process.env.ADMIN_USER;
    const validPass = process.env.ADMIN_PASS;

    if (username === validUser && password === validPass) {
        // Login riuscito: imposta la sessione
        req.session.authenticated = true;
        req.session.username = username;
        return res.redirect('/listino');
    }

    // Credenziali errate
    return res.render('login', {
        error: 'Credenziali non valide. Riprova.'
    });
});

/**
 * GET /logout — Distrugge la sessione e reindirizza al login
 */
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Errore durante il logout:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;
